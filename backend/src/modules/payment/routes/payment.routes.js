const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const authMiddleware = require("../../../middleware/auth.middleware");

// Protected routes
router.use(authMiddleware.authenticate);

router.post("/initiate", paymentController.post("/initiate"));
router.post("/:id/refund", paymentController.post("/:id/refund"));
router.get("/", paymentController.get("/"));
router.get("/:transactionId", paymentController.get("/:transactionId"));

// Public webhook routes
router.post("/webhook/esewa", paymentController.post("/webhook/esewa"));
router.post("/webhook/khalti", paymentController.post("/webhook/khalti"));

module.exports = router;
