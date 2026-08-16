const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    priceMinor: { type: Number, min: 0, default: null },
    quantity: { type: Number, min: 0, default: 1 },
    category: {
      type: String,
      required: true,
      enum: ['Textbooks', 'Calculators', 'Laptops', 'Phones', 'Hostel Items', 'Furniture', 'Other'],
    },
    condition: {
      type: String,
      required: true,
      enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
    },
    images: [{ type: String }],
    contactNumber: { type: String, required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    isFlagged: { type: Boolean, default: false },
    campus: { type: String, trim: true, default: 'UCC' },
    location: { type: String, trim: true, maxlength: 120, default: '' },
    fulfilmentMethods: { type: [{ type: String, enum: ['campus_pickup', 'public_meetup', 'delivery'] }], default: ['campus_pickup', 'public_meetup'] },
    lifecycleStatus: { type: String, enum: ['draft', 'active', 'reserved', 'sold', 'archived'], default: 'active' },
  },
  { timestamps: true }
);

listingSchema.index({ title: 'text', description: 'text' });
listingSchema.index({ sellerId: 1, createdAt: -1 });

listingSchema.pre('validate', function maintainMinorPrice(next) {
  if (this.priceMinor === null || this.isModified('price')) this.priceMinor = Math.round(this.price * 100);
  next();
});

module.exports = mongoose.model('Listing', listingSchema);
