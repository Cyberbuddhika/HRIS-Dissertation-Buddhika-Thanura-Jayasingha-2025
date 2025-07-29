/**
 * ============================================================================
 * File: userController.js
 * Description: Controller functions for handling User-related API requests.
 * Author: Buddhika Jayasingha

 * ============================================================================
 */

const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");

/**
 * Filters an object to only include specified allowed fields.
 * @param {Object} obj - The object to filter.
 * @param {...string} allowedFields - The fields to allow.
 * @returns {Object} - The filtered object.
 */
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

/**
 * @desc Get all users
 * @route GET /api/v1/users
 * @access Private (Admin Only)
 * @todo Make it accessible only to Admins
 */
exports.getAllUsers = factory.getAll(User);

/**
 * @desc Get a single user by ID
 * @route GET /api/v1/users/:id
 * @access Private (Admin Only)
 * @todo Make it accessible only to Admins
 */
exports.getUser = factory.getOne(User);

/**
 * @desc Create a new user
 * @route POST /api/v1/users
 * @access Private (Admin Only)
 * @todo Make it accessible only to Admins
 */
exports.createUser = factory.createOne(User);

/**
 * @desc Update a user by ID
 * @route PATCH /api/v1/users/:id
 * @access Private (Admin Only)
 * @todo Make it accessible only to Admins
 */
exports.updateUser = factory.updateOne(User);

/**
 * @desc Delete a user by ID
 * @route DELETE /api/v1/users/:id
 * @access Private (Admin Only)
 * @todo Make it accessible only to Admins
 */
exports.deleteUser = factory.deleteOne(User);

/**
 * @desc Middleware to get the currently authenticated user
 * @route GET /api/v1/users/me
 * @access Private (Authenticated User)
 */
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

/**
 * @desc Update the currently authenticated user's details
 * @route PATCH /api/v1/users/updateMe
 * @access Private (Authenticated User)
 */
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1. Create an error if user POSTs password data
  if (req.body.password || req.body.passwordConfirmation) {
    return next(
      new AppError(
        "This route is not for password updating. Please use /updateMyPassword.",
        400
      )
    );
  }

  // 2. Filter out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "photo"); // we want name and photo to be able to change

  // 3. Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

/**
 * @desc Create the initial admin user
 * @route POST /api/v1/users/createInitialAdmin
 * @access Public (Should be removed or disabled after initial use)
 */
exports.createInitialAdmin = catchAsync(async (req, res, next) => {
  // Check if the initial admin already exists
  const existingAdmin = await User.findOne({ role: "super admin" });

  if (existingAdmin) {
    return next(new AppError("Initial admin user already exists", 400));
  }

  // Validate credentials from the request body or environment variables
  const { email, password, passwordConfirmation } = req.body;

  if (
    email !== process.env.INITIAL_ADMIN_EMAIL ||
    password !== process.env.INITIAL_ADMIN_PASSWORD
  ) {
    return next(new AppError("Invalid credentials", 400));
  }

  // Create the initial admin user
  const newAdmin = await User.create({
    name: "Initial Admin",
    email,
    password,
    passwordConfirmation,
    role: "super admin",
    active: true,
  });

  res.status(201).json({
    status: "success",
    data: {
      user: newAdmin,
    },
  });
});
