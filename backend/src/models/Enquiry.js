const mongoose = require('mongoose');
const { Schema } = mongoose;

const enquirySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
      index: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 15,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ['new', 'read', 'responded'],
      default: 'new',
      index: true,
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      index: true,
    },

    response: {
      type: String,
      default: null,
      trim: true,
    },

    respondedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    respondedAt: {
      type: Date,
      default: null,
    },

    forwardedToEmail: {
      type: String,
      default: null,
    },

    isForwarded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

enquirySchema.index({ status: 1, createdAt: -1 });

enquirySchema.pre('save', function (next) {
  if (this.message) {
    const msg = this.message.toLowerCase();

    if (
      msg.includes('urgent') ||
      msg.includes('asap') ||
      msg.includes('immediately')
    ) {
      this.priority = 'high';
    }
  }
  next();
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);

module.exports = { Enquiry };
