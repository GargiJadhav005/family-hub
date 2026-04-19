const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendanceSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },

    className: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      required: true,
      index: true,
    },

    markedByTeacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    notes: {
      type: String,
      default: null,
      trim: true,
      maxlength: 300,
    },

    notified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index(
  { studentId: 1, date: 1 },
  { unique: true }
);

attendanceSchema.index({ className: 1, date: 1 });

attendanceSchema.index({ studentId: 1, status: 1 });

attendanceSchema.pre('save', function (next) {
  if (this.date) {
    const d = new Date(this.date);
    d.setHours(0, 0, 0, 0);
    this.date = d;
  }
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = { Attendance };
