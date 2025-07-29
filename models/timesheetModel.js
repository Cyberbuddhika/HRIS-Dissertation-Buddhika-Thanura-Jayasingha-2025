/**
 * ============================================================================
 * File: timesheetModel.js
 * Description: Mongoose model definition for the Timesheet entity.
 * Author: Buddhika Jayasingha

 * ============================================================================
 */

const mongoose = require("mongoose");
const Consultant = require("./consultantModel");

// Timesheet Schema
const timesheetSchema = new mongoose.Schema({
  consultantId: {
    type: mongoose.Schema.ObjectId,
    ref: "Consultant", // Links to Consultant model
    required: true,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User", // Links to User model
    required: false,
  },
  year: { type: Number, required: true }, // Year (e.g., 2024)
  month: { type: Number, required: true }, // Month (0=Jan, 11=Dec)
  day: { type: Number, required: true }, // Day of the month (1–31)
  milestones: [
    {
      milestone_id: { type: mongoose.Schema.ObjectId, ref: "Milestone" },
      hours: { type: Number }, // Hours worked
      color: { type: String }, // Milestone color (for UI display)
      status: {
        type: String,
        // required: true,
        enum: ["worked"],
        default: "worked",
      },
    },
  ],
  // totalWorkedHours: { type: Number, required: true }, // Sum of hours for the day
  weekend: { type: Boolean, default: false }, // Is this day a weekend
  // New fields
  lineManagerApproval: {
    type: Boolean,
    default: false, // Initially false, updated by line manager
    required: true,
  },
  leaves: [
    {
      leave: {
        type: mongoose.Schema.ObjectId,
        ref: "ConsultantLeave", // Links to the Leave model
        required: false, // Only required when leave is used }, // Annual Leave, Medical Leave
      },
      period: {
        type: String,
        enum: ["Full Day", "Half Day"],
      },
    },
  ],

  processed: {
    type: Boolean,
    default: false, // Indicates if the timesheet is locked
    required: true,
  },
  status: {
    type: String,
    enum: ["Draft", "Submitted", "Approved", "Processed"],
    default: "Draft",
  },
});

/**
 * ADDING INDEXES
 * Adding combined index for multiple fields that are commonly queried together.
 */

timesheetSchema.index({ consultantId: 1, year: 1, month: 1 });

// Export the model
module.exports = mongoose.model("Timesheet", timesheetSchema);
