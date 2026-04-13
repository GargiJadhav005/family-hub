const { Instruction, Student } = require("../models");
const { getMetaValue } = require("../utils/auth");

async function listInstructions(req, res) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    let filter = {};

    if (user.role === "teacher") {
      filter.teacherId = user._id;

      const teacherClass = getMetaValue(user.meta, "class");

      if (teacherClass) {
        const classStudents = await Student.find({
          className: teacherClass,
        }).select("_id");

        filter.studentId = {
          $in: classStudents.map((s) => s._id),
        };
      }
    }
    else if (user.role === "parent") {
      const students = await Student.find({
        parentUserId: user._id,
      }).select("_id");

      filter.studentId = {
        $in: students.map((s) => s._id),
      };
    }
    else if (user.role === "admin") {
      filter = {};
    }

    const instructions = await Instruction.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("studentId", "name className")
      .lean();

    const formatted = instructions.map((inst) => ({
      id: inst._id.toString(),
      message: inst.message,
      student: inst.studentId
        ? {
            id: inst.studentId._id,
            name: inst.studentId.name,
            className: inst.studentId.className,
          }
        : null,
      teacherId: inst.teacherId,
      teacherName: inst.teacherName,
      createdAt: inst.createdAt,
    }));

    res.json({ instructions: formatted });
  } catch (err) {
    console.error("GetInstructions error:", err);
    res.status(500).json({ 
      error: "Failed to fetch instructions",
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
}

async function createInstruction(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (req.user.role !== "teacher" && req.user.role !== "admin") {
      return res.status(403).json({
        error: "Only teachers or admins can create instructions",
      });
    }

    const { studentId, message } = req.body;

    if (!studentId || !message) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (req.user.role === "teacher") {
      const teacherClass = getMetaValue(req.user.meta, "class");

      if (teacherClass && student.className !== teacherClass) {
        return res.status(403).json({
          error: "You can only send instructions to your class students",
        });
      }
    }

    const instruction = await Instruction.create({
      studentId,
      message,
      teacherId: req.user._id,
      teacherName: req.user.name,
    });

    res.status(201).json({
      instruction: {
        id: instruction._id.toString(),
        studentId: instruction.studentId,
        message: instruction.message,
        teacherName: instruction.teacherName,
        createdAt: instruction.createdAt,
      },
    });
  } catch (err) {
    console.error("❌ createInstruction error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  listInstructions,
  createInstruction,
};
