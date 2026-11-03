const mongoose = require('mongoose');
const crypto = require('crypto');
const pullItemSchema = require('./pullItemSchema');

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      default: 'customer', // 'customer' or 'employee'
    },
    status: {
      type: String,
      required: true,
      default: 'active', // 'active' or 'disabled'
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    pullList: {
      type: [pullItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

userSchema.add({ emailVerificationToken: String, emailVerificationExpires: Date });

userSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

module.exports = mongoose.model('User', userSchema);
