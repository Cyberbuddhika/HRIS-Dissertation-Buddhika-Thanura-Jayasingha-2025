/**
 * ============================================================================
 * File: consultantLeaveRoutes.js
 * Description: Route definitions for consultantLeave-related API endpoints.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

const express = require("express");
const consultantLeaveController = require("./../controllers/consultantLeaveController");
const authController = require("../controllers/authController");

const router = express.Router();

// Middleware to activate authentication
router.use(authController.protect);

// Middleware to restrict routes to admin and super admin roles
// router.use(authController.restrictTo("admin", "super admin"));

/**
 * @desc Get all consultant categories
 * @route GET /api/v1/consultant-category
 * @access Private (Admin & Super Admins Only)
/**
 * @desc Create a new consultant category
 * @route POST /api/v1/consultant-category
 * @access Private (Admin & Super Admins Only)
 */
router
  .route("/")
  .get(consultantLeaveController.getAllConsultantLeaveCategories)
  .post(
    authController.restrictTo("admin", "super admin"),
    consultantLeaveController.createConsultantLeaveCategories
  );

/**
 * @desc Get a single consultant category
 * @route GET /api/v1/consultant-category/:id
 * @access Private (Admin & Super Admins Only)
 */
/**
 * @desc Update a consultant category
 * @route PATCH /api/v1/consultant-category/:id
 * @access Private (Admin & Super Admins Only)
 */
/**
 * @desc Delete a consultant category
 * @route DELETE /api/v1/consultant-category/:id
 * @access Private (Super Admins Only)
 */
router
  .route("/:id")
  .get(consultantLeaveController.getConsultantLeaveCategories)
  .patch(consultantLeaveController.updateConsultantLeaveCategories)
  .delete(
    authController.restrictTo("super admin"),
    consultantLeaveController.deleteConsultantLeaveCategories
  );

module.exports = router;
