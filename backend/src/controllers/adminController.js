const { User, Enquiry, Announcement, Notification, Student } = require("../models");
const { hashPassword, toClientUser, generateUsername } = require("../utils/auth");
const {
  sendUserCreatedEmail,
  sendEnquiryEmail,
  sendEnquiryResponseEmail,
} = require("../utils/email");

// ===================== UTILS =====================

function generatePassword() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
  return Array.from({ length: 12 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

// ===================== DASHBOARD =====================

async function getDashboard(req, res) {
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

async function getAllUsers(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive) filter.isActive = req.query.isActive === "true";

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
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch users",
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
}

// ===================== CREATE USER =====================

async function createUser(req, res) {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const { name, email, role, assignedClass, mobileNumber, studentDetails } = req.body;

    const exists = await User.findOne({ email }).session(session);
    if (exists) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Email already exists" });
    }

    // Generate unique username
    const username = await generateUsername(name);

    const tempPassword = generatePassword();
    const passwordHash = await hashPassword(tempPassword);

    const meta = new Map();
    if (role === "teacher" && assignedClass) {
      meta.set("class", assignedClass);
    }
    if (mobileNumber) {
      meta.set("mobile", mobileNumber);
    }

    const [user] = await User.create(
      [{ name, email, username, passwordHash, role, meta }],
      { session }
    );

    // If creating a student, also create the Student document
    if (role === "student" && studentDetails) {
      let parentUserId = user._id;
      if (studentDetails.parentEmail) {
        let parentUser = await User.findOne({ email: studentDetails.parentEmail }).session(session);
        if (!parentUser) {
          const parentUsername = await generateUsername(studentDetails.fatherName || studentDetails.motherName || name + " (Parent)");
          const parentPass = generatePassword();
          const parentHash = await hashPassword(parentPass);
          const [createdParent] = await User.create(
            [{ name: studentDetails.fatherName || studentDetails.motherName || name + " (Parent)", email: studentDetails.parentEmail, username: parentUsername, passwordHash: parentHash, role: "parent" }],
            { session }
          );
          parentUserId = createdParent._id;
          sendUserCreatedEmail(studentDetails.parentEmail, (studentDetails.fatherName || name), "parent", parentPass, parentUsername).catch(console.error);
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
          createdByTeacherId: req.user._id,
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

    sendUserCreatedEmail(email, name, role, tempPassword, username).catch(console.error);

    const response = {
      message: "User created successfully",
      user: toClientUser(user),
    };

    if (process.env.NODE_ENV === "development") {
      response.temporaryPassword = tempPassword;
      response.username = username;
    }

    res.status(201).json(response);
  } catch (err) {
    await session.abortTransaction();
    console.error('Create user error:', err);
    res.status(500).json({ error: "User creation failed", details: process.env.NODE_ENV === "development" ? err.message : undefined });
  } finally {
    session.endSession();
  }
}

// ===================== UPDATE USER =====================

async function updateUser(req, res) {
  try {
    const { userId } = req.params;
    const body = req.body;

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

async function deleteUser(req, res) {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
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
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
}

// ===================== RESET USER PASSWORD =====================

async function resetUserPassword(req, res) {
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

async function getAnnouncements(req, res) {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ announcements });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch announcements",
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
}

async function createAnnouncement(req, res) {
  try {
    const { title, content, audience, priority, targetClasses } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      audience,
      priority: priority || "medium",
      targetClasses: targetClasses ?? [],
      createdBy: req.user._id,
    });

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
  } catch (err) {
    res.status(500).json({ error: "Announcement failed" });
  }
}

async function updateAnnouncement(req, res) {
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
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
}

async function deleteAnnouncement(req, res) {
  try {
    const { announcementId } = req.params;
    const announcement = await Announcement.findByIdAndDelete(announcementId);

    if (!announcement) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
}

// ===================== ENQUIRIES =====================

async function getEnquiries(req, res) {
  try {
    const enquiries = await Enquiry.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ enquiries });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch enquiries",
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
}

async function respondToEnquiry(req, res) {
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
        respondedBy: req.user._id,
        respondedAt: new Date(),
      },
      { new: true }
    );

    if (!enquiry) {
      return res.status(404).json({ error: "Not found" });
    }

    await sendEnquiryResponseEmail(
      enquiry.email,
      enquiry.name,
      response
    );

    res.json({ message: "Responded", enquiry });
  } catch (err) {
    res.status(500).json({ error: "Response failed" });
  }
}

async function markEnquiryAsRead(req, res) {
  try {
    const { enquiryId } = req.params;

    const enquiry = await Enquiry.findByIdAndUpdate(
      enquiryId,
      { status: "read" },
      { new: true }
    );

    res.json({ enquiry });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
}

async function deleteEnquiry(req, res) {
  try {
    const { enquiryId } = req.params;
    const enquiry = await Enquiry.findByIdAndDelete(enquiryId);

    if (!enquiry) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({ message: "Enquiry deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
}

module.exports = {
  getDashboard,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  getEnquiries,
  respondToEnquiry,
  markEnquiryAsRead,
  deleteEnquiry,
};
