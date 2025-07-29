/**
 * ============================================================================
 * File: contractualBenefitsModel.js
 * Description: Mongoose model definition for the contractualBenefits entity.
 * Author: Buddhika Jayasingha

 * ============================================================================
 */

const mongoose = require("mongoose");

// Contractual Benefits Schema
const contractualBenefitsSchema = new mongoose.Schema(
  {
    benefit: {
      type: String,
      required: [true, "A contractual benefit must have a name"],
      unique: true,
      validate: {
        validator: function (v) {
          return v != null && v.trim().length > 0;
        },
        message: "A contractual benefit cannot be null or empty",
      },
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

// Creating the Contractual Benefits model
const ContractualBenefits = mongoose.model(
  "ContractualBenefits",
  contractualBenefitsSchema
);

module.exports = ContractualBenefits;
