const { ApiError } = require('../middleware/errors');
const { normalizeGhanaPhone } = require('../utils/phone');

const collectionChannels = { MTN: '13', TELECEL: '6', AT: '7' };
const transferChannels = { MTN: '1', TELECEL: '6', AT: '7' };

const baseUrl = () => (process.env.MOOLRE_ENV === 'sandbox' ? 'https://sandbox.moolre.com' : 'https://api.moolre.com');
const accountNumber = () => {
  if (!process.env.MOOLRE_ACCOUNT_NUMBER) throw new ApiError(503, 'PAYMENT_PROVIDER_UNAVAILABLE', 'Payments are temporarily unavailable');
  return process.env.MOOLRE_ACCOUNT_NUMBER;
};

const requireCredential = (name) => {
  if (!process.env[name]) throw new ApiError(503, 'PAYMENT_PROVIDER_UNAVAILABLE', 'Payments are temporarily unavailable');
  return process.env[name];
};

const localPhone = (phone) => normalizeGhanaPhone(phone).replace(/^\+233/, '0');
const majorAmount = (amountMinor) => (Number(amountMinor) / 100).toFixed(2);
const minorAmount = (amount) => Math.round(Number.parseFloat(String(amount)) * 100);

const request = async (path, { keyType = 'public', body }) => {
  const keyHeader = keyType === 'private' ? 'X-API-KEY' : 'X-API-PUBKEY';
  const keyName = keyType === 'private' ? 'MOOLRE_PRIVATE_KEY' : 'MOOLRE_PUBLIC_KEY';
  const response = await fetch(`${baseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-USER': requireCredential('MOOLRE_API_USER'),
      [keyHeader]: requireCredential(keyName),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(12_000),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !['1', 1].includes(payload.status)) {
    const error = new ApiError(502, 'PAYMENT_PROVIDER_ERROR', payload.message || 'The payment provider could not complete this request');
    error.providerCode = payload.code;
    throw error;
  }
  return payload;
};

const initiateCollection = ({ amountMinor, externalReference, network, otpCode, phone }) => {
  const channel = collectionChannels[network];
  if (!channel) throw new ApiError(400, 'PAYMENT_NETWORK_INVALID', 'Choose a supported mobile money network');
  return request('/open/transact/payment', {
    body: {
      type: 1,
      channel,
      currency: 'GHS',
      payer: localPhone(phone),
      amount: majorAmount(amountMinor),
      externalref: externalReference,
      accountnumber: accountNumber(),
      ...(otpCode ? { otpcode: otpCode } : {}),
      ...(process.env.MOOLRE_ENV === 'sandbox' && process.env.MOOLRE_SANDBOX_SKIP_OTP === 'true' ? { skipotp: true } : {}),
    },
  });
};

const checkPayment = (externalReference) => request('/open/transact/status', {
  body: { type: 1, idtype: 1, id: externalReference, accountnumber: accountNumber() },
});

const initiateTransfer = ({ amountMinor, externalReference, network, phone, reference }) => {
  const channel = transferChannels[network];
  if (!channel) throw new ApiError(400, 'WITHDRAWAL_NETWORK_INVALID', 'Choose a supported mobile money network');
  return request('/open/transact/transfer', {
    keyType: 'private',
    body: {
      type: 1,
      channel,
      currency: 'GHS',
      amount: majorAmount(amountMinor),
      receiver: localPhone(phone),
      externalref: externalReference,
      reference: reference || 'KOBO seller withdrawal',
      accountnumber: accountNumber(),
    },
  });
};

const checkTransfer = (externalReference) => request('/open/transact/status', {
  keyType: 'private',
  body: { type: 1, idtype: 1, id: externalReference, accountnumber: accountNumber() },
});

const isSuccessful = (payload) => ['1', 1].includes(payload?.status) && ['1', 1].includes(payload?.data?.txstatus);

module.exports = { checkPayment, checkTransfer, initiateCollection, initiateTransfer, isSuccessful, minorAmount };
