const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, trim: true, default: '' },
    line2: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    pincode: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    relation: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    roll: {
      type: String,
      required: true,
    },
    idNumber: { type: String, default: '', trim: true },
    regNumber: { type: String, default: '', trim: true },
    className: {
      type: String,
      required: true,
    },
    parentName: {
      type: String,
      required: true,
    },
    motherName: { type: String, default: '', trim: true },
    fatherName: { type: String, default: '', trim: true },
    studentEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    parentEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    studentUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parentUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdByTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dateOfBirth: { type: String, default: '', trim: true },
    gender: {
      type: String,
      enum: ['', 'male', 'female', 'other'],
      default: '',
    },
    address: { type: String, default: '', trim: true },
    parentPhone: { type: String, default: '', trim: true },
    alternateGuardianName: { type: String, default: '', trim: true },
    alternateGuardianPhone: { type: String, default: '', trim: true },
    admissionDate: { type: String, default: '', trim: true },
    bloodGroup: { type: String, default: '', trim: true },
    previousSchool: { type: String, default: '', trim: true },
    notes: { type: String, default: '', trim: true },
    studentPhone: { type: String, default: '', trim: true },
    motherTongue: { type: String, default: '', trim: true },
    medium: { type: String, default: '', trim: true },
    udiseNumber: { type: String, default: '', trim: true },
    mailingAddress: { type: addressSchema, default: () => ({}) },
    emergencyContact: { type: emergencyContactSchema, default: () => ({}) },
  },
  { timestamps: true }
);

const Student = mongoose.model('Student', studentSchema);

module.exports = { Student };
