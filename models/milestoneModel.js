/**
 * ============================================================================
 * File: milestoneModel.js
 * Description: Mongoose model definition for the Milestone entity.
 * Author: Buddhika Jayasingha

 * ============================================================================
 */

const mongoose = require("mongoose");
const ConsultantChargeOutRate = require("./consultantChargeOutRateModel");
const countries = require("./../utils/countries");
const getGeoLocations = require("./../utils/getGeoLocation");

// Milestone Schema
const milestoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A milestone must have a name"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    milestoneLeader: {
      type: mongoose.Schema.ObjectId,
      ref: "Consultant",
      required: false,
    },
    milestoneCountry: {
      type: String,
      required: true,
    },
    milestoneLocation: {
      type: String,
    },
    milestoneLocationLat: { type: Number }, // Location Latitude
    milestoneLocationLng: { type: Number }, // Location Longitude
    mapUrl: { type: String }, // Store the generated map URL
    project: {
      type: mongoose.Schema.ObjectId,
      ref: "Project",
      required: [true, "A milestone must be associated with a project"],
    },
    milestoneStartDate: {
      type: Date,
      required: [true, "A milestone must have a start date"],
    },
    milestoneDueDate: {
      type: Date,
      required: [true, "A milestone must have a due date"],
    },
    milestoneTotalValue: {
      type: Number,
    },
    milestoneTotalFeeBudget: {
      type: Number,
    },
    milestoneTotalExpenseBudget: {
      type: Number,
    },
    milestoneTotalOverhead: {
      type: Number,
    },
    consultants: [
      {
        consultant: {
          type: mongoose.Schema.ObjectId,
          ref: "Consultant",
        },
      },
    ],
    milestoneStatus: {
      type: String,
      required: [true, "A project must have a status"],
      enum: ["Active", "Inactive"],
      trim: true,
    },
    milestoneNote: {
      type: String,
      required: false,
      trim: true,
    },
    bmgfProjectFinance: {
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

/**
 * ADDING INDEXES
 * Adding combined index for multiple fields that are commonly queried together.
 */
milestoneSchema.index({
  name: 1,
  project: 1,
  milestoneCountry: 1,
  milestoneDueDate: -1,
  milestoneStatus: 1,
});

/**
 * Adding separate indexes for individual fields frequently queried independently.
 */
milestoneSchema.index({ milestoneStatus: 1 });
milestoneSchema.index({ project: 1 });

/**
 * MIDDLEWARES
 */

/**
 * 👇 following middleware set to inactive. Because, later they decided to manually enter the Charge Out Rate
 */
// Pre-save middleware to calculate milestone total value.
// In the frontend we load the fee categories from the Charge Out Rate Routes and let user add here.
// Then we can pick the rate here.
milestoneSchema.pre("save", async function (next) {
  const fees = Number(this.milestoneTotalFeeBudget) || 0;
  const expenses = Number(this.milestoneTotalExpenseBudget) || 0;
  const overhead = Number(this.milestoneTotalOverhead) || 0;

  this.milestoneTotalValue = fees + expenses + overhead;
  next();
});

// Pre-Save Middleware to Get Geolocation Data and Generate Map URL
milestoneSchema.pre("save", async function (next) {
  // Default location values
  const countryLocation = this.milestoneCountry
    ? this.milestoneCountry.trim()
    : "United Kingdom";
  // const milestoneLocation = this.milestoneLocation
  //   ? this.milestoneLocation.trim()
  //   : "London";

  // Determine which location to use
  const location = countryLocation;

  if (location) {
    try {
      const { locationLat, locationLng, mapUrl } = await getGeoLocations(
        location,
        process.env.MAPTOKEN,
        process.env.MAPSTYLE,
        process.env.MAPSIZE
      );

      // Assigning values to the document before saving
      this.milestoneLocationLat = locationLat;
      this.milestoneLocationLng = locationLng;
      this.mapUrl = mapUrl;
    } catch (error) {
      console.error("Error fetching geolocation:", error);
      return next(error); // Pass the error to the next middleware
    }
  }
  next();
});

// Pre-findOneAndUpdate Middleware to Get Geolocation Data and Generate Map URL
milestoneSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  const docToUpdate = await this.model.findOne(this.getQuery());

  // Ensure you have the necessary fields to generate the map URL
  const countryLocation =
    update.milestoneCountry !== undefined
      ? update.milestoneCountry.trim()
      : docToUpdate.milestoneCountry || "United Kingdom";

  const milestoneLocation =
    update.milestoneLocation !== undefined
      ? update.milestoneLocation.trim()
      : docToUpdate.milestoneLocation || "London";

  const location = milestoneLocation ? milestoneLocation : countryLocation;

  if (location) {
    try {
      const { locationLat, locationLng, mapUrl } = await getGeoLocations(
        location,
        process.env.MAPTOKEN,
        process.env.MAPSTYLE,
        process.env.MAPSIZE
      );

      // Directly update the document in the database
      this.setUpdate({
        ...update,
        milestoneLocationLat: locationLat,
        milestoneLocationLng: locationLng,
        mapUrl: mapUrl,
      });
    } catch (error) {
      console.error("Error fetching geolocation:", error);
      return next(error); // Pass the error to the next middleware
    }
  }

  next();
});

// Pre find one and update middleware to calculate milestone total value
milestoneSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (
    update.milestoneTotalFeeBudget !== undefined ||
    update.milestoneTotalExpenseBudget !== undefined ||
    update.milestoneTotalOverhead !== undefined
  ) {
    const docToUpdate = await this.model.findOne(this.getQuery());

    const updatedFees =
      Number(
        update.milestoneTotalFeeBudget !== undefined
          ? update.milestoneTotalFeeBudget
          : docToUpdate.milestoneTotalFeeBudget
      ) || 0;

    const updatedExpenses =
      Number(
        update.milestoneTotalExpenseBudget !== undefined
          ? update.milestoneTotalExpenseBudget
          : docToUpdate.milestoneTotalExpenseBudget
      ) || 0;

    const updatedOverhead =
      Number(
        update.milestoneTotalOverhead !== undefined
          ? update.milestoneTotalOverhead
          : docToUpdate.milestoneTotalOverhead
      ) || 0;

    this.set({
      milestoneTotalValue: updatedFees + updatedExpenses + updatedOverhead,
    });
  }

  next();
});

// Creating the milestone model
const Milestone = mongoose.model("Milestone", milestoneSchema);

module.exports = Milestone;
