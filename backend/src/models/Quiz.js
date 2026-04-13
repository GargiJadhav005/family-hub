const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctIndex: { type: Number, required: true },
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    icon: { type: String, default: '📝' },
    questions: { type: [questionSchema], required: true },
    dueDate: { type: Date },
    createdByTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const quizResultSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    answers: { type: [Number], required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Quiz = mongoose.model('Quiz', quizSchema);
const QuizResult = mongoose.model('QuizResult', quizResultSchema);

module.exports = { Quiz, QuizResult };
