const axios = require('axios');
const logger = require('../../utils/logger');

class SMSService {
  /**
   * Send SMS notification
   */
  async sendSMS({ to, message }) {
    try {
      // Using a generic SMS gateway - replace with actual provider (Twilio, Sparrow SMS, etc.)
      const response = await axios.post(
        process.env.SMS_GATEWAY_URL || 'https://api.smsprovider.com/send',
        {
          to,
          message,
          sender_id: process.env.SMS_SENDER_ID || 'HOTEL'
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.SMS_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`SMS sent to ${to}: ${message.substring(0, 50)}...`);
      
      return {
        success: true,
        messageId: response.data.messageId
      };
    } catch (error) {
      logger.error('Error sending SMS:', error.message);
      // Don't throw - SMS failure shouldn't break the booking flow
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send booking confirmation SMS
   */
  async sendBookingConfirmation({ to, booking }) {
    const message = `Booking Confirmed! Ref: ${booking.bookingReference}. Check-in: ${new Date(booking.checkIn).toLocaleDateString()}. Check-out: ${new Date(booking.checkOut).toLocaleDateString()}. Total: NPR ${booking.pricing.total}. Thank you for choosing us!`;
    
    return await this.sendSMS({ to, message });
  }

  /**
   * Send booking reminder SMS
   */
  async sendBookingReminder({ to, booking }) {
    const checkInDate = new Date(booking.checkIn).toLocaleDateString();
    const message = `Reminder: Your booking ${booking.bookingReference} is scheduled for ${checkInDate}. We look forward to welcoming you! For changes, contact us at +977-1-XXXXXXX.`;
    
    return await this.sendSMS({ to, message });
  }

  /**
   * Send OTP SMS
   */
  async sendOTP({ to, otp }) {
    const message = `Your verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
    
    return await this.sendSMS({ to, message });
  }

  /**
   * Send payment confirmation SMS
   */
  async sendPaymentConfirmation({ to, transactionId, amount }) {
    const message = `Payment Successful! Amount: NPR ${amount}. Transaction ID: ${transactionId}. Thank you for your payment.`;
    
    return await this.sendSMS({ to, message });
  }
}

module.exports = new SMSService();
