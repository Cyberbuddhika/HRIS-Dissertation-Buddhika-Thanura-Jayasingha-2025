/**
 * ============================================================================
 * File: consultantLeaveController.js
 * Description: Controller functions for handling consultantLeave-related API requests.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

const ConsultantLeave = require("./../models/consultantLeaveModel");
const factory = require("./handlerFactory");

/**
 * @desc Get all consultant categories
 * @route GET /api/v1/consultant-category
 * @access Public (To be secured later)
 * @todo   Make it private (Admin Only)
 */
exports.getAllConsultantLeaveCategories = factory.getAll(ConsultantLeave);
// exports.getAllConsultantLeaveCategories = async (req, res, next) => {
//   try {
//     const consultantLeaves = await ConsultantLeave.find(); // ✅ Fetch from correct model
//     res.status(200).json({
//       status: "success",
//       results: consultantLeaves.length,
//       data: consultantLeaves, // ✅ Directly return array
//     });
//   } catch (err) {
//     console.error("Error fetching data:", err);
//     res.status(500).json({
//       status: "error",
//       message: "Failed to fetch consultant leave categories",
//     });
//   }
// };

/**
 * @desc Get a single consultant category
 * @route GET /api/v1/consultant-category/:id
 * @access Public (To be secured later)
 * @todo   Make it private (Admin Only)
 */
exports.getConsultantLeaveCategories = factory.getOne(ConsultantLeave);

/**
 * @desc Create a new consultant category
 * @route POST /api/v1/consultant-category
 * @access Public (To be secured later)
 * @todo   Make it private (Admin Only)
 */
exports.createConsultantLeaveCategories = factory.createOne(ConsultantLeave);

/**
 * @desc Update a consultant category
 * @route PATCH /api/v1/consultant-category/:id
 * @access Public (To be secured later)
 * @todo   Make it private (Admin Only)
 */
exports.updateConsultantLeaveCategories = factory.updateOne(ConsultantLeave);

/**
 * @desc Delete a consultant category
 * @route DELETE /api/v1/consultant-category/:id
 * @access Public (To be secured later)
 * @todo   Make it private (Admin Only)
 */
exports.deleteConsultantLeaveCategories = factory.deleteOne(ConsultantLeave);
