const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  account: { type: String, required: true, immutable: true },
  debitMinor: { type: Number, min: 0, default: 0, immutable: true },
  creditMinor: { type: Number, min: 0, default: 0, immutable: true },
}, { _id: false });

const ledgerTransactionSchema = new mongoose.Schema({
  idempotencyKey: { type: String, required: true, unique: true, immutable: true },
  kind: { type: String, enum: ['payment', 'release', 'refund', 'withdrawal', 'adjustment'], required: true, immutable: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null, immutable: true, index: true },
  withdrawalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Withdrawal', default: null, immutable: true },
  currency: { type: String, enum: ['GHS'], default: 'GHS', immutable: true },
  entries: { type: [entrySchema], required: true, immutable: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {}, immutable: true },
}, { timestamps: true });

ledgerTransactionSchema.pre('validate', function validateBalancedLedger(next) {
  const debit = this.entries.reduce((sum, entry) => sum + entry.debitMinor, 0);
  const credit = this.entries.reduce((sum, entry) => sum + entry.creditMinor, 0);
  const invalidEntry = this.entries.some((entry) => (entry.debitMinor > 0) === (entry.creditMinor > 0));
  if (!this.entries.length || debit !== credit || invalidEntry) return next(new Error('Ledger transaction must contain balanced one-sided entries'));
  next();
});

module.exports = mongoose.model('LedgerTransaction', ledgerTransactionSchema);
