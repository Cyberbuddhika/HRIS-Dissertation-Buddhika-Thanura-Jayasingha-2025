/**
 * ============================================================================
 * File: consultantLeaveModel.js
 * Description: Mongoose model definition for the consultantLeave entity.
 * Author: Buddhika Jayasingha

 * ============================================================================
 */

const mongoose = require("mongoose");

// Leave Schema
const consultantLeaveSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "A leave type must have a name"],
      unique: true,
      // enum: ["Annual Leave", "Medical Leave", "Maternity Leave", "Other"], // ✅ Add predefined types (optional)
    },
    description: {
      type: String,
      default: "", // Optional field to provide more details
    },
    halfdayEligible: {
      type: Boolean,
      default: false,
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

// mongoose.model("ConsultantLeave", consultantLeaveSchema);
const ConsultantLeave = mongoose.model(
  "ConsultantLeave",
  consultantLeaveSchema
);

module.exports = ConsultantLeave; // ✅ Ensure you export the model correctly
