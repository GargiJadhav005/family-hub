import nodemailer from "nodemailer";

// Initialize transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true" || false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface EnquiryEmailData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export async function sendEnquiryEmail(data: EnquiryEmailData, schoolEmail: string): Promise<void> {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: schoolEmail,
      subject: "New School Enquiry",
      html: `
        <h2>New Enquiry from ${data.name}</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message}</p>
      `,
      replyTo: data.email,
    };

    await transporter.sendMail(mailOptions);
    console.log("✓ Enquiry email sent to", schoolEmail);
  } catch (err) {
    console.error("✗ Failed to send enquiry email:", err);
    throw new Error("Failed to send enquiry email");
  }
}

export async function sendUserCreatedEmail(
  userEmail: string,
  userName: string,
  userRole: string,
  temporaryPassword: string
): Promise<void> {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: `Welcome to Family Hub - ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`,
      html: `
        <h2>Welcome to Family Hub!</h2>
        <p>Dear ${userName},</p>
        <p>Your account has been created as a ${userRole}.</p>
        <p><strong>Login Credentials:</strong></p>
        <ul>
          <li><strong>Email:</strong> ${userEmail}</li>
          <li><strong>Temporary Password:</strong> ${temporaryPassword}</li>
        </ul>
        <p>Please log in and change your password immediately.</p>
        <p>If you have any questions, please contact the administration.</p>
        <p>Best regards,<br>Family Hub Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✓ Welcome email sent to", userEmail);
  } catch (err) {
    console.error("✗ Failed to send welcome email:", err);
    throw new Error("Failed to send welcome email");
  }
}

export async function sendAnnouncementEmail(
  recipientEmail: string,
  title: string,
  content: string,
  announcedBy: string
): Promise<void> {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: recipientEmail,
      subject: `School Announcement: ${title}`,
      html: `
        <h2>${title}</h2>
        <p>${content}</p>
        <p><em>Announced by: ${announcedBy}</em></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✓ Announcement email sent to", recipientEmail);
  } catch (err) {
    console.error("✗ Failed to send announcement email:", err);
    throw new Error("Failed to send announcement email");
  }
}

export async function sendEnquiryResponseEmail(
  recipientEmail: string,
  recipientName: string,
  response: string
): Promise<void> {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: recipientEmail,
      subject: "Response to Your School Enquiry",
      html: `
        <h2>Thank You for Your Enquiry</h2>
        <p>Dear ${recipientName},</p>
        <p>We have received your enquiry and here is our response:</p>
        <p>${response}</p>
        <p>If you have further questions, please feel free to contact us.</p>
        <p>Best regards,<br>Family Hub Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✓ Enquiry response email sent to", recipientEmail);
  } catch (err) {
    console.error("✗ Failed to send enquiry response email:", err);
    throw new Error("Failed to send enquiry response email");
  }
}
