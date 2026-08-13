// Minimal auth middleware for local development only
module.exports = {
  authenticate: (req, res, next) => {
    // Inject a dev admin user for protected routes
    req.user = { _id: "dev-user", roles: [{ name: "admin" }] };
    next();
  },
  checkPermission: (/* permission */) => (req, res, next) => {
    // Allow all permissions in local dev
    next();
  },
};
