import { Request, Response } from "express";
import { User, Enquiry, Announcement, Notification } from "../models";
import { AuthRequest, requireRole } from "../middleware/auth";
import { hashPassword, signToken, toClientUser } from "../utils/auth";
import { sendUserCreatedEmail } from "../utils/email";
import { z } from "zod";

// Schemas
const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["teacher", "student", "parent"], {
    errorMap: () => ({ message: "Role must be teacher, student, or parent" }),
  }),
});

const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
});

const CreateAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  audience: z.enum(["all", "teachers", "students", "parents"]),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

function generatePassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Get admin dashboard overview
export async function getDashboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const totalUsers = await User.countDocuments();
    const teachers = await User.countDocuments({ role: "teacher" });
    const students = await User.countDocuments({ role: "student" });
    const parents = await User.countDocuments({ role: "parent" });
    const newEnquiries = await Enquiry.countDocuments({ status: "new" });
    const totalAnnouncements = await Announcement.countDocuments({ isActive: true });

    res.json({
      totalUsers,
      teachers,
      students,
      parents,
      newEnquiries,
      totalAnnouncements,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Get all users
export async function getAllUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const { role, isActive } = req.query;
    const filter: any = {};

    if (role && role !== "admin") {
      filter.role = role;
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const users = await User.find(filter).select("-passwordHash").limit(100);
    res.json({
      total: await User.countDocuments(filter),
      users: users.map(toClientUser),
    });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Create new user (teacher, student, or parent)
export async function createUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const body = CreateUserSchema.parse(req.body);
    const { name, email, role } = body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: "User with this email already exists" });
      return;
    }

    // Generate temporary password
    const temporaryPassword = generatePassword();
    const passwordHash = await hashPassword(temporaryPassword);

    // Create user
    const user = new User({
      name,
      email,
      passwordHash,
      role,
    });

    await user.save();

    // Send welcome email
    try {
      await sendUserCreatedEmail(email, name, role, temporaryPassword);
    } catch (emailErr) {
      console.error("Failed to send welcome email:", emailErr);
      // Continue anyway - user is created even if email fails
    }

    // Create notification for new user creation
    const notification = new Notification({
      userId: req.user._id,
      event: "new_user_created",
      title: `New ${role} Created`,
      message: `User ${name} (${email}) has been created as ${role}`,
      relatedId: user._id,
      relatedModel: "User",
    });
    await notification.save();

    res.status(201).json({
      message: "User created successfully",
      user: toClientUser(user),
      temporaryPassword, // Show once in response
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: err.errors });
      return;
    }
    console.error("Create user error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Get user by ID
export async function getUserById(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const { userId } = req.params;
    const user = await User.findById(userId).select("-passwordHash");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user: toClientUser(user) });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Update user
export async function updateUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const { userId } = req.params;
    const body = UpdateUserSchema.parse(req.body);

    const user = await User.findByIdAndUpdate(userId, body, { new: true }).select("-passwordHash");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      message: "User updated successfully",
      user: toClientUser(user),
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: err.errors });
      return;
    }
    console.error("Update user error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Delete user
export async function deleteUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const { userId } = req.params;

    // Prevent deleting admin itself
    if (userId === req.user._id.toString()) {
      res.status(400).json({ error: "Cannot delete your own admin account" });
      return;
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Create announcement
export async function createAnnouncement(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const body = CreateAnnouncementSchema.parse(req.body);
    const { title, content, audience, priority } = body;

    const announcement = new Announcement({
      title,
      content,
      audience,
      priority: priority || "medium",
      createdBy: req.user._id,
    });

    await announcement.save();

    res.status(201).json({
      message: "Announcement created successfully",
      announcement,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: err.errors });
      return;
    }
    console.error("Create announcement error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Get all announcements
export async function getAnnouncements(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const announcements = await Announcement.find({ isActive: true })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ announcements });
  } catch (err) {
    console.error("Get announcements error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Get all enquiries
export async function getEnquiries(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const { status } = req.query;
    const filter: any = {};

    if (status && ["new", "read", "responded"].includes(status as string)) {
      filter.status = status;
    }

    const enquiries = await Enquiry.find(filter)
      .sort({ createdAt: -1 })
      .populate("respondedBy", "name email")
      .limit(100);

    res.json({
      total: await Enquiry.countDocuments(filter),
      enquiries,
    });
  } catch (err) {
    console.error("Get enquiries error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Respond to enquiry
export async function respondToEnquiry(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const { enquiryId } = req.params;
    const { response } = req.body;

    if (!response || typeof response !== "string" || response.trim().length === 0) {
      res.status(400).json({ error: "Response message is required" });
      return;
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      enquiryId,
      {
        status: "responded",
        response: response.trim(),
        respondedBy: req.user._id,
        respondedAt: new Date(),
      },
      { new: true }
    );

    if (!enquiry) {
      res.status(404).json({ error: "Enquiry not found" });
      return;
    }

    res.json({
      message: "Enquiry responded successfully",
      enquiry,
    });
  } catch (err) {
    console.error("Respond to enquiry error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Mark enquiry as read
export async function markEnquiryAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const { enquiryId } = req.params;

    const enquiry = await Enquiry.findByIdAndUpdate(
      enquiryId,
      { status: "read" },
      { new: true }
    );

    if (!enquiry) {
      res.status(404).json({ error: "Enquiry not found" });
      return;
    }

    res.json({ enquiry });
  } catch (err) {
    console.error("Mark enquiry error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
