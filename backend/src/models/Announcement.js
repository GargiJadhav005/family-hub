const mongoose = require('mongoose');
const { Schema } = mongoose;

const announcementSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

    content: {
      type: String,
      required: true,
      minlength: 5,
    },

    audience: {
      type: String,
      enum: ['all', 'teachers', 'students', 'parents'],
      required: true,
      index: true,
    },

    targetClasses: [
      {
        type: String,
        trim: true,
      },
    ],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

announcementSchema.index({ audience: 1, isActive: 1 });
announcementSchema.index({ createdAt: -1 });

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = { Announcement };
