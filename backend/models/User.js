const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { normalizeGhanaPhone } = require('../utils/phone');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    department: { type: String, default: '' },
    level: { type: String, default: '' },
    phone: { type: String, default: '', trim: true, set: normalizeGhanaPhone },
    phoneVerifiedAt: { type: Date, default: null },
    campus: { type: String, trim: true, default: 'UCC' },
    profileImage: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isBanned: { type: Boolean, default: false },
    withdrawalDestination: {
      provider: { type: String, trim: true, default: '' },
      accountName: { type: String, trim: true, default: '' },
      accountMask: { type: String, trim: true, default: '' },
    },
  },
  { timestamps: true }
);

userSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: 'string', $ne: '' } } }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
