const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

    description: {
      type: String,
      required: true,
      minlength: 5,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    endDate: {
      type: Date,
      default: null,
    },

    type: {
      type: String,
      enum: ['notice', 'event'],
      required: true,
      index: true,
    },

    icon: {
      type: String,
      default: '📢',
    },

    targetAudience: {
      type: String,
      enum: ['all', 'students', 'parents', 'teachers'],
      default: 'all',
      index: true,
    },

    targetClasses: [
      {
        type: String,
        trim: true,
      },
    ],

    location: {
      type: String,
      trim: true,
      default: null,
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    isNotified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ date: 1, targetAudience: 1 });
eventSchema.index({ createdAt: -1 });

eventSchema.pre('save', function (next) {
  if (this.date) {
    const d = new Date(this.date);
    d.setHours(0, 0, 0, 0);
    this.date = d;
  }

  if (this.endDate) {
    const ed = new Date(this.endDate);
    ed.setHours(0, 0, 0, 0);
    this.endDate = ed;
  }

  next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = { Event };
