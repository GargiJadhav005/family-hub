const mongoose = require('mongoose');
const { Schema } = mongoose;

const MaterialSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: String, required: true },
  url: { type: String, required: true },
});

const CourseSchema = new Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  className: { type: String, required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  progress: { type: Number, default: 0 },
  color: { type: String, default: 'bg-primary' },
  materials: [MaterialSchema],
});

const Course = mongoose.model('Course', CourseSchema);

module.exports = { Course };
