import { Request, Response } from "express";
import { User, Enquiry, Announcement, Notification, Student } from "../models";
import { AuthRequest } from "../middleware/auth";
import { hashPassword, toClientUser } from "../utils/auth";
import {
  sendUserCreatedEmail,
  sendEnquiryEmail,
  sendEnquiryResponseEmail,
} from "../utils/email";
import { z } from "zod";

// ===================== SCHEMAS =====================

const StudentDetailsSchema = z.object({
  idNumber: z.string().optional(),
  regNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  rollNumber: z.string().min(1),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  motherTongue: z.string().optional(),
  medium: z.string().optional(),
  address: z.string().optional(),
  mobileNumber: z.string().optional(),
  udiseNumber: z.string().optional(),
  className: z.string().min(1),
  parentEmail: z.string().email().optional(),
});

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["teacher", "student", "parent"]),
  /** Sets user.meta.class for teachers */
  assignedClass: z.string().min(1).optional(),
  /** Mobile number for teacher/parent */
  mobileNumber: z.string().optional(),
  /** Full student details when role=student */
  studentDetails: StudentDetailsSchema.optional(),
});

const UpdateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
});

const CreateAnnouncementSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  audience: z.enum(["all", "teachers", "students", "parents"]),
  priority: z.enum(["low", "medium", "high"]).optional(),
  targetClasses: z.array(z.string().min(1)).optional(),
});

const QuerySchema = z.object({
  role: z.enum(["teacher", "student", "parent"]).optional(),
  isActive: z.enum(["true", "false"]).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// ===================== UTILS =====================

function generatePassword(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
  return Array.from({ length: 12 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

async function sendNotification({
  userId,
  title,
  message,
  event,
}: {
  userId: any;
  title: string;
  message: string;
  event: string;
}) {
  await Notification.create({ userId, title, message, event });
}

// ===================== DASHBOARD =====================

export async function getDashboard(req: AuthRequest, res: Response) {
  try {
    const [totalUsers, teachers, students, parents, newEnquiries, announcements] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "teacher" }),
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "parent" }),
        Enquiry.countDocuments({ status: "new" }),
        Announcement.countDocuments({ isActive: true }),
      ]);
    const usersByMonthData = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } },
      { $limit: 12 }
    ]);
    const userGrowth = usersByMonthData.map(d => ({ month: d._id, users: d.count }));

    res.json({
      totalUsers,
      teachers,
      students,
      parents,
      newEnquiries,
      announcements,
      userGrowth
    });
  } catch (err) {
    res.status(500).json({ error: "Dashboard error" });
  }
}

// ===================== USERS =====================

export async function getAllUsers(req: AuthRequest, res: Response) {
  try {
    const parsed = QuerySchema.parse(req.query);

    const page = Number(parsed.page) || 1;
    const limit = Number(parsed.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (parsed.role) filter.role = parsed.role;
    if (parsed.isActive) filter.isActive = parsed.isActive === "true";

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash")
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      total,
      page,
      limit,
      users: users.map(toClientUser),
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({
      error: "Failed to fetch users",
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
}

// ===================== CREATE USER =====================

export async function createUser(req: AuthRequest, res: Response) {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const { name, email, role, assignedClass, mobileNumber, studentDetails } = CreateUserSchema.parse(req.body);

    const exists = await User.findOne({ email }).session(session);
    if (exists) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Email already exists" });
    }

    const tempPassword = generatePassword();
    const passwordHash = await hashPassword(tempPassword);

    const meta = new Map<string, string>();
    if (role === "teacher" && assignedClass) {
      meta.set("class", assignedClass);
    }
    if (mobileNumber) {
      meta.set("mobile", mobileNumber);
    }

    const [user] = await User.create(
      [{ name, email, passwordHash, role, meta }],
      { session }
    );

    // If creating a student, also create the Student document
    if (role === "student" && studentDetails) {
      // Resolve or create parent user
      let parentUserId = user._id; // default if no parent email given
      if (studentDetails.parentEmail) {
        let parentUser = await User.findOne({ email: studentDetails.parentEmail }).session(session);
        if (!parentUser) {
          const parentPass = generatePassword();
          const parentHash = await hashPassword(parentPass);
          const [createdParent] = await User.create(
            [{ name: studentDetails.fatherName || studentDetails.motherName || name + " (Parent)", email: studentDetails.parentEmail, passwordHash: parentHash, role: "parent" }],
            { session }
          );
          parentUserId = createdParent._id;
          // Send parent credentials
          sendUserCreatedEmail(studentDetails.parentEmail!, (studentDetails.fatherName || name), "parent", parentPass).catch(console.error);
        } else {
          parentUserId = parentUser._id;
        }
      }

      await Student.create(
        [{
          name,
          roll: studentDetails.rollNumber,
          className: studentDetails.className,
          parentName: studentDetails.fatherName || studentDetails.motherName || "",
          fatherName: studentDetails.fatherName || "",
          motherName: studentDetails.motherName || "",
          studentEmail: email,
          parentEmail: studentDetails.parentEmail || "",
          studentUserId: user._id,
          parentUserId,
          createdByTeacherId: req.user!._id,
          dateOfBirth: studentDetails.dateOfBirth || "",
          address: studentDetails.address || "",
          parentPhone: studentDetails.mobileNumber || "",
          notes: [
            studentDetails.idNumber ? `ID: ${studentDetails.idNumber}` : "",
            studentDetails.regNumber ? `Reg: ${studentDetails.regNumber}` : "",
            studentDetails.udiseNumber ? `UDISE: ${studentDetails.udiseNumber}` : "",
            studentDetails.motherTongue ? `Mother Tongue: ${studentDetails.motherTongue}` : "",
            studentDetails.medium ? `Medium: ${studentDetails.medium}` : "",
          ].filter(Boolean).join(" | "),
        }],
        { session }
      );
    }

    // Notification
    await Notification.create(
      [
        {
          userId: user._id,
          event: "account_created",
          title: "Account Created",
          message: `Your ${role} account has been created`,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // Send email (outside transaction)
    sendUserCreatedEmail(email, name, role, tempPassword).catch(console.error);

    const response: any = {
      message: "User created successfully",
      user: toClientUser(user),
    };

    if (process.env.NODE_ENV === "development") {
      response.temporaryPassword = tempPassword;
    }

    res.status(201).json(response);
  } catch (err: any) {
    await session.abortTransaction();

    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }

    res.status(500).json({ error: "User creation failed" });
  } finally {
    session.endSession();
  }
}

// ===================== UPDATE USER =====================

export async function updateUser(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params;
    const body = UpdateUserSchema.parse(req.body);

    if (body.email) {
      const exists = await User.findOne({
        email: body.email,
        _id: { $ne: userId },
      });
      if (exists) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }

    const user = await User.findByIdAndUpdate(userId, body, {
      new: true,
    }).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Updated", user: toClientUser(user) });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
}

// ===================== DELETE USER =====================

export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params;

    if (userId === req.user!._id.toString()) {
      return res.status(400).json({ error: "Cannot delete yourself" });
    }

    const linkedStudent = await Student.findOne({
      $or: [{ studentUserId: userId }, { parentUserId: userId }],
    })
      .select("_id")
      .lean();
    if (linkedStudent) {
      return res.status(400).json({
        error: "User is linked to a student record; remove or reassign the student first",
      });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch {
    res.status(500).json({ error: "Delete failed" });
  }
}

// ===================== RESET USER PASSWORD =====================

export async function resetUserPassword(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters long" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    res.json({ message: "User password reset successfully" });
  } catch (err) {
    res.status(500).json({ error: "Password reset failed" });
  }
}

// ===================== ANNOUNCEMENTS =====================

export async function getAnnouncements(req: AuthRequest, res: Response) {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ announcements });
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to fetch announcements",
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
}

export async function createAnnouncement(req: AuthRequest, res: Response) {
  try {
    const { title, content, audience, priority, targetClasses } =
      CreateAnnouncementSchema.parse(req.body);

    const announcement = await Announcement.create({
      title,
      content,
      audience,
      priority: priority || "medium",
      targetClasses: targetClasses ?? [],
      createdBy: req.user!._id,
    });

    // Broadcast notifications
    const roles =
      audience === "all"
        ? ["teacher", "student", "parent"]
        : [audience.slice(0, -1)];

    const users = await User.find({ role: { $in: roles } }).select("_id");

    const notifications = users.map((u) => ({
      userId: u._id,
      event: "announcement",
      title,
      message: content,
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({ announcement });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({ error: "Announcement failed" });
  }
}

export async function updateAnnouncement(req: AuthRequest, res: Response) {
  try {
    const { announcementId } = req.params;
    const updateData = req.body;

    const announcement = await Announcement.findByIdAndUpdate(
      announcementId,
      updateData,
      { new: true }
    );
    if (!announcement) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({ announcement });
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
}

export async function deleteAnnouncement(req: AuthRequest, res: Response) {
  try {
    const { announcementId } = req.params;
    const announcement = await Announcement.findByIdAndDelete(announcementId);

    if (!announcement) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({ message: "Announcement deleted" });
  } catch {
    res.status(500).json({ error: "Delete failed" });
  }
}

// ===================== ENQUIRIES =====================

export async function getEnquiries(req: AuthRequest, res: Response) {
  try {
    const enquiries = await Enquiry.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ enquiries });
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to fetch enquiries",
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
}

export async function respondToEnquiry(req: AuthRequest, res: Response) {
  try {
    const { enquiryId } = req.params;
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ error: "Response required" });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      enquiryId,
      {
        status: "responded",
        response,
        respondedBy: req.user!._id,
        respondedAt: new Date(),
      },
      { new: true }
    );

    if (!enquiry) {
      return res.status(404).json({ error: "Not found" });
    }

    // Send email response
    await sendEnquiryResponseEmail(
      enquiry.email,
      enquiry.name,
      response
    );

    res.json({ message: "Responded", enquiry });
  } catch {
    res.status(500).json({ error: "Response failed" });
  }
}

export async function markEnquiryAsRead(req: AuthRequest, res: Response) {
  try {
    const { enquiryId } = req.params;

    const enquiry = await Enquiry.findByIdAndUpdate(
      enquiryId,
      { status: "read" },
      { new: true }
    );

    res.json({ enquiry });
  } catch {
    res.status(500).json({ error: "Failed" });
  }
}

export async function deleteEnquiry(req: AuthRequest, res: Response) {
  try {
    const { enquiryId } = req.params;
    const enquiry = await Enquiry.findByIdAndDelete(enquiryId);

    if (!enquiry) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({ message: "Enquiry deleted" });
  } catch {
    res.status(500).json({ error: "Delete failed" });
  }
}
