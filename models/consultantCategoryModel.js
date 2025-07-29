/**
 * ============================================================================
 * File: consultantCategoryModel.js
 * Description: Mongoose model definition for the consultantCategory entity.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

const mongoose = require("mongoose");

// Consultant Category Schema
const consultantCategorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, "A consultant category must have a name"],
      unique: true,
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
const ConsultantCategory = mongoose.model(
  "ConsultantCategory",
  consultantCategorySchema
);

module.exports = ConsultantCategory;
