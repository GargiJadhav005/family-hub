const { Enquiry, Notification, User } = require("../models");
const { sendEnquiryEmail } = require("../utils/email");
const mongoose = require("mongoose");

const toClientEnquiry = (enquiry) => ({
  id: enquiry._id.toString(),
  name: enquiry.name,
  email: enquiry.email,
  status: enquiry.status,
  createdAt: enquiry.createdAt,
});

async function submitEnquiry(req, res) {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        error: "Invalid input",
      });
    }

    const enquiry = await Enquiry.create({
      name,
      email,
      phone,
      message,
      status: "new",
    });

    const schoolEmail =
      process.env.SCHOOL_EMAIL || process.env.MAIL_USER || "";

    if (!schoolEmail) {
      console.warn("⚠️ SCHOOL_EMAIL not configured");
    }

    sendEnquiryEmail({ name, email, phone, message }, schoolEmail).catch(
      (err) => console.error("Email failed:", err)
    );

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
  } catch (err) {
    console.error("Submit enquiry error:", err);
    res.status(500).json({ 
      error: "Failed to submit enquiry",
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
}

async function getEnquiryStatus(req, res) {
  try {
    const { enquiryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(enquiryId)) {
      return res.status(400).json({ error: "Invalid enquiry ID" });
    }

    const enquiry = await Enquiry.findById(enquiryId).lean();

    if (!enquiry) {
      return res.status(404).json({ error: "Enquiry not found" });
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

module.exports = {
  submitEnquiry,
  getEnquiryStatus,
};
