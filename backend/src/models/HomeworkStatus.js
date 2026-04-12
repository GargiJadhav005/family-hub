const mongoose = require('mongoose');
const { Schema } = mongoose;

const homeworkStatusSchema = new Schema(
  {
    homeworkId: {
      type: Schema.Types.ObjectId,
      ref: 'Homework',
      required: true,
      index: true,
    },

    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['pending', 'in_progress', 'submitted', 'completed', 'late'],
      default: 'pending',
      index: true,
    },

    submissionText: {
      type: String,
      default: null,
      trim: true,
    },

    attachments: [
      {
        type: String,
      },
    ],

    feedback: {
      type: String,
      default: null,
      trim: true,
    },

    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    gradedAt: {
      type: Date,
      default: null,
    },

    submittedAt: {
      type: Date,
      default: null,
      index: true,
    },

    isLate: {
      type: Boolean,
      default: false,
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

homeworkStatusSchema.index(
  { homeworkId: 1, studentId: 1 },
  { unique: true }
);

homeworkStatusSchema.index({ studentId: 1, status: 1 });
homeworkStatusSchema.index({ homeworkId: 1, status: 1 });

homeworkStatusSchema.pre('save', async function (next) {
  try {
    if (this.submittedAt) {
      const Homework = mongoose.model('Homework');
      const hw = await Homework.findById(this.homeworkId);

      if (hw && hw.dueDate) {
        const due = new Date(hw.dueDate);
        const submitted = new Date(this.submittedAt);

        if (submitted > due) {
          this.isLate = true;
          if (this.status === 'submitted') {
            this.status = 'late';
          }
        }
      }
    }

    next();
  } catch (err) {
    next(err);
  }
});

const HomeworkStatus = mongoose.model('HomeworkStatus', homeworkStatusSchema);

module.exports = { HomeworkStatus };
