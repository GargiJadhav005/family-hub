import { Request, Response } from "express";
import { Enquiry, Notification, User } from "../models";
import { sendEnquiryEmail } from "../utils/email";
import { z } from "zod";
import mongoose from "mongoose";

// ✅ Validation Schema
const EnquirySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// ✅ Helper: Safe response formatter
const toClientEnquiry = (enquiry: any) => ({
  id: enquiry._id.toString(),
  name: enquiry.name,
  email: enquiry.email,
  status: enquiry.status,
  createdAt: enquiry.createdAt,
});

/**
 * POST /api/enquiry (Public)
 */
export async function submitEnquiry(req: Request, res: Response): Promise<void> {
  try {
    const body = EnquirySchema.parse(req.body);
    const { name, email, phone, message } = body;

    // ✅ Create enquiry
    const enquiry = await Enquiry.create({
      name,
      email,
      phone,
      message,
      status: "new",
    });

    // ✅ Get school email
    const schoolEmail =
      process.env.SCHOOL_EMAIL || process.env.MAIL_USER || "";

    if (!schoolEmail) {
      console.warn("⚠️ SCHOOL_EMAIL not configured");
    }

    // ✅ Send email (non-blocking)
    sendEnquiryEmail({ name, email, phone, message }, schoolEmail).catch(
      (err) => console.error("Email failed:", err)
    );

    // ✅ Notify admins (OPTIMIZED ⚡)
    try {
      const admins = await User.find({ role: "admin" })
        .select("_id")
        .lean();

      if (admins.length > 0) {
        const notifications = admins.map((admin) => ({
          userId: admin._id,
          event: "new_enquiry",
          title: "New Enquiry Received",
          message: `New enquiry from ${name} (${email})`,
          relatedId: enquiry._id,
          relatedModel: "Enquiry",
        }));

        await Notification.insertMany(notifications);
      }
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }

    res.status(201).json({
      message:
        "Enquiry submitted successfully. We will get back to you soon.",
      enquiry: toClientEnquiry(enquiry),
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: "Invalid input",
        details: err.errors,
      });
      return;
    }

    console.error("Submit enquiry error:", err);
    res.status(500).json({ error: "Failed to submit enquiry" });
  }
}

/**
 * GET /api/enquiry/:enquiryId
 */
export async function getEnquiryStatus(req: Request, res: Response): Promise<void> {
  try {
    const { enquiryId } = req.params;

    // ✅ Validate Mongo ID
    if (!mongoose.Types.ObjectId.isValid(enquiryId)) {
      res.status(400).json({ error: "Invalid enquiry ID" });
      return;
    }

    const enquiry = await Enquiry.findById(enquiryId).lean();

    if (!enquiry) {
      res.status(404).json({ error: "Enquiry not found" });
      return;
    }

    res.json({
      id: enquiry._id.toString(),
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