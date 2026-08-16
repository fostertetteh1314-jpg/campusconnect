const sendMoolreSms = async ({ to, message, reference }) => {
  const vasKey = process.env.MOOLRE_VAS_KEY;
  const sender = process.env.MOOLRE_SENDER_ID || 'KOBO';
  if (!vasKey) throw new Error('MOOLRE_VAS_KEY is required');
  if (sender.length > 11) throw new Error('MOOLRE_SENDER_ID must be 11 characters or fewer');

  const response = await fetch(`${process.env.MOOLRE_ENV === 'sandbox' ? 'https://sandbox.moolre.com' : 'https://api.moolre.com'}/open/sms/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-VASKEY': vasKey },
    body: JSON.stringify({ type: 1, senderid: sender, messages: [{ recipient: to.replace(/^\+233/, '0'), message, ref: reference }] }),
    signal: AbortSignal.timeout(10_000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !['1', 1].includes(result.status) || result.code !== 'SMS01') {
    throw new Error(`Moolre SMS request failed with status ${response.status}`);
  }
};

const sendVerificationCode = async ({ phone, code }) => {
  const provider = process.env.OTP_PROVIDER || (process.env.NODE_ENV === 'test' ? 'test' : '');
  if (provider === 'test') return;
  if (provider === 'console' && process.env.NODE_ENV !== 'production') {
    console.info('Development OTP generated', { phone, code });
    return;
  }
  if (provider === 'moolre') {
    await sendMoolreSms({ to: phone, message: `Your KOBO verification code is ${code}. It expires in 10 minutes.`, reference: `otp-${Date.now()}` });
    return;
  }
  throw new Error('No supported OTP provider is configured');
};

module.exports = { sendVerificationCode };
