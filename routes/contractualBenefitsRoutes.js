/**
 * ============================================================================
 * File: contractualBenefitsRoutes.js
 * Description: Route definitions for contractualBenefits-related API endpoints.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

const express = require("express");
const contractualBenefitsController = require("./../controllers/contractualBenefitsController");
const authController = require("../controllers/authController");

const router = express.Router();

// Middleware to activate authentication
router.use(authController.protect);

// Middleware to restrict routes to admin and super admin roles
router.use(authController.restrictTo("admin", "super admin"));

/**
 * @desc Get all consultant Benefits
 * @route GET /api/v1/consultant-benefits
 * @access Private (Admin & Super Admins Only)
 */
/**
 * @desc Create a new consultant Benefits
 * @route POST /api/v1/consultant-benefits
 * @access Private (Admin & Super Admins Only)
 */
router
  .route("/")
  .get(contractualBenefitsController.getAllContractualBenefits)
  .post(contractualBenefitsController.createContractualBenefit);

/**
 * @desc Get a single consultant Benefits
 * @route GET /api/v1/consultant-benefits/:id
 * @access Private (Admin & Super Admins Only)
 */
/**
 * @desc Update a consultant Benefits
 * @route PATCH /api/v1/consultant-benefits/:id
 * @access Private (Admin & Super Admins Only)
 */
/**
 * @desc Delete a consultant Benefits
 * @route DELETE /api/v1/consultant-benefits/:id
 * @access Private (Super Admins Only)
 */
router
  .route("/:id")
  .get(contractualBenefitsController.getContractualBenefit)
  .patch(contractualBenefitsController.updateContractualBenefit)
  .delete(
    authController.restrictTo("super admin"),
    contractualBenefitsController.deleteContractualBenefit
  );

module.exports = router;
