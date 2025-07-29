/**
 * ============================================================================
 * File: consultantChargeOutRateRoutes.js
 * Description: Route definitions for ConsultantChargeOutRate-related API endpoints.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

const express = require("express");
const consultantChargeOutRateController = require("./../controllers/consultantChargeOutRateController");
const authController = require("../controllers/authController");

const router = express.Router();

// Middleware to activate authentication
router.use(authController.protect);

// Middleware to restrict routes to admin and super admin roles
router.use(authController.restrictTo("admin", "super admin"));

/**
 * @desc Get all consultant charge out rates
 * @route GET /api/v1/consultant-charge-out-rates
 * @access Private (Admin & Super Admins Only)
 */
/**
 * @desc Create a new consultant charge out rate
 * @route POST /api/v1/consultant-charge-out-rates
 * @access Private (Admin & Super Admins Only)
 */
router
  .route("/")
  .get(consultantChargeOutRateController.getAllConsultantChargeOutRates)
  .post(consultantChargeOutRateController.createConsultantChargeOutRate);

/**
 * @desc Get a single consultant charge out rate
 * @route GET /api/v1/consultant-charge-out-rates/:id
 * @access Private (Admin & Super Admins Only)
 */
/**
 * @desc Update a consultant charge out rate
 * @route PATCH /api/v1/consultant-charge-out-rates/:id
 * @access Private (Admin & Super Admins Only)
 */
/**
 * @desc Delete a consultant charge out rate
 * @route DELETE /api/v1/consultant-charge-out-rates/:id
 * @access Private (Super Admins Only)
 */
router
  .route("/:id")
  .get(consultantChargeOutRateController.getConsultantChargeOutRate)
  .patch(consultantChargeOutRateController.updateConsultantChargeOutRate)
  .delete(
    authController.restrictTo("super admin"),
    consultantChargeOutRateController.deleteConsultantChargeOutRate
  );

module.exports = router;
