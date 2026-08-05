module.exports = {
  esewa: {
    merchantCode: process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST',
    secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH+1/q+',
    paymentUrl: process.env.ESEWA_PAYMENT_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
    successUrl: process.env.ESEWA_SUCCESS_URL || 'https://yourhotel.com/payment/success',
    failureUrl: process.env.ESEWA_FAILURE_URL || 'https://yourhotel.com/payment/failure',
    verificationUrl: process.env.ESEWA_VERIFICATION_URL || 'https://rc-epay.esewa.com.np/api/epay/transaction/status/',
    environment: process.env.ESEWA_ENV || 'test' // test or production
  },
  khalti: {
    secretKey: process.env.KHALTI_SECRET_KEY || 'test_secret_key_f59e0b7d9352977f9aecdcdf6e94f8159014acdd7e6a43ece6fe52a24e9a1a58',
    publicKey: process.env.KHALTI_PUBLIC_KEY || 'test_public_key_dc74e0fd57cb46cd93832aee0a3902344d9deb1f9a2c84fbc1a74ba90183f816',
    initiationUrl: process.env.KHALTI_INITIATION_URL || 'https://a.khalti.com/api/v2/epayment/initiate/',
    verificationUrl: process.env.KHALTI_VERIFICATION_URL || 'https://a.khalti.com/api/v2/epayment/lookup/',
    successUrl: process.env.KHALTI_SUCCESS_URL || 'https://yourhotel.com/payment/success',
    websiteUrl: process.env.KHALTI_WEBSITE_URL || 'https://yourhotel.com',
    environment: process.env.KHALTI_ENV || 'test' // test or production
  }
};
