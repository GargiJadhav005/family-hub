const mongoose = require("mongoose");
const { Score, Student, ReportCard, Attendance, Homework, HomeworkStatus } = require("../models");
const { getMetaValue } = require("../utils/auth");
const { studentProfileForReportCard } = require("../utils/studentProfile");
const { enrollmentSnapshotFromStudent } = require("../utils/reportCardSnapshot");

const emptyAttendance = () => ({
  totalDays: 0,
  presentDays: 0,
  absentDays: 0,
  lateDays: 0,
});

const emptyHomework = () => ({ total: 0, completed: 0 });

async function summarizeAttendance(studentId) {
  const records = await Attendance.find({ studentId });
  let presentDays = 0;
  let absentDays = 0;
  let lateDays = 0;
  for (const r of records) {
    if (r.status === "present") presentDays += 1;
    else if (r.status === "absent") absentDays += 1;
    else if (r.status === "late") lateDays += 1;
  }
  return {
    totalDays: records.length,
    presentDays,
    absentDays,
    lateDays,
  };
}

async function summarizeHomework(studentId, className) {
  const total = await Homework.countDocuments({ className });
  const completed = await HomeworkStatus.countDocuments({
    studentId,
    status: { $in: ["completed", "submitted", "late"] },
  });
  return { total, completed };
}

async function listReportCards(req, res) {
  try {
    if (!req.user) { 
      return res.status(401).json({ error: "Not authenticated" }); 
    }

    const query = {};

    if (req.user.role === "student") {
      const student = await Student.findOne({ studentUserId: req.user._id });
      if (!student) { 
        return res.json({ reportCards: [] }); 
      }
      query.studentId = student._id;
    } else if (req.user.role === "parent") {
      const children = await Student.find({ parentUserId: req.user._id }).select("_id");
      query.studentId = { $in: children.map((c) => c._id) };
    } else if (req.user.role === "teacher") {
      const teacherClass = getMetaValue(req.user.meta, "class");
      if (teacherClass) {
        const students = await Student.find({ className: teacherClass }).select("_id");
        query.studentId = { $in: students.map((s) => s._id) };
      }
    } else if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Not allowed" });
    }

    const reportCards = await ReportCard.find(query)
      .populate("studentId")
      .sort({ createdAt: -1 });

    const items = reportCards.map((r) => ({
      _id: r._id.toString(),
      studentId: r.studentId?._id?.toString(),
      studentName: r.studentId?.name,
      studentRoll: r.studentId?.roll,
      className: r.className,
      term: r.term,
      academicYear: r.academicYear,
      overallGrade: r.overallGrade,
      overallPercent: r.overallPercent,
      subjectGrades: r.subjectGrades,
      teacherComment: r.teacherComment,
      attendanceSummary: r.attendanceSummary ?? emptyAttendance(),
      homeworkCompletion: r.homeworkCompletion ?? emptyHomework(),
      studentProfile: studentProfileForReportCard(r.studentId, r.enrollmentSnapshot),
      generatedAt: r.createdAt,
    }));

    res.json({ reportCards: items });
  } catch (err) {
    console.error("GetReportCard error:", err);
    res.status(500).json({ 
      error: "Failed to fetch report card",
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
}

async function saveReportCard(req, res) {
  try {
    if (!req.user || req.user.role !== "teacher") {
      return res.status(403).json({ error: "Only teachers can save report cards" }); 
    }

    const { studentId, term, subjectGrades, teacherComment, attendanceSummary: attBody, homeworkCompletion: hwBody, academicYear: bodyYear } = req.body;
    const academicYear = bodyYear || "२०२४-२५";

    if (!subjectGrades || !Array.isArray(subjectGrades)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const student = await Student.findById(studentId);
    if (!student) { 
      return res.status(404).json({ error: "Student not found" }); 
    }

    const teacherClass = getMetaValue(req.user.meta, "class");
    if (teacherClass && student.className !== teacherClass) {
      return res.status(403).json({ error: "Student not in your class" }); 
    }

    const overallPercent = subjectGrades.length > 0
      ? Math.round(subjectGrades.reduce((s, g) => s + g.scorePercent, 0) / subjectGrades.length)
      : 0;
    const overallGrade =
      overallPercent >= 90 ? "A+" :
      overallPercent >= 80 ? "A" :
      overallPercent >= 70 ? "A-" :
      overallPercent >= 60 ? "B+" :
      overallPercent >= 50 ? "B" : "C";

    const [attDb, hwDb] = await Promise.all([
      summarizeAttendance(student._id),
      summarizeHomework(student._id, student.className),
    ]);
    const attendanceSummary = { ...emptyAttendance(), ...attDb, ...(attBody ?? {}) };
    const homeworkCompletion = { ...emptyHomework(), ...hwDb, ...(hwBody ?? {}) };

    const snap = enrollmentSnapshotFromStudent(student.toObject());
    const reportCard = await ReportCard.findOneAndUpdate(
      { studentId, term, academicYear },
      {
        studentId,
        className: student.className,
        academicYear,
        term,
        subjectGrades,
        overallGrade,
        overallPercent,
        teacherComment: teacherComment || "",
        generatedByTeacherId: req.user._id,
        enrollmentSnapshot: snap,
        attendanceSummary,
        homeworkCompletion,
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      reportCard: {
        _id: reportCard._id.toString(),
        studentId,
        studentName: student.name,
        studentRoll: student.roll,
        className: student.className,
        term,
        academicYear,
        subjectGrades,
        overallGrade,
        overallPercent,
        teacherComment,
        attendanceSummary: reportCard.attendanceSummary ?? emptyAttendance(),
        homeworkCompletion: reportCard.homeworkCompletion ?? emptyHomework(),
        studentProfile: studentProfileForReportCard(student, reportCard.enrollmentSnapshot),
        generatedAt: reportCard.createdAt,
      }
    });
  } catch (err) {
    console.error("SaveReportCard error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function generateAllReportCards(req, res) {
  try {
    if (!req.user || req.user.role !== "teacher") {
      return res.status(403).json({ error: "Only teachers can generate report cards" }); 
    }

    const teacherClass = getMetaValue(req.user.meta, "class");
    const term = req.body.term || "वार्षिक";
    const academicYear = req.body.academicYear || "२०२४-२५";

    const students = await Student.find({ className: teacherClass });
    if (students.length === 0) {
      return res.json({ reportCards: [], message: "No students found in your class" }); 
    }

    const generated = [];

    for (const student of students) {
      const scores = await Score.find({ studentId: student._id });
      if (scores.length === 0) continue;

      const subjectMap = {};
      for (const sc of scores) {
        if (!subjectMap[sc.subject]) subjectMap[sc.subject] = [];
        subjectMap[sc.subject].push(sc.scorePercent);
      }

      const subjectGrades = Object.entries(subjectMap).map(([subject, percents]) => {
        const avg = Math.round(percents.reduce((a, b) => a + b, 0) / percents.length);
        const grade =
          avg >= 90 ? "A+" : avg >= 80 ? "A" : avg >= 70 ? "A-" :
          avg >= 60 ? "B+" : avg >= 50 ? "B" : "C";
        const effort =
          avg >= 85 ? "उत्कृष्ट" : avg >= 70 ? "चांगले" :
          avg >= 50 ? "समाधानकारक" : "सुधारणा आवश्यक";
        return { subject, grade, scorePercent: avg, effort, remark: "" };
      });

      const overallPercent = Math.round(
        subjectGrades.reduce((s, g) => s + g.scorePercent, 0) / subjectGrades.length
      );
      const overallGrade =
        overallPercent >= 90 ? "A+" : overallPercent >= 80 ? "A" :
        overallPercent >= 70 ? "A-" : overallPercent >= 60 ? "B+" :
        overallPercent >= 50 ? "B" : "C";

      const enrollmentSnapshot = enrollmentSnapshotFromStudent(student.toObject());

      const [attDb, hwDb] = await Promise.all([
        summarizeAttendance(student._id),
        summarizeHomework(student._id, student.className),
      ]);
      const attendanceSummary = { ...emptyAttendance(), ...attDb };
      const homeworkCompletion = { ...emptyHomework(), ...hwDb };

      const rc = await ReportCard.findOneAndUpdate(
        { studentId: student._id, term, academicYear },
        {
          studentId: student._id,
          className: teacherClass,
          academicYear,
          term,
          subjectGrades,
          overallGrade,
          overallPercent,
          teacherComment: "",
          generatedByTeacherId: req.user._id,
          enrollmentSnapshot,
          attendanceSummary,
          homeworkCompletion,
        },
        { upsert: true, new: true }
      );

      generated.push({
        _id: rc._id.toString(),
        studentId: student._id.toString(),
        studentName: student.name,
        studentRoll: student.roll,
        className: student.className,
        term,
        academicYear,
        subjectGrades,
        overallGrade,
        overallPercent,
        attendanceSummary: rc.attendanceSummary ?? emptyAttendance(),
        homeworkCompletion: rc.homeworkCompletion ?? emptyHomework(),
        studentProfile: studentProfileForReportCard(student, rc.enrollmentSnapshot),
        generatedAt: rc.createdAt,
      });
    }

    res.json({ reportCards: generated, total: generated.length });
  } catch (err) {
    console.error("GenerateAllReportCards error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function generateReportCard(req, res) {
  try {
    if (!req.user || req.user.role !== "teacher") {
      return res.status(403).json({ error: "Only teachers can generate report cards" }); 
    }

    const { studentId } = req.params;
    const term = req.body.term || "वार्षिक";
    const academicYear = req.body.academicYear || "२०२४-२५";

    const student = await Student.findById(studentId);
    if (!student) { 
      return res.status(404).json({ error: "Student not found" }); 
    }

    const teacherClass = getMetaValue(req.user.meta, "class");
    if (teacherClass && student.className !== teacherClass) {
      return res.status(403).json({ error: "Student not in your class" }); 
    }

    const scores = await Score.find({ studentId });

    const subjectMap = {};
    for (const sc of scores) {
      if (!subjectMap[sc.subject]) subjectMap[sc.subject] = [];
      subjectMap[sc.subject].push(sc.scorePercent);
    }

    const subjectGrades = Object.entries(subjectMap).map(([subject, percents]) => {
      const avg = Math.round(percents.reduce((a, b) => a + b, 0) / percents.length);
      const grade =
        avg >= 90 ? "A+" : avg >= 80 ? "A" : avg >= 70 ? "A-" :
        avg >= 60 ? "B+" : avg >= 50 ? "B" : "C";
      const effort =
        avg >= 85 ? "उत्कृष्ट" : avg >= 70 ? "चांगले" :
        avg >= 50 ? "समाधानकारक" : "सुधारणा आवश्यक";
      return { subject, grade, scorePercent: avg, effort, remark: "" };
    });

    const overallPercent = subjectGrades.length > 0
      ? Math.round(subjectGrades.reduce((s, g) => s + g.scorePercent, 0) / subjectGrades.length)
      : 0;
    const overallGrade =
      overallPercent >= 90 ? "A+" : overallPercent >= 80 ? "A" :
      overallPercent >= 70 ? "A-" : overallPercent >= 60 ? "B+" :
      overallPercent >= 50 ? "B" : "C";

    const snap = enrollmentSnapshotFromStudent(student.toObject());
    const [attDb, hwDb] = await Promise.all([
      summarizeAttendance(student._id),
      summarizeHomework(student._id, student.className),
    ]);
    const attendanceSummary = { ...emptyAttendance(), ...attDb };
    const homeworkCompletion = { ...emptyHomework(), ...hwDb };

    const rc = await ReportCard.findOneAndUpdate(
      { studentId, term, academicYear },
      {
        studentId,
        className: student.className,
        academicYear,
        term,
        subjectGrades,
        overallGrade,
        overallPercent,
        teacherComment: "",
        generatedByTeacherId: req.user._id,
        enrollmentSnapshot: snap,
        attendanceSummary,
        homeworkCompletion,
      },
      { upsert: true, new: true }
    );

    res.json({
      reportCard: {
        _id: rc._id.toString(),
        studentId,
        studentName: student.name,
        studentRoll: student.roll,
        parentName: student.parentName,
        className: student.className,
        term,
        academicYear,
        subjectGrades,
        overallGrade,
        overallPercent,
        attendanceSummary: rc.attendanceSummary ?? emptyAttendance(),
        homeworkCompletion: rc.homeworkCompletion ?? emptyHomework(),
        studentProfile: studentProfileForReportCard(student, rc.enrollmentSnapshot),
        generatedAt: rc.createdAt,
      }
    });
  } catch (err) {
    console.error("GenerateReportCard error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getStudentReportCard(req, res) {
  try {
    if (!req.user) { 
      return res.status(401).json({ error: "Not authenticated" }); 
    }

    const { studentId } = req.params;
    const term = req.query.term;

    const student = await Student.findById(studentId);
    if (!student) { 
      return res.status(404).json({ error: "Student not found" }); 
    }

    if (req.user.role === "student") {
      const studentUser = await Student.findOne({ studentUserId: req.user._id });
      if (!studentUser || studentUser._id.toString() !== studentId) {
        return res.status(403).json({ error: "Cannot access other student's report card" }); 
      }
    } else if (req.user.role === "parent") {
      const parent = await Student.findOne({ parentUserId: req.user._id, _id: studentId });
      if (!parent) { 
        return res.status(403).json({ error: "Not parent of this student" }); 
      }
    } else if (req.user.role === "teacher") {
      const teacherClass = getMetaValue(req.user.meta, "class");
      if (teacherClass && student.className !== teacherClass) {
        return res.status(403).json({ error: "Student not in your class" }); 
      }
    } else if (req.user.role === "admin") {
      // full access
    } else {
      return res.status(403).json({ error: "Not allowed" }); 
    }

    const query = { studentId };
    if (term) query.term = term;

    const cards = await ReportCard.find(query).sort({ createdAt: -1 });

    if (cards.length === 0) {
      const scores = await Score.find({ studentId }).sort({ date: -1 });
      const subjectMap = {};
      for (const sc of scores) {
        if (!subjectMap[sc.subject]) subjectMap[sc.subject] = [];
        subjectMap[sc.subject].push(sc.scorePercent);
      }
      const subjectGrades = Object.entries(subjectMap).map(([subject, percents]) => {
        const avg = Math.round(percents.reduce((a, b) => a + b, 0) / percents.length);
        const grade = avg >= 90 ? "A+" : avg >= 80 ? "A" : avg >= 70 ? "A-" : avg >= 60 ? "B+" : avg >= 50 ? "B" : "C";
        const effort = avg >= 85 ? "उत्कृष्ट" : avg >= 70 ? "चांगले" : avg >= 50 ? "समाधानकारक" : "सुधारणा आवश्यक";
        return { subject, grade, scorePercent: avg, effort, remark: "" };
      });
      const overallPercent = subjectGrades.length
        ? Math.round(subjectGrades.reduce((s, g) => s + g.scorePercent, 0) / subjectGrades.length) : 0;
      const overallGrade = overallPercent >= 90 ? "A+" : overallPercent >= 80 ? "A" : overallPercent >= 70 ? "A-" : overallPercent >= 60 ? "B+" : overallPercent >= 50 ? "B" : "C";

      const [attDb, hwDb] = await Promise.all([
        summarizeAttendance(student._id),
        summarizeHomework(student._id, student.className),
      ]);

      return res.json({
        reportCard: {
          studentId: student._id.toString(),
          studentName: student.name,
          studentRoll: student.roll,
          className: student.className,
          term: "वार्षिक",
          academicYear: "२०२४-२५",
          subjectGrades,
          overallGrade,
          overallPercent,
          attendanceSummary: attDb,
          homeworkCompletion: hwDb,
          studentProfile: studentProfileForReportCard(student, null),
        }
      });
    }

    const items = cards.map((r) => ({
      _id: r._id.toString(),
      studentId: r.studentId.toString(),
      studentName: student.name,
      studentRoll: student.roll,
      className: r.className,
      term: r.term,
      academicYear: r.academicYear,
      subjectGrades: r.subjectGrades,
      overallGrade: r.overallGrade,
      overallPercent: r.overallPercent,
      teacherComment: r.teacherComment,
      attendanceSummary: r.attendanceSummary ?? emptyAttendance(),
      homeworkCompletion: r.homeworkCompletion ?? emptyHomework(),
      studentProfile: studentProfileForReportCard(student, r.enrollmentSnapshot),
      generatedAt: r.createdAt,
    }));

    res.json({ reportCards: items });
  } catch (err) {
    console.error("GetStudentReportCard error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  listReportCards,
  saveReportCard,
  generateAllReportCards,
  generateReportCard,
  getStudentReportCard,
};
