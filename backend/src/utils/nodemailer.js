// Minimal nodemailer stub for local development when the package is not installed
module.exports = {
  createTransport: () => ({
    sendMail: async () => {
      return {
        accepted: [],
        rejected: [],
        envelope: {},
        messageId: "<local-dev-mailer>",
      };
    },
  }),
};
