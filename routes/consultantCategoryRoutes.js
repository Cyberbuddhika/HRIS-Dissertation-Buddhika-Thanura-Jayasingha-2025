/**
 * ============================================================================
 * File: consultantCategoryRoutes.js
 * Description: Route definitions for consultantCategory-related API endpoints.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

const express = require("express");
const consultantCategoryController = require("./../controllers/consultantCategoryController");
const authController = require("../controllers/authController");

const router = express.Router();

// Middleware to activate authentication
router.use(authController.protect);

// Middleware to restrict routes to admin and super admin roles
router.use(authController.restrictTo("admin", "super admin"));

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
  .get(consultantCategoryController.getAllConsultantCategories)
  .post(consultantCategoryController.createConsultantCategory);

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
  .get(consultantCategoryController.getConsultantCategory)
  .patch(consultantCategoryController.updateConsultantCategory)
  .delete(
    authController.restrictTo("super admin"),
    consultantCategoryController.deleteConsultantCategory
  );

module.exports = router;
