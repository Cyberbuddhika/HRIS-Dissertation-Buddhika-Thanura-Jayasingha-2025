/**
 * ============================================================================
 * File: consultantModel.js
 * Description: Mongoose model definition for the Consultant entity.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

const mongoose = require("mongoose");
const validator = require("validator");

// Consultant Schema
const consultantSchema = new mongoose.Schema(
  {
    // profilePicture: {
    //   type: String,
    //   required: false,
    //   trim: true,
    // },
    name: {
      type: String,
      required: [true, "A consultant must have a name"],
      trim: true,
      unique: true,
    },
    contractNumber: {
      type: String,
      required: [true, "A consultant must have a contract number"],
      trim: true,
      unique: true,
    },
    contractUrl: {
      type: String,
      required: false,
      validate: [
        validator.isURL,
        "Please provide a valid URL for the contract file",
      ],
      trim: true,
    },
    consultantCategory: {
      type: String,
      required: [true, "A consultant must have a category"],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, "A consultant must have a designation"],
      trim: true,
    },

    contractStartDate: {
      type: Date,
      required: [true, "A consultant must have a contract start date"],
    },
    contractEndDate: {
      type: Date,
      required: [true, "A consultant must have a contract end date"],
    },
    consultantStatus: {
      type: String,
      required: [true, "A consultant must have a status"],
      enum: ["Active", "Inactive"],
      trim: true,
    },
    lineManager: {
      type: mongoose.Schema.ObjectId,
      ref: "Consultant", // Reference to the Consultant model
      required: true,
    },
    salaryRate: {
      type: String,
      required: [true, "A consultant must have a salary rate"],
      enum: ["Monthly", "Daily", "Hourly", "Annually"],
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, "A consultant must have a salary"],
      min: [0, "Salary cannot be negative"],
    },
    noOfWorkingDaysPerMonth: {
      type: Number,
      required: [false],
      min: [0, "Number of working days per month cannot be negative"],
      max: [31, "Number of working days per month cannot exceed 31"],
    },
    noOfWorkingHoursPerMonth: {
      type: Number,
      required: function () {
        return this.salaryRate === "Hourly";
      },
      min: [0, "Number of working hours per month cannot be negative"],
    },
    contractualBenefits: {
      type: [String],
      required: false,
    },
    ir35Compliance: {
      compliance: {
        type: Boolean,
        required: false,
        default: false,
      },
      description: {
        type: String,
        trim: true,
      },
    },
    address: {
      type: String,
      required: [true, "A consultant must have an address"],
      trim: true,
    },
    contactNumber: {
      type: String,
      required: [true, "A consultant must have a contact number"],
      trim: true,
    },
    emergencyContactNumber: {
      type: String,
      required: false,
      trim: true,
    },
    basedCountry: {
      type: String,
      required: [true, "A consultant must have a based country"],
    },
    nationality: {
      type: String,
      required: [true, "A consultant must have a nationality"],
      trim: true,
    },
    perHourSalary: {
      type: Number,
    },
    companyEmailAddress: {
      type: String,
      required: [true, "A consultant must have a company email address"],
      validate: [validator.isEmail, "Please provide a valid email address"],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    // communicationPayCategory: {
    //   type: Boolean,
    //   required: [true, "User must provide this status"],
    //   default: false,
    // },
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
consultantSchema.index({
  name: 1,
  contractNumber: 1,
  consultantCategory: 1,
  contractEndDate: -1,
  consultantStatus: 1,
});

/**
 * Adding separate indexes for individual fields frequently queried independently.
 */
consultantSchema.index({ consultantCategory: 1 });
consultantSchema.index({ contractEndDate: -1 });
consultantSchema.index({ consultantStatus: 1 });

/**
 * VIRTUAL PROPERTY
 */

//Virtual field to populate projects names where the consultant is a project supervisor
consultantSchema.virtual("projectsLed", {
  ref: "Project",
  localField: "_id",
  foreignField: "projectLeader",
  options: { select: "name" },
});

/**
 * MIDDLEWARES
 */

/**
 * Pre-save middleware to calculate per hour salary and "noOfWorkingHoursPerMonth".
 * We allow user to enter "noOfWorkingHoursPerMonth" if the salary rate is equal to "hourly".
 * Otherwise we calculate it automatically.
 */

consultantSchema.pre("save", function (next) {
  if (this.salaryRate === "Hourly") {
    this.perHourSalary = this.salary;
  } else {
    this.noOfWorkingHoursPerMonth = this.noOfWorkingDaysPerMonth * 8;
    this.perHourSalary = this.salary / this.noOfWorkingHoursPerMonth;
  }

  next();
});

//Middleware to always populate the projectsLed virtual field
consultantSchema.pre(/^find/, function (next) {
  this.populate({
    path: "projectsLed",
    select: "name _milestones",
  });
  next();
});

// Pre-save hook to convert Contract Number to uppercase before saving
consultantSchema.pre("save", function (next) {
  if (this.contractNumber) {
    this.contractNumber = this.contractNumber.toUpperCase();
  }
  next();
});

// Pre-findOneAndUpdate hook to convert Contract Number to uppercase before updating
consultantSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  // If contractNumber is being updated, convert it to uppercase
  if (update.contractNumber) {
    update.contractNumber = update.contractNumber.toUpperCase();
  }

  next();
});

// Creating the Consultant model
const Consultant = mongoose.model("Consultant", consultantSchema);

module.exports = Consultant;
