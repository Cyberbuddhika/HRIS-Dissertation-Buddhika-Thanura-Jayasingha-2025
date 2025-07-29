/**
 * ============================================================================
 * File: contractualBenefitsController.js
 * Description: Controller functions for handling contractualBenefits-related API requests.
 * Author: Buddhika Jayasingha

 * ============================================================================
 */

const ContractualBenefits = require("./../models/contractualBenefitsModel");
const factory = require("./handlerFactory");

/**
 * @desc Get all consultant Benefits
 * @route GET /api/v1/consultant-benefits
 * @access Public (To be secured later)
 * @todo   Make it private (Admin Only)
 */
exports.getAllContractualBenefits = factory.getAll(ContractualBenefits);

/**
 * @desc Get a single consultant Benefits
 * @route GET /api/v1/consultant-benefits/:id
 * @access Public (To be secured later)
 * @todo   Make it private (Admin Only)
 */
exports.getContractualBenefit = factory.getOne(ContractualBenefits);

/**
 * @desc Create a new consultant Benefits
 * @route POST /api/v1/consultant-benefits
 * @access Public (To be secured later)
 * @todo   Make it private (Admin Only)
 */
exports.createContractualBenefit = factory.createOne(ContractualBenefits);

/**
 * @desc Update a consultant Benefits
 * @route PATCH /api/v1/consultant-benefits/:id
 * @access Public (To be secured later)
 * @todo   Make it private (Admin Only)
 */
exports.updateContractualBenefit = factory.updateOne(ContractualBenefits);

/**
 * @desc Delete a consultant Benefits
 * @route DELETE /api/v1/consultant-benefits/:id
 * @access Public (To be secured later)
 * @todo   Make it private (Admin Only)
 */
exports.deleteContractualBenefit = factory.deleteOne(ContractualBenefits);
