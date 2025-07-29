// utils/aggregationHelpers.js
const mongoose = require("mongoose");
const Milestone = require("./../models/milestoneModel");

const getConsultantMilestones = async (consultantIds) => {
  return await Milestone.aggregate([
    { $unwind: "$consultants" },
    {
      $match: {
        "consultants.consultant": {
          $in: consultantIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
        milestoneStatus: "Active",
      },
    },
    {
      $lookup: {
        from: "projects", // Collection name of projects
        localField: "project",
        foreignField: "_id",
        as: "projectDetails",
      },
    },
    { $unwind: "$projectDetails" },
    {
      $group: {
        _id: "$consultants.consultant",
        milestones: {
          $push: {
            name: "$name",
            id: "$_id",
            feeCategory: "$consultants.feeCategory",
            project: "$projectDetails.name", // Assuming 'name' is the field for project name
            milestoneStatus: "$milestoneStatus",
          },
        },
      },
    },
  ]);
};

module.exports = { getConsultantMilestones };
