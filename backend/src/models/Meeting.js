const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacherName: { type: String, required: true },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: false,
    },
    classWide: { type: Boolean, default: false },
    className: { type: String, default: '' },
    studentName: { type: String, required: true },
    date: { type: Date, required: true },
    timeLabel: { type: String, required: true },
    mode: {
      type: String,
      enum: ['प्रत्यक्ष', 'ऑनलाइन'],
      required: true,
    },
    status: {
      type: String,
      enum: ['नियोजित', 'पूर्ण', 'रद्द'],
      default: 'नियोजित',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = { Meeting };
