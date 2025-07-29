/**
 * ============================================================================
 * File: userRoutes.js
 * Description: Route definitions for User-related API endpoints.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();

/**
 * @desc Create the initial admin user
 * @route POST /api/v1/users/createInitialAdmin
 * @access Public (Should be removed or disabled after initial use)
 */
if (process.env.NODE_ENV !== "production") {
  router.post("/createInitialAdmin", userController.createInitialAdmin);
}

/**
 * @desc Login route
 * @route POST /api/v1/users/login
 * @access Public
 */
router.post("/login", authController.login);

/**
 * @desc Logout route
 * @route POST /api/v1/users/logout
 * @access authenticated
 */
router.get("/logout", authController.logout);

/**
 * @desc Forgot password route
 * @route POST /api/v1/users/forgotPassword
 * @access Public
 */
router.post("/forgotPassword", authController.forgotPassword);

/**
 * @desc Reset password route
 * @route PATCH /api/v1/users/resetPassword/:token
 * @access Public
 */
router.patch("/resetPassword/:token", authController.resetPassword);

// Middleware to protect all routes that come after this middleware
router.use(authController.protect);

/**
 * @desc Update the logged-in user's password
 * @route PATCH /api/v1/users/updateMyPassword
 * @access Private (Authenticated users)
 */
router.patch("/updateMyPassword", authController.updatePassword);

/**
 * @desc Get the logged-in user's details
 * @route GET /api/v1/users/me
 * @access Private (Authenticated users)
 */
router.get("/me", userController.getMe, userController.getUser);

/**
 * @desc Update the logged-in user's details
 * @route PATCH /api/v1/users/updateMe
 * @access Private (Authenticated users)
 */
router.patch("/updateMe", userController.updateMe);

// router.route("/:id").get(userController.getUser);

// Middleware to restrict routes to admin and super admin roles
router.use(authController.restrictTo("admin", "super admin"));

/**
 * @desc Get all users
 * @route GET /api/v1/users
 * @access Private (Admin and Super Admin)
 */
/**
 * @desc Create a new user
 * @route POST /api/v1/users
 * @access Private (Admin and Super Admin)
 */
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

/**
 * @desc Get a single user
 * @route GET /api/v1/users/:id
 * @access Private (Admin and Super Admin)
 */

/**
 * @desc Update a user
 * @route PATCH /api/v1/users/:id
 * @access Private (Admin and Super Admin)
 */
/**
 * @desc Delete a user
 * @route DELETE /api/v1/users/:id
 * @access Private (Super Admin)
 */
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(authController.restrictTo("super admin"), userController.deleteUser);

module.exports = router;
