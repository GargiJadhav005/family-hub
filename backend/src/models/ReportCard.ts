import mongoose from "mongoose";

const subjectGradeSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  grade: { type: String, required: true },
  scorePercent: { type: Number, min: 0, max: 100 },
  effort: {
    type: String,
    enum: ["उत्कृष्ट", "चांगले", "समाधानकारक", "सुधारणा आवश्यक"],
    default: "चांगले",
  },
  remark: { type: String, default: "" },
});

const reportCardSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    className: {
      type: String,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
      default: "२०२४-२५",
    },
    term: {
      type: String,
      enum: ["सत्र १", "सत्र २", "वार्षिक"],
      required: true,
    },
    subjectGrades: {
      type: [subjectGradeSchema],
      default: [],
    },
    attendanceSummary: {
      totalDays: { type: Number, default: 0 },
      presentDays: { type: Number, default: 0 },
      absentDays: { type: Number, default: 0 },
      lateDays: { type: Number, default: 0 },
    },
    homeworkCompletion: {
      total: { type: Number, default: 0 },
      completed: { type: Number, default: 0 },
    },
    overallGrade: { type: String },
    overallPercent: { type: Number, min: 0, max: 100 },
    teacherComment: { type: String, default: "" },
    generatedByTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

reportCardSchema.index(
  { studentId: 1, academicYear: 1, term: 1 },
  { unique: true }
);

export const ReportCard = mongoose.model("ReportCard", reportCardSchema);
