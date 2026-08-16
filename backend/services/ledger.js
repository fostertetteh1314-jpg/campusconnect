const LedgerTransaction = require('../models/LedgerTransaction');
const WalletAccount = require('../models/WalletAccount');

const createLedgerTransaction = async ({ idempotencyKey, kind, orderId = null, withdrawalId = null, entries, metadata = {}, session = null }) => {
  const debit = entries.reduce((sum, entry) => sum + (entry.debitMinor || 0), 0);
  const credit = entries.reduce((sum, entry) => sum + (entry.creditMinor || 0), 0);
  if (!entries.length || debit !== credit) throw new Error('Unbalanced ledger transaction');
  try {
    const [created] = await LedgerTransaction.create([{ idempotencyKey, kind, orderId, withdrawalId, entries, metadata }], session ? { session } : undefined);
    return created;
  } catch (error) {
    if (error.code === 11000) return LedgerTransaction.findOne({ idempotencyKey }).session(session || null);
    throw error;
  }
};

const postPayment = ({ order, eventKey, session }) => createLedgerTransaction({
  idempotencyKey: `payment:${eventKey}`,
  kind: 'payment', orderId: order._id, session,
  entries: [
    { account: 'asset:moolre_receivable', debitMinor: order.totalMinor },
    { account: `liability:order:${order._id}:held`, creditMinor: order.totalMinor },
  ],
});

const releaseOrder = async ({ order, session }) => {
  const transaction = await createLedgerTransaction({
    idempotencyKey: `release:order:${order._id}`,
    kind: 'release', orderId: order._id, session,
    entries: [
      { account: `liability:order:${order._id}:held`, debitMinor: order.totalMinor },
      { account: `liability:seller:${order.sellerId}:available`, creditMinor: order.itemAmountMinor },
      ...(order.platformFeeMinor ? [{ account: 'revenue:platform_fees', creditMinor: order.platformFeeMinor }] : []),
    ],
  });
  await WalletAccount.updateOne({ sellerId: order.sellerId }, { $inc: { availableMinor: order.itemAmountMinor }, $setOnInsert: { currency: 'GHS' } }, { upsert: true, session });
  return transaction;
};

const accountBalance = async (account) => {
  const [result] = await LedgerTransaction.aggregate([
    { $unwind: '$entries' },
    { $match: { 'entries.account': account } },
    { $group: { _id: null, credits: { $sum: '$entries.creditMinor' }, debits: { $sum: '$entries.debitMinor' } } },
  ]);
  return (result?.credits || 0) - (result?.debits || 0);
};

module.exports = { accountBalance, createLedgerTransaction, postPayment, releaseOrder };
