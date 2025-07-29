/**
 * ============================================================================
 * File: milestoneController.js
 * Description: Controller functions for handling Milestone-related API requests.
 * Author: Buddhika Jayasingha

 * ============================================================================
 */

const Milestone = require("./../models/milestoneModel");
const factory = require("./handlerFactory");

/**
 ***********************************
 **/

/**
 * @desc Get all milestones
 * @route GET /api/v1/milestones
 * @access Public (To be secured later)
 * @todo   Make it private (Managers, Admin & Super Admins Only)
 */
exports.getAllMilestones = factory.getAll(Milestone);

/**
 ***********************************
 **/

/**
 * @desc Get a single milestone
 * @route GET /api/v1/milestones/:id
 * @access Public (To be secured later)
 * @todo   Make it private (Managers, Admin & Super Admins Only)
 */
exports.getMilestone = factory.getOne(Milestone);

// exports.getMilestone = async (req, res) => {
//   try {
//     const milestoneId = req.params.id; // Assuming ID is passed as a URL parameter

//     // Fetch milestone by ID and populate consultant names and IDs
//     const milestone = await Milestone.findById(milestoneId).populate({
//       path: "consultants.consultant",
//       select: "name _id", // Select both name and ID
//     });

//     if (!milestone) {
//       return res
//         .status(404)
//         .json({ status: "fail", message: "Milestone not found" });
//     }

//     // Return the populated milestone data
//     res.status(200).json({
//       status: "success",
//       data: {
//         milestone,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ status: "error", message: err.message });
//   }
// };

/**
 ***********************************
 **/

/**
 * @desc Create a new milestone
 * @route POST /api/v1/milestones
 * @access Public (To be secured later)
 * @todo   Make it private (Admin & Super Admins Only)
 */
exports.createMilestone = factory.createOne(Milestone);

/**
 ***********************************
 **/

/**
 * @desc Update a milestone
 * @route PATCH /api/v1/milestones/:id
 * @access Public (To be secured later)
 * @todo   Make it private (Admin & Super Admins Only)
 */
exports.updateMilestone = factory.updateOne(Milestone);

/**
 ***********************************
 **/

/**
 * @desc Delete a milestone
 * @route DELETE /api/v1/milestones/:id
 * @access Public (To be secured later)
 * @todo   Make it private (Super Admins Only)
 */
exports.deleteMilestone = factory.deleteOne(Milestone);
