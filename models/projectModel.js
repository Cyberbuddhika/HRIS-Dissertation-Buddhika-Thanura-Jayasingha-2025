/**
 * ============================================================================
 * File: projectModel.js
 * Description: Mongoose model definition for the Project entity.
 * Author: Buddhika Jayasingha

 * ============================================================================
 */

const mongoose = require("mongoose");
const Milestone = require("./milestoneModel");

// Project Schema
const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A project must have a name"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "A project must have a description"],
      trim: true,
    },
    // programmeGeography: {
    //   type: String,
    //   required: true,
    //   enum: countries,
    // },
    projectClientName: {
      type: String,
      required: [true, "A project must have a patner name"],
    },
    projectStatus: {
      type: String,
      required: [true, "A project must have a status"],
      enum: ["Active", "Inactive"],
      trim: true,
    },
    projectStartDate: {
      type: Date,
      required: [true, "A project must have a start date"],
    },
    projectDueDate: {
      type: Date,
      required: [true, "A project must have a Due date"],
    },
    contractTotalValue: {
      type: Number,
    },
    contractTotalFees: {
      type: Number,
    },
    contractTotalExpenses: {
      type: Number,
    },
    contractTotalOverhead: {
      type: Number,
    },
    projectLeader: {
      type: mongoose.Schema.ObjectId,
      ref: "Consultant",
      required: false,
    },
    bmgfProjectFinance: {
      type: Boolean,
      required: [true, "User must set the Deliverable-based project status"],
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

/**
 * ADDING INDEXES
 * Adding combined index for multiple fields that are commonly queried together.
 */
projectSchema.index({
  name: 1,
  projectDueDate: -1,
  projectStatus: 1,
});

/**
 * Adding separate indexes for individual fields frequently queried independently.
 */
projectSchema.index({ projectClientName: 1 });
projectSchema.index({ projectStatus: 1 });
projectSchema.index({ programmeGeography: 1 });

/**
 * VIRTUAL PROPERTY
 */

// Virtual field to populate project assigned to milestones
projectSchema.virtual("milestones", {
  ref: "Milestone",
  localField: "_id",
  foreignField: "project",
});

/**
 * MIDDLEWARES
 */

/**
 * Pre-save middleware to calculate contract total value.
 * Automatically calculates contract total value by summing up fee budget,
 * expense budget, and overhead.
 */
projectSchema.pre("save", function (next) {
  const fees = Number(this.contractTotalFees) || 0;
  const expenses = Number(this.contractTotalExpenses) || 0;
  const overhead = Number(this.contractTotalOverhead) || 0;

  this.contractTotalValue = fees + expenses + overhead;
  next();
});

/**
 * Pre-findOneAndUpdate middleware to calculate contract total value.
 * Updates the contract total value if any of the fee budget, expense budget,
 * or overhead are modified.
 */
projectSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  if (
    update.contractTotalFees !== undefined ||
    update.contractTotalExpenses !== undefined ||
    update.contractTotalOverhead !== undefined
  ) {
    const docToUpdate = await this.model.findOne(this.getQuery());

    const updatedFees =
      Number(
        update.contractTotalFees !== undefined
          ? update.contractTotalFees
          : docToUpdate.contractTotalFees
      ) || 0;

    const updatedExpenses =
      Number(
        update.contractTotalExpenses !== undefined
          ? update.contractTotalExpenses
          : docToUpdate.contractTotalExpenses
      ) || 0;

    const updatedOverhead =
      Number(
        update.contractTotalOverhead !== undefined
          ? update.contractTotalOverhead
          : docToUpdate.contractTotalOverhead
      ) || 0;

    this.set({
      contractTotalValue: updatedFees + updatedExpenses + updatedOverhead,
    });
  }
  next();
});

/**
 * Middleware to always populate the project virtual field.
 * Populates the milestones virtual field with selected properties.
 */
// projectSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "milestones",
//     select: "name milestoneDueDate milestoneStatus milestoneTotalValue ",
//   });
//   next();
// });

projectSchema.pre(/^find/, function (next) {
  this.populate({
    path: "milestones",
    select:
      "name milestoneDueDate milestoneStatus milestoneTotalValue consultants bmgfProjectFinance",
  });
  next();
});

/**
 * Middleware to update deliverableBasedProject in all related milestones
 *
 */
projectSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  // Check if deliverableBasedProject is being updated
  if (update.bmgfProjectFinance !== undefined) {
    const projectId = this.getQuery()._id; // Get the project ID being updated

    try {
      // Update all related milestones
      await Milestone.updateMany(
        { project: projectId },
        { bmgfProjectFinance: update.bmgfProjectFinance }
      );
    } catch (error) {
      return next(error);
    }
  }

  next();
});

// Creating the Project model
const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
