/**
 * ============================================================================
 * File: projectController.js
 * Description: Controller functions for handling Project-related API requests.
 * Author: Buddhika Jayasingha

 * ============================================================================
 */

const Project = require("./../models/projectModel");
const factory = require("./handlerFactory");

/**
 ***********************************
 **/

/**
 * @desc Get all projects
 * @route GET /api/v1/projects
 * @access Public (To be secured later)
 * @todo   Make it private (Managers, Admin & Super Admins Only)
 */
exports.getAllProjects = factory.getAll(Project);

/**
 ***********************************
 **/

/**
 * @desc Get a single project
 * @route GET /api/v1/projects/:id
 * @access Public (To be secured later)
 * @todo   Make it private (Leader, Managers, Admin & Super Admins Only)
 */
exports.getProject = factory.getOne(Project);

/**
 ***********************************
 **/

/**
 * @desc Create a new project
 * @route POST /api/v1/projects
 * @access Public (To be secured later)
 * @todo   Make it private (Admin & Super Admins Only)
 */
exports.createProject = factory.createOne(Project);

/**
 ***********************************
 **/

/**
 * @desc Update a project
 * @route PATCH /api/v1/projects/:id
 * @access Public (To be secured later)
 * @todo   Make it private (Admin & Super Admins Only)
 */
exports.updateProject = factory.updateOne(Project);

/**
 ***********************************
 **/

/**
 * @desc Delete a project
 * @route DELETE /api/v1/projects/:id
 * @access Public (To be secured later)
 * @todo   Make it private (Super Admins Only)
 */
exports.deleteProject = factory.deleteOne(Project);
