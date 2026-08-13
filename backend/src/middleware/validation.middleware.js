// Minimal validation middleware for local development only
module.exports = {
  validate: (_schema) => (req, res, next) => {
    // Skip validation in dev environment
    next();
  },
};
