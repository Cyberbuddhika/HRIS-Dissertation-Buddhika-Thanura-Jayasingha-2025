/**
 * ============================================================================
 * File: milestoneRoutes.js
 * Description: Route definitions for Milestone-related API endpoints.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

const express = require("express");
const milestoneController = require("./../controllers/milestoneController");
const authController = require("../controllers/authController");

const router = express.Router();

// Protect all routes
router.use(authController.protect);

// -------------------- Admin & Super Admin Access -------------------- //

/**
 * @desc Get all milestones
 * @route GET /api/v1/milestones
 * @access Private (Managers, Admin & Super Admins Only)
 */
/**
 * @desc Create a new milestone
 * @route POST /api/v1/milestones
 * @access Private (Admin & Super Admins Only)
 */
router
  .route("/")
  .get(
    authController.restrictTo("admin", "super admin"),
    milestoneController.getAllMilestones
  )
  .post(
    authController.restrictTo("admin", "super admin"),
    milestoneController.createMilestone
  );

/**
 * @desc Get a single milestone
 * @route GET /api/v1/milestones/:id
 * @access Private (Managers, Admin & Super Admins Only)
 */
/**
 * @desc Update a milestone
 * @route PATCH /api/v1/milestones/:id
 * @access Private (Admin & Super Admins Only)
 */
/**
 * @desc Delete a milestone
 * @route DELETE /api/v1/milestones/:id
 * @access Private (Super Admins Only)

 */
router
  .route("/:id")
  .get(
    authController.restrictTo("admin", "super admin"),
    milestoneController.getMilestone
  )
  .patch(
    authController.restrictTo("admin", "super admin"),
    milestoneController.updateMilestone
  )
  .delete(
    authController.restrictTo("super admin"),
    milestoneController.deleteMilestone
  );

module.exports = router;
