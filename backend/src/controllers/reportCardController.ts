import { Response } from "express";
import { ReportCard, Score, Attendance, Student, HomeworkStatus, Homework } from "../models";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

const GenerateReportCardSchema = z.object({
  term: z.enum(["सत्र १", "सत्र २", "वार्षिक"]),
  academicYear: z.string().optional(),
  teacherComment: z.string().optional(),
});

/**
 * POST /api/report-cards/generate/:studentId
 * Auto-generates a report card by compiling scores, attendance, homework for a student
 */
export async function generateReportCard(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (req.user.role !== "teacher") {
      res.status(403).json({ error: "Only teachers can generate report cards" });
      return;
    }

    const { studentId } = req.params;
    const body = GenerateReportCardSchema.parse(req.body);

    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    const teacherClass = req.user.meta?.get?.("class") ?? req.user.meta?.class;
    if (teacherClass && student.className !== teacherClass) {
      res.status(403).json({ error: "Student not in your class" });
      return;
    }

    const academicYear = body.academicYear || "२०२४-२५";

    // Compile scores — group by subject, take latest/average
    const scores = await Score.find({ studentId: student._id });
    const subjectMap: Record<string, { total: number; count: number; grade: string }> = {};
    for (const s of scores) {
      if (!subjectMap[s.subject]) {
        subjectMap[s.subject] = { total: 0, count: 0, grade: s.grade };
      }
      subjectMap[s.subject].total += s.scorePercent;
      subjectMap[s.subject].count += 1;
      subjectMap[s.subject].grade = s.grade; // latest grade
    }

    const subjectGrades = Object.entries(subjectMap).map(([subject, data]) => {
      const avg = Math.round(data.total / data.count);
      const grade = avg >= 90 ? "A+" : avg >= 80 ? "A" : avg >= 70 ? "B+" : avg >= 60 ? "B" : avg >= 50 ? "C" : "D";
      const effort = avg >= 85 ? "उत्कृष्ट" : avg >= 70 ? "चांगले" : avg >= 55 ? "समाधानकारक" : "सुधारणा आवश्यक";
      return {
        subject,
        grade,
        scorePercent: avg,
        effort,
        remark: "",
      };
    });

    // Compile attendance
    const attendanceRecords = await Attendance.find({ studentId: student._id });
    const attendanceSummary = {
      totalDays: attendanceRecords.length,
      presentDays: attendanceRecords.filter((a) => a.status === "present").length,
      absentDays: attendanceRecords.filter((a) => a.status === "absent").length,
      lateDays: attendanceRecords.filter((a) => a.status === "late").length,
    };

    // Compile homework completion
    const classHomework = await Homework.find({ className: student.className });
    const hwStatuses = await HomeworkStatus.find({
      studentId: student._id,
      homeworkId: { $in: classHomework.map((h) => h._id) },
    });
    const homeworkCompletion = {
      total: classHomework.length,
      completed: hwStatuses.filter((s) => s.status === "completed").length,
    };

    // Overall
    const totalPercent = subjectGrades.length
      ? Math.round(subjectGrades.reduce((sum, s) => sum + (s.scorePercent || 0), 0) / subjectGrades.length)
      : 0;
    const overallGrade = totalPercent >= 90 ? "A+" : totalPercent >= 80 ? "A" : totalPercent >= 70 ? "B+" : totalPercent >= 60 ? "B" : totalPercent >= 50 ? "C" : "D";

    // Upsert report card
    const reportCard = await ReportCard.findOneAndUpdate(
      { studentId: student._id, academicYear, term: body.term },
      {
        studentId: student._id,
        className: student.className,
        academicYear,
        term: body.term,
        subjectGrades,
        attendanceSummary,
        homeworkCompletion,
        overallGrade,
        overallPercent: totalPercent,
        teacherComment: body.teacherComment || "",
        generatedByTeacherId: req.user._id,
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ reportCard });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: err.errors });
      return;
    }
    console.error("GenerateReportCard error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/report-cards?studentId=X
 * Lists report cards — filtered by class for teachers, by child for parents
 */
export async function listReportCards(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    let filter: any = {};

    if (req.query.studentId) {
      filter.studentId = req.query.studentId;
    } else if (user.role === "teacher") {
      const teacherClass = user.meta?.get?.("class") ?? user.meta?.class;
      if (teacherClass) {
        filter.className = teacherClass;
      }
    } else if (user.role === "parent") {
      const children = await Student.find({ parentUserId: user._id }).select("_id");
      filter.studentId = { $in: children.map((c) => c._id) };
    } else if (user.role === "student") {
      const student = await Student.findOne({ studentUserId: user._id });
      if (student) filter.studentId = student._id;
    }

    const reportCards = await ReportCard.find(filter)
      .populate("studentId", "name roll className")
      .sort({ createdAt: -1 });

    res.json({ reportCards });
  } catch (err) {
    console.error("ListReportCards error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/report-cards/:studentId
 */
export async function getStudentReportCard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { studentId } = req.params;
    const term = req.query.term as string;
    const filter: any = { studentId };
    if (term) filter.term = term;

    const reportCards = await ReportCard.find(filter)
      .populate("studentId", "name roll className")
      .sort({ createdAt: -1 });

    res.json({ reportCards });
  } catch (err) {
    console.error("GetStudentReportCard error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
