/**
 * ============================================================================
 * File: consultantRoutes.js
 * Description: Routes for handling consultant-related operations.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

const express = require("express");
const consultantController = require("./../controllers/consultantController");
const authController = require("../controllers/authController");

const router = express.Router();

// Middleware to activate authentication
router.use(authController.protect);

/**
 * @route   GET /api/v1/consultants
 * @desc    Get all consultants
 * @access  Private (Managers, Admin & Super Admin)
 *
 * @route   POST /api/v1/consultants
 * @desc    Create a new consultant
 * @access  Private (Admin & Super Admin)
 * */

router
  .route("/")
  .get(
    authController.restrictTo("manager", "admin", "super admin"),
    consultantController.getAllConsultants
  )
  .post(
    authController.restrictTo("admin", "super admin"),
    consultantController.createConsultant
  );

/**
 * @route   GET /api/v1/consultants/:id
 * @desc    Get a single consultant by ID
 * @access  Private (Managers, Admin & Super Admin)
 *
 * @route   PATCH /api/v1/consultants/:id
 * @desc    Update a consultant by ID
 * @access  Private (Admin & Super Admin)
 *
 * @route   DELETE /api/v1/consultants/:id
 * @desc    Delete a consultant by ID
 * @access  Private (Super Admin only)
 */

router
  .route("/:id")
  .get(
    // authController.restrictTo("admin", "super admin"),
    consultantController.getConsultant
  )
  .patch(
    authController.restrictTo("admin", "super admin"),
    consultantController.updateConsultant
  )
  .delete(
    authController.restrictTo("super admin"),
    consultantController.deleteConsultant
  );

/**
 * @route   GET /api/v1/consultants/line-manager/:userId
 * @desc    Get consultants for the Line manager
 * @access  Private (Managers, Admin)
 *
 * */
router.get(
  "/line-manager/:consultantId",
  authController.restrictTo("leader", "admin", "super admin"),
  consultantController.getConsultantsForLineManager
);

module.exports = router;
