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
    const [teachers, parents, students, newEnquiries, announcements] =
      await Promise.all([
        User.countDocuments({ role: "teacher" }),
        User.countDocuments({ role: "parent" }),
        Student.countDocuments(),
        Enquiry.countDocuments({ status: "new" }),
        Announcement.countDocuments({ isActive: true }),
      ]);
    
    // Total = teachers + parents + students (students are in their own collection)
    const totalUsers = teachers + parents + students;
    
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
    console.error('Dashboard error:', err);
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

// ===================== GET STUDENTS =====================

async function getAllStudents(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.className) filter.className = req.query.className;

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate('studentUserId', 'username email name')
        .populate('parentUserId', 'username email name')
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(filter),
    ]);

    res.json({
      total,
      page,
      limit,
      students,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch students",
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
}

async function createUser(req, res) {
  try {
    const { name, email, role, assignedClass, mobileNumber, studentDetails } = req.body;

    // ── STUDENT CREATION ──
    // Students are stored ONLY in the students collection (not in users)
    if (role === 'student') {
      if (!studentDetails || !studentDetails.className || !studentDetails.rollNumber) {
        return res.status(400).json({ error: 'Student details (className, rollNumber) are required' });
      }

      // Check if student email already exists in students collection
      const existingStudent = await Student.findOne({ studentEmail: email });
      if (existingStudent) {
        return res.status(400).json({ error: 'Student email already exists' });
      }

      // Generate username and password for student login
      const username = await generateUsername(name);
      const tempPassword = generatePassword();
      const passwordHash = await hashPassword(tempPassword);

      // Handle parent: find or create in users collection
      let parentUserId = req.user._id; // default to admin
      if (studentDetails.parentEmail) {
        let parentUser = await User.findOne({ email: studentDetails.parentEmail });
        if (!parentUser) {
          // Create parent in users collection
          const parentUsername = await generateUsername(studentDetails.fatherName || studentDetails.motherName || name + ' Parent');
          const parentPass = generatePassword();
          const parentHash = await hashPassword(parentPass);
          parentUser = await User.create({
            name: studentDetails.fatherName || studentDetails.motherName || name + ' (Parent)',
            email: studentDetails.parentEmail,
            username: parentUsername,
            passwordHash: parentHash,
            role: 'parent',
          });
          parentUserId = parentUser._id;
          sendUserCreatedEmail(studentDetails.parentEmail, (studentDetails.fatherName || name), 'parent', parentPass, parentUsername).catch(console.error);
        } else {
          parentUserId = parentUser._id;
        }
      }

      // Create Student document (NOT in users collection)
      const student = await Student.create({
        name,
        username,
        passwordHash,
        roll: studentDetails.rollNumber,
        className: studentDetails.className,
        parentName: studentDetails.fatherName || studentDetails.motherName || '',
        fatherName: studentDetails.fatherName || '',
        motherName: studentDetails.motherName || '',
        studentEmail: email,
        parentEmail: studentDetails.parentEmail || '',
        studentUserId: req.user._id, // reference to admin who created
        parentUserId,
        createdByTeacherId: req.user._id,
        dateOfBirth: studentDetails.dateOfBirth || '',
        address: studentDetails.address || '',
        parentPhone: studentDetails.mobileNumber || '',
        notes: [
          studentDetails.idNumber ? `ID: ${studentDetails.idNumber}` : '',
          studentDetails.regNumber ? `Reg: ${studentDetails.regNumber}` : '',
          studentDetails.udiseNumber ? `UDISE: ${studentDetails.udiseNumber}` : '',
          studentDetails.motherTongue ? `Mother Tongue: ${studentDetails.motherTongue}` : '',
          studentDetails.medium ? `Medium: ${studentDetails.medium}` : '',
        ].filter(Boolean).join(' | '),
      });

      Notification.create({
        userId: req.user._id,
        event: 'student_created',
        title: 'Student Created',
        message: `Student ${name} has been enrolled in ${studentDetails.className}`,
      }).catch(err => console.error('Notification error (non-blocking):', err.message));

      sendUserCreatedEmail(email, name, 'student', tempPassword, username).catch(console.error);

      const response = {
        message: 'Student created successfully',
        user: {
          id: student._id.toString(),
          name: student.name,
          username: student.username,
          email: student.studentEmail,
          role: 'student',
          className: student.className,
        },
      };

      if (process.env.NODE_ENV === 'development') {
        response.temporaryPassword = tempPassword;
        response.username = username;
      }

      return res.status(201).json(response);
    }

    // ── TEACHER / PARENT / ADMIN CREATION ──
    // These are stored in the users collection
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const username = await generateUsername(name);
    const tempPassword = generatePassword();
    const passwordHash = await hashPassword(tempPassword);

    const meta = new Map();
    if (role === 'teacher' && assignedClass) {
      meta.set('class', assignedClass);
    }
    if (mobileNumber) {
      meta.set('mobile', mobileNumber);
    }

    const user = await User.create({ name, email, username, passwordHash, role, meta });

    Notification.create({
      userId: user._id,
      event: 'account_created',
      title: 'Account Created',
      message: `Your ${role} account has been created`,
    }).catch(err => console.error('Notification error (non-blocking):', err.message));

    sendUserCreatedEmail(email, name, role, tempPassword, username).catch(console.error);

    const response = {
      message: 'User created successfully',
      user: toClientUser(user),
    };

    if (process.env.NODE_ENV === 'development') {
      response.temporaryPassword = tempPassword;
      response.username = username;
    }

    res.status(201).json(response);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'User creation failed', details: process.env.NODE_ENV === 'development' ? err.message : undefined });
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
  getAllStudents,
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
