/**
 * ============================================================================
 * File: consultantController.js
 * Description: Controller for handling consultant-related operations.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

const Consultant = require("./../models/consultantModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const factory = require("./handlerFactory");
const { getConsultantMilestones } = require("./../utils/aggregationHelpers");

/**
 ***********************************
 **/

/**
 * @desc    Get all consultants
 * @route   GET /api/v1/consultants
 * @access  Public
 * @todo    Make it private (Managers, Admin & Super Admins Only)
 */
exports.getAllConsultants = catchAsync(async (req, res, next) => {
  // Apply filtering, sorting, field limiting, and pagination
  const features = new APIFeatures(Consultant.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const consultants = await features.query;

  // Get milestones for each consultant
  const consultantIds = consultants.map((c) => c._id.toString());
  const milestones = await getConsultantMilestones(consultantIds);

  // Attach milestones to corresponding consultants
  const milestonesMap = new Map();
  milestones.forEach((m) => milestonesMap.set(m._id.toString(), m.milestones));

  const results = consultants.map((consultant) => {
    const milestones = milestonesMap.get(consultant._id.toString()) || [];
    return { ...consultant.toObject(), assignedMilestones: milestones };
  });

  res.status(200).json({
    status: "success",
    results: results.length,
    data: {
      consultants: results,
    },
  });
});

/**
 ***********************************
 **/

/**
 * @desc    Get a single consultant
 * @route   GET /api/v1/consultants/:id
 * @access  Public
 * @todo    Make it private (Managers, Admin & Super Admins Only)
 */
exports.getConsultant = catchAsync(async (req, res, next) => {
  // Find consultant by ID
  const consultant = await Consultant.findById(req.params.id);

  if (!consultant) {
    return next(new AppError("No consultant found with that ID", 404));
  }
  // Get milestones for the consultant
  const milestones = await getConsultantMilestones([consultant._id.toString()]);

  const result = {
    ...consultant.toObject(),
    assignedMilestones: milestones[0] ? milestones[0].milestones : [],
  };

  res.status(200).json({
    status: "success",
    data: {
      consultant: result,
    },
  });
});

/**
 ***********************************
 **/

/**
 * @desc    Create a new consultant
 * @route   POST /api/v1/consultants
 * @access  Public
 * @todo    Make it private (Admin & Super Admins Only)
 */
exports.createConsultant = factory.createOne(Consultant);

/**
 ***********************************
 **/

/**
 * @desc    Update an existing consultant
 * @route   PATCH /api/v1/consultants/:id
 * @access  Public
 * @todo    Make it private (Admin & Super Admins Only)
 */
exports.updateConsultant = factory.updateOne(Consultant);

/**
 ***********************************
 **/

/**
 * @desc    Delete a consultant
 * @route   DELETE /api/v1/consultants/:id
 * @access  Public
 * @todo    Make it private (Super Admins Only)
 */
exports.deleteConsultant = factory.deleteOne(Consultant);

/**
 ***********************************
 **/

/**
 * @desc    Getting list of consultants which under line manager (User ID)
 * @route   GET /api/v1/consultants/line-manager/:consultantId
 * @access  Managers
 * @todo
 */
exports.getConsultantsForLineManager = catchAsync(async (req, res, next) => {
  const { consultantId } = req.params; // Get the Line Manager ID from request

  if (!consultantId) {
    return next(new AppError("Consultant ID is required.", 400));
  }

  // Fetch consultants where the logged-in user is the line manager
  const consultants = await Consultant.find({
    lineManager: consultantId,
  }).select("name _id");

  if (!consultants || consultants.length === 0) {
    return res.status(404).json({
      status: "error",
      message: "No consultants found for this Line Manager.",
    });
  }

  res.status(200).json({
    status: "success",
    results: consultants.length,
    data: { consultants },
  });
});
