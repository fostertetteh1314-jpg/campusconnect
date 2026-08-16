const mongoose = require('mongoose');
const WalletAccount = require('../models/WalletAccount');
const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const { ApiError, asyncHandler } = require('../middleware/errors');
const { createLedgerTransaction } = require('../services/ledger');
const { writeAudit } = require('../services/audit');
const moolre = require('../services/moolre');

const getWallet = asyncHandler(async (req, res) => {
  const wallet = await WalletAccount.findOne({ sellerId: req.user._id }).lean();
  const withdrawals = await Withdrawal.find({ sellerId: req.user._id }).sort({ createdAt: -1 }).limit(50).lean();
  res.json({ wallet: wallet || { sellerId: req.user._id, currency: 'GHS', availableMinor: 0, pendingWithdrawalMinor: 0 }, withdrawals });
});

const requestWithdrawal = asyncHandler(async (req, res) => {
  if (!req.user.phoneVerifiedAt) throw new ApiError(403, 'PHONE_VERIFICATION_REQUIRED', 'Verify your phone before requesting a withdrawal');
  const existing = await Withdrawal.findOne({ idempotencyKey: req.body.idempotencyKey, sellerId: req.user._id });
  if (existing) return res.json(existing);
  const session = await mongoose.startSession();
  let withdrawal;
  try {
    await session.withTransaction(async () => {
      const wallet = await WalletAccount.findOneAndUpdate({ sellerId: req.user._id, availableMinor: { $gte: req.body.amountMinor } }, { $inc: { availableMinor: -req.body.amountMinor, pendingWithdrawalMinor: req.body.amountMinor } }, { new: true, session });
      if (!wallet) throw new ApiError(409, 'WITHDRAWAL_BALANCE_INSUFFICIENT', 'Your available balance is too low for this withdrawal');
      withdrawal = new Withdrawal({ sellerId: req.user._id, amountMinor: req.body.amountMinor, destination: { provider: req.body.provider, accountName: req.body.accountName, accountMask: `***${req.user.phone.slice(-4)}` }, idempotencyKey: req.body.idempotencyKey });
      await withdrawal.save({ session });
      await createLedgerTransaction({ idempotencyKey: `withdrawal:reserve:${withdrawal._id}`, kind: 'withdrawal', withdrawalId: withdrawal._id, session, entries: [{ account: `liability:seller:${req.user._id}:available`, debitMinor: withdrawal.amountMinor }, { account: `liability:withdrawal:${withdrawal._id}:pending`, creditMinor: withdrawal.amountMinor }] });
      await writeAudit({ req, action: 'withdrawal.requested', targetType: 'withdrawal', targetId: withdrawal._id, session });
    });
  } finally { await session.endSession(); }
  res.status(201).json(withdrawal);
});

const reviewWithdrawal = asyncHandler(async (req, res) => {
  const withdrawal = await Withdrawal.findById(req.params.id);
  if (!withdrawal) throw new ApiError(404, 'WITHDRAWAL_NOT_FOUND', 'Withdrawal not found');
  if (withdrawal.status !== 'requested') throw new ApiError(409, 'WITHDRAWAL_NOT_PENDING', 'This withdrawal has already been reviewed');
  let transfer = null;
  if (req.body.action === 'approve') {
    const seller = await User.findById(withdrawal.sellerId);
    if (!seller?.phoneVerifiedAt) throw new ApiError(409, 'WITHDRAWAL_PHONE_UNVERIFIED', 'The seller phone is not verified');
    transfer = await moolre.initiateTransfer({ amountMinor: withdrawal.amountMinor, externalReference: `kobo_wd_${withdrawal._id}`, network: withdrawal.destination.provider, phone: seller.phone, reference: 'KOBO seller withdrawal' });
  }
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      if (req.body.action === 'approve') {
        withdrawal.status = 'processing';
        withdrawal.transferReference = `kobo_wd_${withdrawal._id}`;
        withdrawal.transferCode = String(transfer.data?.transactionid || '');
      }
      else {
        withdrawal.status = 'rejected'; withdrawal.failureReason = req.body.reason;
        await WalletAccount.updateOne({ sellerId: withdrawal.sellerId }, { $inc: { availableMinor: withdrawal.amountMinor, pendingWithdrawalMinor: -withdrawal.amountMinor } }, { session });
        await createLedgerTransaction({ idempotencyKey: `withdrawal:reject:${withdrawal._id}`, kind: 'adjustment', withdrawalId: withdrawal._id, session, entries: [{ account: `liability:withdrawal:${withdrawal._id}:pending`, debitMinor: withdrawal.amountMinor }, { account: `liability:seller:${withdrawal.sellerId}:available`, creditMinor: withdrawal.amountMinor }] });
      }
      withdrawal.reviewedBy = req.user._id; withdrawal.reviewedAt = new Date(); await withdrawal.save({ session });
      await writeAudit({ req, action: `withdrawal.${withdrawal.status}`, targetType: 'withdrawal', targetId: withdrawal._id, session, metadata: { reason: req.body.reason } });
    });
  } finally { await session.endSession(); }
  res.json(withdrawal);
});

const listAll = asyncHandler(async (_req, res) => {
  const withdrawals = await Withdrawal.find().sort({ createdAt: -1 }).populate('sellerId', 'name email phoneVerifiedAt').lean();
  res.json({ withdrawals });
});

module.exports = { getWallet, listAll, requestWithdrawal, reviewWithdrawal };
