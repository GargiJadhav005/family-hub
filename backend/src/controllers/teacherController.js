const { User, Student } = require("../models");
const { hashPassword, toClientUser, getMetaValue } = require("../utils/auth");

const enrollSchem = {
  // Simplified schema validation extracted to handler
};

function generatePassword() {
  return "Pass" + Math.floor(1000 + Math.random() * 9000);
}

async function getTeacherDashboard(req, res) {
  try {
    if (!req.user || req.user.role !== "teacher") {
      return res.status(403).json({ error: "Teachers only" });
    }

    const teacherClass = getMetaValue(req.user.meta, "class");
    const query = teacherClass ? { className: teacherClass } : {};

    const [studentCount, homeworkCount, recentStudents] = await Promise.all([
      Student.countDocuments(query),
      require("../models").Homework.countDocuments({ createdByTeacherId: req.user._id }),
      Student.find(query).select("name roll className").sort({ roll: 1 }).limit(8).lean(),
    ]);

    res.json({
      studentCount,
      homeworkCount,
      recentStudents: recentStudents.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        roll: s.roll,
        className: s.className,
      })),
      teacherClass: teacherClass || null,
    });
  } catch (err) {
    console.error("TeacherDashboard error:", err);
    res.status(500).json({ error: "Dashboard error" });
  }
}

async function enrollStudent(req, res) {
  try {
    if (!req.user || req.user.role !== "teacher") {
      return res.status(403).json({ error: "Only teachers can enroll students" });
    }

    const body = req.body;
    let { className } = body;
    const teacherClass = getMetaValue(req.user.meta, "class");
    if (teacherClass && className !== teacherClass) {
      return res.status(403).json({ error: "You can only enroll students in your assigned class" });
    }
    if (teacherClass) {
      className = teacherClass;
    }

    const {
      name,
      parentName,
      roll: rollOverride,
      motherName = "",
      fatherName = "",
      idNumber = "",
      regNumber = "",
      dateOfBirth = "",
      gender = "",
      address = "",
      parentPhone = "",
      alternateGuardianName = "",
      alternateGuardianPhone = "",
      admissionDate = "",
      bloodGroup = "",
      previousSchool = "",
      notes = "",
      studentPhone = "",
      motherTongue = "",
      medium = "",
      udiseNumber = "",
      mailingAddress,
      emergencyContact,
      studentEmail: studentEmailInput,
      parentEmail: parentEmailInput,
      studentPassword: studentPasswordInput,
      parentPassword: parentPasswordInput,
    } = body;

    let rollNum;
    if (rollOverride && rollOverride.trim()) {
      rollNum = rollOverride.trim();
      const dup = await Student.findOne({ className, roll: rollNum });
      if (dup) {
        return res.status(400).json({ error: "Roll number already used in this class" });
      }
    } else {
      const existingCount = await Student.countDocuments({ className });
      rollNum = String(existingCount + 1).padStart(2, "0");
    }

    const timestamp = Date.now().toString(36).slice(-4);
    const baseEmail = name.toLowerCase().replace(/\s/g, ".").replace(/[^a-z.]/g, "");
    const studentEmail = (studentEmailInput && studentEmailInput.trim()) || `${baseEmail}.${timestamp}@school.edu`;
    const parentEmail = (parentEmailInput && parentEmailInput.trim()) || `parent.${baseEmail}.${timestamp}@school.edu`;

    const studentPasswordPlain = (studentPasswordInput && studentPasswordInput.trim()) || generatePassword();
    const parentPasswordPlain = (parentPasswordInput && parentPasswordInput.trim()) || generatePassword();

    const studentHash = await hashPassword(studentPasswordPlain);
    const parentHash = await hashPassword(parentPasswordPlain);

    const studentUser = new User({
      name,
      email: studentEmail,
      passwordHash: studentHash,
      role: "student",
      meta: new Map([
        ["class", className],
        ["roll", rollNum],
      ]),
    });

    const parentUser = new User({
      name: parentName,
      email: parentEmail,
      passwordHash: parentHash,
      role: "parent",
      meta: new Map([
        ["child", name],
        ["class", className],
      ]),
    });

    await studentUser.save();
    await parentUser.save();

    const student = new Student({
      name,
      roll: rollNum,
      idNumber,
      regNumber,
      className,
      parentName,
      motherName,
      fatherName,
      studentEmail,
      parentEmail,
      studentUserId: studentUser._id,
      parentUserId: parentUser._id,
      createdByTeacherId: req.user._id,
      dateOfBirth,
      gender,
      address,
      parentPhone,
      alternateGuardianName,
      alternateGuardianPhone,
      admissionDate,
      bloodGroup,
      previousSchool,
      notes,
      studentPhone,
      motherTongue,
      medium,
      udiseNumber,
      mailingAddress: mailingAddress || {},
      emergencyContact: emergencyContact || {},
    });

    await student.save();

    res.status(201).json({
      student: {
        id: student._id.toString(),
        name,
        roll: rollNum,
        class: className,
        parentName,
        motherName: student.motherName,
        fatherName: student.fatherName,
        studentEmail,
        studentPassword: studentPasswordPlain,
        parentEmail,
        parentPassword: parentPasswordPlain,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        address: student.address,
        mailingAddress: student.mailingAddress,
        studentPhone: student.studentPhone,
        parentPhone: student.parentPhone,
        alternateGuardianName: student.alternateGuardianName,
        alternateGuardianPhone: student.alternateGuardianPhone,
        admissionDate: student.admissionDate,
        bloodGroup: student.bloodGroup,
        previousSchool: student.previousSchool,
        notes: student.notes,
        emergencyContact: student.emergencyContact,
        studentUser: toClientUser(studentUser),
        parentUser: toClientUser(parentUser),
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ error: `${field} already exists` });
    }
    console.error("Enroll error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getTeacherDashboard,
  enrollStudent,
};
