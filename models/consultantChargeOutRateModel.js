/**
 * ============================================================================
 * File: consultantChargeOutRateModel.js
 * Description: Mongoose model definition for the ConsultantChargeOutRate entity.
 * Author: Buddhika Jayasingha

 * ============================================================================
 */

const mongoose = require("mongoose");

// Consultant Charge Out Rate Schema
const consultantChargeOutRateSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, "A fee category must have a name"],
      unique: true,
    },
    rate: {
      type: Number,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Creating the Consultant Charge Out Rate model
const ConsultantChargeOutRate = mongoose.model(
  "ConsultantChargeOutRate",
  consultantChargeOutRateSchema
);

module.exports = ConsultantChargeOutRate;
