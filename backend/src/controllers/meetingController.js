const { Meeting, Student } = require("../models");
const { getMetaValue } = require("../utils/auth");

async function listMeetings(req, res) {
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
        const ids = classStudents.map((s) => s._id);
        filter.$or = [
          { studentId: { $in: ids } },
          { classWide: true, className: teacherClass },
        ];
      }
    }
    else if (user.role === "parent") {
      const students = await Student.find({
        parentUserId: user._id,
      })
        .select("_id className")
        .lean();
      const ids = students.map((s) => s._id);
      const classNames = [...new Set(students.map((s) => s.className).filter(Boolean))];
      filter.$or = [
        { studentId: { $in: ids } },
        { classWide: true, className: { $in: classNames } },
      ];
    }
    else if (user.role === "admin") {
      filter = {};
    }

    const meetings = await Meeting.find(filter)
      .sort({ date: 1 })
      .limit(50)
      .populate("studentId", "name className")
      .lean();

    const formatted = meetings.map((m) => ({
      id: m._id.toString(),
      classWide: !!m.classWide,
      className: m.className || "",
      student: m.studentId
        ? {
            id: m.studentId._id,
            name: m.studentId.name,
            className: m.studentId.className,
          }
        : null,
      studentName: m.studentName,
      date: m.date,
      timeLabel: m.timeLabel,
      mode: m.mode,
      notes: m.notes || null,
      status: m.status || "नियोजित",
      teacherName: m.teacherName,
      createdAt: m.createdAt,
    }));

    res.json({ meetings: formatted });
  } catch (err) {
    console.error("GetMeetings error:", err);
    res.status(500).json({ 
      error: "Failed to fetch meetings",
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
}

async function createMeeting(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (req.user.role !== "teacher" && req.user.role !== "admin") {
      return res.status(403).json({
        error: "Only teachers or admins can schedule meetings",
      });
    }

    const { studentId, classWide, date, timeLabel, mode, notes } = req.body;

    const teacherClass =
      req.user.role === "teacher" ? getMetaValue(req.user.meta, "class") : "";

    let student = null;
    let classWideFlag = !!classWide;
    let studentName = "";
    let parentId = undefined;
    let studentIdField = undefined;
    let meetingClassName = "";

    if (classWideFlag) {
      if (req.user.role === "teacher") {
        if (!teacherClass) {
          return res.status(400).json({ error: "Teacher class not assigned" });
        }
        meetingClassName = teacherClass;
        studentName = `वर्ग सभा — ${teacherClass}`;
      } else {
        meetingClassName = req.body.className || "";
        if (!meetingClassName) {
          return res.status(400).json({ error: "className required for admin class meeting" });
        }
        studentName = `वर्ग सभा — ${meetingClassName}`;
      }
    } else {
      student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      if (req.user.role === "teacher" && teacherClass && student.className !== teacherClass) {
        return res.status(403).json({
          error: "You can only schedule meetings for your class students",
        });
      }
      studentName = student.name;
      parentId = student.parentUserId;
      studentIdField = student._id;
      meetingClassName = student.className;
    }

    const meeting = await Meeting.create({
      studentId: studentIdField || undefined,
      classWide: classWideFlag,
      className: meetingClassName,
      studentName,
      date: new Date(date),
      timeLabel,
      mode,
      notes,
      teacherId: req.user._id,
      teacherName: req.user.name,
      parentId: parentId || undefined,
    });

    res.status(201).json({
      meeting: {
        id: meeting._id.toString(),
        studentId: meeting.studentId,
        classWide: meeting.classWide,
        className: meeting.className,
        studentName: meeting.studentName,
        date: meeting.date,
        timeLabel: meeting.timeLabel,
        mode: meeting.mode,
        notes: meeting.notes,
        status: meeting.status,
        teacherName: meeting.teacherName,
        createdAt: meeting.createdAt,
      },
    });
  } catch (err) {
    console.error("❌ createMeeting error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function updateMeetingStatus(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["नियोजित", "पूर्ण", "रद्द"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    if (req.user.role === "teacher" && meeting.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Can only update your own meetings" });
    }

    meeting.status = status;
    await meeting.save();

    res.json({ meeting: {
      id: meeting._id.toString(),
      status: meeting.status,
      updated: true,
    }});
  } catch (err) {
    console.error("updateMeetingStatus error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function rescheduleMeeting(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { id } = req.params;
    const { date, timeLabel, mode, notes } = req.body;

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    if (req.user.role === "teacher" && meeting.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Can only reschedule your own meetings" });
    }

    if (date) meeting.date = new Date(date);
    if (timeLabel) meeting.timeLabel = timeLabel;
    if (mode) meeting.mode = mode;
    if (notes !== undefined) meeting.notes = notes;

    await meeting.save();

    res.json({ meeting: {
      id: meeting._id.toString(),
      date: meeting.date,
      timeLabel: meeting.timeLabel,
      mode: meeting.mode,
      notes: meeting.notes,
    }});
  } catch (err) {
    console.error("rescheduleMeeting error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  listMeetings,
  createMeeting,
  updateMeetingStatus,
  rescheduleMeeting,
};
