/**
 * ============================================================================
 * File: consultantCategoryController.js
 * Description: Controller functions for handling consultantCategory-related API requests.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

const ConsultantCategory = require("./../models/consultantCategoryModel");
const factory = require("./handlerFactory");

/**
 * @desc Get all consultant categories
 * @route GET /api/v1/consultant-category
 * @access Public (To be secured later)
 * @todo   Make it private (Admin Only)
 */
exports.getAllConsultantCategories = factory.getAll(ConsultantCategory);

/**
 * @desc Get a single consultant category
 * @route GET /api/v1/consultant-category/:id
 * @access Public (To be secured later)
 * @todo   Make it private (Admin Only)
 */
exports.getConsultantCategory = factory.getOne(ConsultantCategory);

/**
 * @desc Create a new consultant category
 * @route POST /api/v1/consultant-category
 * @access Public (To be secured later)
 * @todo   Make it private (Admin Only)
 */
exports.createConsultantCategory = factory.createOne(ConsultantCategory);

/**
 * @desc Update a consultant category
 * @route PATCH /api/v1/consultant-category/:id
 * @access Public (To be secured later)
 * @todo   Make it private (Admin Only)
 */
exports.updateConsultantCategory = factory.updateOne(ConsultantCategory);

/**
 * @desc Delete a consultant category
 * @route DELETE /api/v1/consultant-category/:id
 * @access Public (To be secured later)
 * @todo   Make it private (Admin Only)
 */
exports.deleteConsultantCategory = factory.deleteOne(ConsultantCategory);
