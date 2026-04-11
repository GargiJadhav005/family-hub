import mongoose, { Document, Schema } from 'mongoose';

export interface IMaterial extends Document {
  title: string;
  type: string;
  size: string;
  url: string;
}

export interface ICourse extends Document {
  title: string;
  subject: string;
  className: string;
  teacherId: mongoose.Types.ObjectId;
  progress: number;
  color: string;
  materials: IMaterial[];
}

const MaterialSchema = new Schema<IMaterial>({
  title: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: String, required: true },
  url: { type: String, required: true },
});

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  className: { type: String, required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  progress: { type: Number, default: 0 },
  color: { type: String, default: 'bg-primary' },
  materials: [MaterialSchema],
});

export const Course = mongoose.model<ICourse>('Course', CourseSchema);
