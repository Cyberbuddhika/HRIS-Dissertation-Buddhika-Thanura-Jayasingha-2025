/**
 * ============================================================================
 * File: consultantChargeOutRateController.js
 * Description: Controller functions for handling ConsultantChargeOutRate-related API requests.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

const ConsultantChargeOutRate = require("./../models/consultantChargeOutRateModel");
const factory = require("./handlerFactory");

/**
 * @desc Get all consultant charge out rates
 * @route GET /api/v1/consultant-charge-out-rates
 * @access Public (To be secured later)
 * @todo   Make it private (Admin Only)
 */
exports.getAllConsultantChargeOutRates = factory.getAll(
  ConsultantChargeOutRate
);

/**
 * @desc Get a single consultant charge out rate
 * @route GET /api/v1/consultant-charge-out-rates/:id
 * @access Public (To be secured later)
 * @todo   Make it private (Admin Only)
 */
exports.getConsultantChargeOutRate = factory.getOne(ConsultantChargeOutRate);

/**
 * @desc Create a new consultant charge out rate
 * @route POST /api/v1/consultant-charge-out-rates
 * @access Public (To be secured later)
 * @todo   Make it private (Admin Only)
 */
exports.createConsultantChargeOutRate = factory.createOne(
  ConsultantChargeOutRate
);

/**
 * @desc Update a consultant charge out rate
 * @route PATCH /api/v1/consultant-charge-out-rates/:id
 * @access Public (To be secured later)
 * @todo   Make it private (Admin Only)
 */
exports.updateConsultantChargeOutRate = factory.updateOne(
  ConsultantChargeOutRate
);

/**
 * @desc Delete a consultant charge out rate
 * @route DELETE /api/v1/consultant-charge-out-rates/:id
 * @access Public (To be secured later)
 * @todo   Make it private (Admin Only)
 */
exports.deleteConsultantChargeOutRate = factory.deleteOne(
  ConsultantChargeOutRate
);
