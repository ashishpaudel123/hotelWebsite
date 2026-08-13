const nodemailer = require("../../../utils/nodemailer");
const logger = require("../../../utils/logger");

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

class EmailService {
  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation({ to, booking }) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0F4C75; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 24px; background: #D4AF37; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmation</h1>
            </div>
            <div class="content">
              <p>Dear ${booking.guestDetails.firstName} ${booking.guestDetails.lastName},</p>
              <p>Your booking has been confirmed successfully!</p>
              
              <div class="booking-details">
                <h2>Booking Details</h2>
                <div class="detail-row">
                  <strong>Booking Reference:</strong>
                  <span>${booking.bookingReference}</span>
                </div>
                <div class="detail-row">
                  <strong>Check-in Date:</strong>
                  <span>${new Date(booking.checkIn).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <strong>Check-out Date:</strong>
                  <span>${new Date(booking.checkOut).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <strong>Total Amount:</strong>
                  <span>NPR ${booking.pricing.total.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                  <strong>Payment Status:</strong>
                  <span>${booking.paymentStatus.toUpperCase()}</span>
                </div>
                ${booking.rooms
                  .map(
                    (room) => `
                  <div class="detail-row">
                    <strong>Room Type:</strong>
                    <span>${room.roomTypeId?.name || "Room"} x ${room.quantity}</span>
                  </div>
                `,
                  )
                  .join("")}
              </div>
              
              <p>We look forward to welcoming you!</p>
              
              <a href="${process.env.FRONTEND_URL || "https://yourhotel.com"}/bookings/${booking.bookingReference}" class="button">View Booking</a>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Hotel Management System. All rights reserved.</p>
              <p>If you have any questions, please contact us at support@hotel.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || "Hotel Management"}" <${process.env.SMTP_FROM_EMAIL || "noreply@hotel.com"}>`,
        to,
        subject: `Booking Confirmation - ${booking.bookingReference}`,
        html,
      });

      logger.info(`Booking confirmation email sent to ${to}`);
    } catch (error) {
      logger.error("Error sending booking confirmation email:", error);
      throw error;
    }
  }

  /**
   * Send booking cancellation email
   */
  async sendBookingCancellation({ to, booking, reason }) {
    const refundAmount = booking.cancellationPolicy?.refundAmount || 0;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Cancelled</h1>
            </div>
            <div class="content">
              <p>Dear ${booking.guestDetails.firstName} ${booking.guestDetails.lastName},</p>
              <p>Your booking has been cancelled as per your request.</p>
              
              <div class="booking-details">
                <h2>Cancellation Details</h2>
                <div class="detail-row">
                  <strong>Booking Reference:</strong>
                  <span>${booking.bookingReference}</span>
                </div>
                <div class="detail-row">
                  <strong>Cancellation Reason:</strong>
                  <span>${reason || "Not provided"}</span>
                </div>
                <div class="detail-row">
                  <strong>Refund Amount:</strong>
                  <span>NPR ${refundAmount.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                  <strong>Refund Status:</strong>
                  <span>${booking.paymentStatus === "refunded" ? "Processed" : "Processing"}</span>
                </div>
              </div>
              
              <p>The refund will be processed within 5-7 business days.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Hotel Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || "Hotel Management"}" <${process.env.SMTP_FROM_EMAIL || "noreply@hotel.com"}>`,
        to,
        subject: `Booking Cancelled - ${booking.bookingReference}`,
        html,
      });

      logger.info(`Booking cancellation email sent to ${to}`);
    } catch (error) {
      logger.error("Error sending booking cancellation email:", error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset({ to, resetToken, username }) {
    const resetUrl = `${process.env.FRONTEND_URL || "https://yourhotel.com"}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <body>
          <h2>Password Reset Request</h2>
          <p>Hello ${username},</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </body>
      </html>
    `;

    try {
      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || "Hotel Management"}" <${process.env.SMTP_FROM_EMAIL || "noreply@hotel.com"}>`,
        to,
        subject: "Password Reset Request",
        html,
      });

      logger.info(`Password reset email sent to ${to}`);
    } catch (error) {
      logger.error("Error sending password reset email:", error);
      throw error;
    }
  }
}

module.exports = new EmailService();
