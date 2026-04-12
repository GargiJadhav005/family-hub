const mongoose = require('mongoose');

const snapshotAddressSchema = new mongoose.Schema(
  {
    line1: { type: String, default: '' },
    line2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
  },
  { _id: false }
);

const snapshotEmergencySchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relation: { type: String, default: '' },
  },
  { _id: false }
);

const enrollmentSnapshotSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    roll: { type: String, default: '' },
    className: { type: String, default: '' },
    parentName: { type: String, default: '' },
    studentEmail: { type: String, default: '' },
    parentEmail: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    gender: { type: String, default: '' },
    address: { type: String, default: '' },
    studentPhone: { type: String, default: '' },
    parentPhone: { type: String, default: '' },
    motherName: { type: String, default: '' },
    fatherName: { type: String, default: '' },
    admissionDate: { type: String, default: '' },
    bloodGroup: { type: String, default: '' },
    previousSchool: { type: String, default: '' },
    alternateGuardianName: { type: String, default: '' },
    alternateGuardianPhone: { type: String, default: '' },
    notes: { type: String, default: '' },
    mailingAddress: { type: snapshotAddressSchema, default: () => ({}) },
    emergencyContact: { type: snapshotEmergencySchema, default: () => ({}) },
  },
  { _id: false }
);

const subjectGradeSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  grade: { type: String, required: true },
  scorePercent: { type: Number, min: 0, max: 100 },
  effort: {
    type: String,
    enum: ['उत्कृष्ट', 'चांगले', 'समाधानकारक', 'सुधारणा आवश्यक'],
    default: 'चांगले',
  },
  remark: { type: String, default: '' },
});

const reportCardSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    className: {
      type: String,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
      default: '२०२४-२५',
    },
    term: {
      type: String,
      enum: ['सत्र १', 'सत्र २', 'वार्षिक'],
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
    teacherComment: { type: String, default: '' },
    generatedByTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    enrollmentSnapshot: { type: enrollmentSnapshotSchema, default: undefined },
  },
  { timestamps: true }
);

reportCardSchema.index(
  { studentId: 1, academicYear: 1, term: 1 },
  { unique: true }
);

const ReportCard = mongoose.model('ReportCard', reportCardSchema);

module.exports = { ReportCard };
