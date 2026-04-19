const mongoose = require('mongoose');

const instructionSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacherName: { type: String, required: true },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Instruction = mongoose.model('Instruction', instructionSchema);

module.exports = { Instruction };
