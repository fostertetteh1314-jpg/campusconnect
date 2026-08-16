const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    priceMinor: { type: Number, min: 0, default: null },
    category: {
      type: String,
      required: true,
      // Keep the legacy value readable until the explicit migration has run.
      enum: ['Typing', 'Graphic Design', 'Printing', 'Assignment Help', 'Academic Support', 'Programming', 'Tutorials', 'Other'],
    },
    contactNumber: { type: String, required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    isFlagged: { type: Boolean, default: false },
    campus: { type: String, trim: true, default: 'UCC' },
    location: { type: String, trim: true, maxlength: 120, default: '' },
    fulfilmentMethods: { type: [{ type: String, enum: ['campus_pickup', 'public_meetup', 'delivery', 'digital'] }], default: ['public_meetup', 'digital'] },
  },
  { timestamps: true }
);

serviceSchema.pre('validate', function maintainMinorPrice(next) {
  if (this.priceMinor === null || this.isModified('price')) this.priceMinor = Math.round(this.price * 100);
  next();
});

serviceSchema.index({ title: 'text', description: 'text' });
serviceSchema.index({ providerId: 1, createdAt: -1 });

module.exports = mongoose.model('Service', serviceSchema);
