/**
 * ============================================================================
 * File: projectRoutes.js
 * Description: Route definitions for Project-related API endpoints.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

const express = require("express");
const authController = require("../controllers/authController");
const projectController = require("./../controllers/projectController");

const router = express.Router();

// Protect all routes
router.use(authController.protect);

// -------------------- Admin & Super Admin Access -------------------- //

/**
 * @desc Get all projects
 * @route GET /api/v1/projects
 * @access Private (Managers, Admin & Super Admins Only)
 */
/**
 * @desc Create a projects
 * @route POST /api/v1/projects
 * @access Private (Admin & Super Admins Only)
 */

router
  .route("/")
  .get(
    authController.restrictTo("admin", "super admin"),
    projectController.getAllProjects
  )
  .post(
    authController.restrictTo("admin", "super admin"),
    projectController.createProject
  );

/**
 * @desc Get a single project
 * @route GET /api/v1/projects/:id
 * @access Private (Managers, Admin & Super Admins Only)
 */
/**
 * @desc Get a single project
 * @route PATCH /api/v1/projects/:id
 * @access Private (Admin & Super Admins Only)
 */
/**
 * @desc Get a single project
 * @route DELETE /api/v1/projects/:id
 * @access Private (Super Admins Only)
 */

router
  .route("/:id")
  .get(
    authController.restrictTo("admin", "super admin"),
    projectController.getProject
  )
  .patch(
    authController.restrictTo("admin", "super admin"),
    projectController.updateProject
  )
  .delete(
    authController.restrictTo("super admin"),
    projectController.deleteProject
  );

module.exports = router;
