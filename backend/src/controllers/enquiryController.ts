import { Request, Response } from "express";
import { Enquiry, Notification, User } from "../models";
import { sendEnquiryEmail } from "../utils/email";
import { z } from "zod";

const EnquirySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Valid phone number required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Submit enquiry form (public endpoint)
export async function submitEnquiry(req: Request, res: Response): Promise<void> {
  try {
    const body = EnquirySchema.parse(req.body);
    const { name, email, phone, message } = body;

    // Create enquiry
    const enquiry = new Enquiry({
      name,
      email,
      phone,
      message,
      status: "new",
    });

    await enquiry.save();

    // Get school email from environment or admin settings
    const schoolEmail = process.env.SCHOOL_EMAIL || "admin@school.edu";

    // Send email to school
    try {
      await sendEnquiryEmail({ name, email, phone, message }, schoolEmail);
    } catch (emailErr) {
      console.error("Failed to send enquiry email:", emailErr);
      // Continue anyway - enquiry is saved
    }

    // Notify admin users
    try {
      const admins = await User.find({ role: "admin" });
      for (const admin of admins) {
        const notification = new Notification({
          userId: admin._id,
          event: "new_enquiry",
          title: "New Enquiry Received",
          message: `New enquiry from ${name} (${email})`,
          relatedId: enquiry._id,
          relatedModel: "Enquiry",
        });
        await notification.save();
      }
    } catch (notifErr) {
      console.error("Failed to create notification:", notifErr);
    }

    res.status(201).json({
      message: "Enquiry submitted successfully. We will get back to you soon.",
      enquiry: {
        id: enquiry._id,
        name: enquiry.name,
        email: enquiry.email,
        status: enquiry.status,
        createdAt: enquiry.createdAt,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: err.errors });
      return;
    }
    console.error("Submit enquiry error:", err);
    res.status(500).json({ error: "Failed to submit enquiry" });
  }
}

// Get enquiry status (by ID)
export async function getEnquiryStatus(req: Request, res: Response): Promise<void> {
  try {
    const { enquiryId } = req.params;

    const enquiry = await Enquiry.findById(enquiryId);

    if (!enquiry) {
      res.status(404).json({ error: "Enquiry not found" });
      return;
    }

    res.json({
      id: enquiry._id,
      status: enquiry.status,
      response: enquiry.response || null,
      respondedAt: enquiry.respondedAt || null,
      createdAt: enquiry.createdAt,
    });
  } catch (err) {
    console.error("Get enquiry status error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
