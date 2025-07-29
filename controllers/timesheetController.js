/**
 * ============================================================================
 * File: timesheetController.js
 * Description: Controller functions for handling timesheet API requests.
 * Author: Buddhika Jayasingha

 * ============================================================================
 */

const User = require("./../models/userModel");
const Consultant = require("./../models/consultantModel");
const Timesheet = require("./../models/timesheetModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

// ===============================
// 1. Get Timesheet Entries (Filter by Consultant, Year, Month)
// ===============================
// exports.getTimesheetEntries = catchAsync(async (req, res, next) => {
//   const { consultantId, year, month } = req.params;

//   if (!consultantId || !year || !month) {
//     return next(
//       new AppError("Please provide consultantId, year, and month.", 400),
//     );
//   }

//   const timesheetEntries = await Timesheet.find({
//     consultantId,
//     year,
//     month,
//   });

//   if (!timesheetEntries) {
//     return next(new AppError("No timesheet entries found.", 404));
//   }

//   res.status(200).json({
//     status: "success",
//     results: timesheetEntries.length,
//     data: {
//       timesheetEntries,
//     },
//   });
// });

// exports.getTimesheetEntries = async (req, res) => {
//   try {
//     const { consultantId, year, month } = req.params;

//     const timesheetEntries = await Timesheet.find({
//       consultantId,
//       year,
//       month,
//     });

//     // Aggregate total hours for each day
//     const aggregatedEntries = timesheetEntries.reduce((acc, entry) => {
//       // Find or create a day entry
//       const existingDay = acc.find((day) => day.day === entry.day);

//       if (existingDay) {
//         // Merge milestones and sum hours for existing day
//         entry.milestones.forEach((milestone) => {
//           const existingMilestone = existingDay.milestones.find(
//             (m) =>
//               m.milestone_id.toString() === milestone.milestone_id.toString(),
//           );

//           if (existingMilestone) {
//             // Add hours to the existing milestone
//             existingMilestone.hours += milestone.hours;
//           } else {
//             // Add new milestone
//             existingDay.milestones.push(milestone);
//           }
//         });

//         // Update total worked hours for the day by summing all milestone hours
//         existingDay.totalWorkedHours = existingDay.milestones.reduce(
//           (sum, milestone) => sum + milestone.hours,
//           0,
//         );
//       } else {
//         // Create a new day entry and calculate total worked hours
//         acc.push({
//           _id: entry._id, // Ensure original timesheet entry ID is preserved
//           day: entry.day,
//           milestones: [...entry.milestones],
//           totalWorkedHours: entry.milestones.reduce(
//             (sum, milestone) => sum + milestone.hours,
//             0,
//           ),
//           weekend: entry.weekend,
//         });
//       }

//       return acc;
//     }, []);

//     res.status(200).json({
//       status: "success",
//       results: aggregatedEntries.length,
//       data: { timesheetEntries: aggregatedEntries },
//     });
//   } catch (err) {
//     console.error("Error fetching timesheet entries:", err);
//     res.status(500).json({
//       status: "error",
//       message: "Failed to fetch timesheet entries.",
//     });
//   }
// };

exports.getTimesheetEntries = async (req, res) => {
  try {
    const { consultantId, year, month } = req.params;

    // Fetch timesheet data & populate milestone names
    const timesheetEntries = await Timesheet.find({
      consultantId,
      year,
      month,
    })
      .populate({
        path: "milestones.milestone_id",
        select: "name", // Only fetch the milestone name
      })
      .populate({
        path: "leaves.leave",
        model: "ConsultantLeave",
        select: "type", // Fetch leave type names
        options: { strictPopulate: false },
      });

    // Aggregate total hours for each day
    const aggregatedEntries = timesheetEntries.reduce((acc, entry) => {
      // Find or create a day entry
      const existingDay = acc.find((day) => day.day === entry.day);

      if (existingDay) {
        // Merge milestones and sum hours for existing day
        entry.milestones.forEach((milestone) => {
          const existingMilestone = existingDay.milestones.find(
            (m) =>
              m.milestone_id?._id.toString() ===
              milestone.milestone_id?._id.toString()
          );

          if (existingMilestone) {
            // Add hours to the existing milestone
            existingMilestone.hours += milestone.hours;
          } else {
            // Add new milestone with populated name
            existingDay.milestones.push({
              milestone_id: milestone.milestone_id?._id,
              name: milestone.milestone_id?.name || "Unknown Milestone",
              hours: milestone.hours,
              status: milestone.status,
            });
          }
        });

        // Attach leave if applicable
        existingDay.leaves =
          entry.leaves?.map((leave) => ({
            _id: leave.leave?._id,
            type: leave.leave?.type || "Unknown Leave",
            period: leave.period, // Full Day / Half Day
          })) || [];

        // Compute total leave days per type (Backend Calculation)
        existingDay.leaveSummary = existingDay.leaves.reduce(
          (summary, leave) => {
            const leaveType = leave.type;
            const leaveValue = leave.period === "Full Day" ? 1 : 0.5; // Full Day = 1, Half Day = 0.5
            summary[leaveType] = (summary[leaveType] || 0) + leaveValue;
            return summary;
          },
          {}
        );

        // Update total worked hours for the day
        existingDay.totalWorkedHours = existingDay.milestones.reduce(
          (sum, milestone) => sum + milestone.hours,
          0
        );
      } else {
        // Create a new day entry and calculate total worked hours
        acc.push({
          _id: entry._id,
          day: entry.day,
          milestones: entry.milestones.map((milestone) => ({
            milestone_id: milestone.milestone_id?._id,
            name: milestone.milestone_id?.name || "Unknown Milestone",
            hours: milestone.hours,
            status: milestone.status,
          })),
          leaves:
            entry.leaves?.map((leave) => ({
              _id: leave.leave?._id,
              type: leave.leave?.type || "Unknown Leave",
              period: leave.period, // Full Day / Half Day
            })) || [],
          leaveSummary:
            entry.leaves?.reduce((summary, leave) => {
              const leaveType = leave.leave?.type || "Unknown Leave";
              const leaveValue = leave.period === "Full Day" ? 1 : 0.5;
              summary[leaveType] = (summary[leaveType] || 0) + leaveValue;
              return summary;
            }, {}) || {},
          totalWorkedHours: entry.milestones.reduce(
            (sum, milestone) => sum + milestone.hours,
            0
          ),
          weekend: entry.weekend,
          status: entry.status,
        });
      }

      return acc;
    }, []);

    res.status(200).json({
      status: "success",
      results: aggregatedEntries.length,
      data: { timesheetEntries: aggregatedEntries },
    });
  } catch (err) {
    console.error("Error fetching timesheet entries:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch timesheet entries.",
    });
  }
};

// ===============================
// 2. Add New Timesheet Entry
// ===============================
exports.addTimesheetEntry = catchAsync(async (req, res, next) => {
  const {
    consultantId,
    userId,
    year,
    month,
    day,
    milestones,
    weekend,
    status,
    leaves,
  } = req.body;

  // Check required fields
  if (!consultantId || !year || !month || !day || !milestones) {
    return next(new AppError("Missing required fields.", 400));
  }

  // Prevent users from setting status manually
  if (status && status !== "Draft") {
    return next(new AppError("You cannot manually set status.", 403));
  }

  // Check if any existing entry for the same day has a status other than "Draft"
  const nonDraftTimesheet = await Timesheet.findOne({
    consultantId,
    year,
    month,
    day,
    status: { $ne: "Draft" }, // Block if any non-draft entry exists
  });

  if (nonDraftTimesheet) {
    return next(
      new AppError(
        "This timesheet entry has already been submitted and cannot be modified.",
        403
      )
    );
  }

  // Find existing timesheet entry for the consultant and the specific day
  const existingTimesheet = await Timesheet.findOne({
    consultantId,
    year,
    month,
    day,
  });

  if (existingTimesheet) {
    // Handle Leave Updates
    if (leaves && leaves.length > 0) {
      existingTimesheet.leaves = leaves; //  Assign new leave array
    }
    // Append new milestone(s) to the existing entry
    existingTimesheet.milestones.push(...milestones);

    // Update totalWorkedHours
    const newWorkedHours = milestones.reduce(
      (total, milestone) => total + milestone.hours,
      0
    );
    existingTimesheet.totalWorkedHours =
      (existingTimesheet.totalWorkedHours || 0) + newWorkedHours;

    // Save the updated entry
    await existingTimesheet.save();

    return res.status(200).json({
      status: "success",
      data: {
        timesheet: existingTimesheet,
      },
    });
  }

  // If no existing timesheet, create a new one
  const totalWorkedHours = milestones.reduce(
    (total, milestone) => total + milestone.hours,
    0
  );
  const newTimesheetEntry = await Timesheet.create({
    consultantId,
    userId,
    year,
    month,
    day,
    milestones,
    totalWorkedHours,
    weekend,
    status,
    leaves: leaves || [],
    status: "Draft",
  });

  res.status(201).json({
    status: "success",
    data: {
      timesheet: newTimesheetEntry,
    },
  });
});

// ===============================
// 3. Update Timesheet Entry
// ===============================
exports.updateTimesheetMilestone = catchAsync(async (req, res, next) => {
  const { id, milestoneEntryId } = req.params; // Timesheet entry ID and milestone ID
  const updates = req.body; // New data for the milestone (e.g., { hours: 6 })

  // Update the specific milestone within the timesheet entry
  const updatedTimesheet = await Timesheet.findOneAndUpdate(
    { _id: id, "milestones._id": milestoneEntryId }, // Match the timesheet and the milestone
    {
      $set: {
        "milestones.$.hours": updates.hours, // Update hours
        "milestones.$.status": updates.status, // Update status (if provided)
      },
    },
    {
      new: true, // Return the updated document
      runValidators: true, // Ensure the updated data is validated
    }
  );

  if (!updatedTimesheet) {
    return next(new AppError("No milestone found with that ID.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      timesheet: updatedTimesheet,
    },
  });
});

// ===============================
// 4. Delete Timesheet Milestone Entry
// ===============================
exports.deleteTimesheetMilestone = catchAsync(async (req, res, next) => {
  const { id, milestoneEntryId } = req.params; // Timesheet entry ID and milestone ID

  // Find the timesheet entry
  const existingTimesheet = await Timesheet.findById(id);

  if (!existingTimesheet) {
    return next(new AppError("No timesheet entry found with that ID.", 404));
  }

  // Prevent deletion if not Draft
  if (existingTimesheet.status !== "Draft") {
    return next(
      new AppError("You can only delete milestones from Draft timesheets.", 403)
    );
  }

  // Use MongoDB's $pull operator to remove the milestone
  const updatedTimesheet = await Timesheet.findByIdAndUpdate(
    id, // Match the timesheet by ID
    {
      $pull: { milestones: { _id: milestoneEntryId } }, // Remove the milestone by its _id
    },
    {
      new: true, // Return the updated document
    }
  );

  if (!updatedTimesheet) {
    return next(
      new AppError("No timesheet or milestone found with that ID.", 404)
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      timesheet: updatedTimesheet,
    },
  });
});

// ===============================
// 4. Delete Timesheet Entry
// ===============================
exports.deleteTimesheetEntry = catchAsync(async (req, res, next) => {
  const { id, leaveEntryId } = req.params; // Timesheet entry ID and milestone ID

  // Ensure the timesheet exists before attempting to update

  const existingTimesheet = await Timesheet.findById(id);
  if (!existingTimesheet) {
    return next(new AppError("No timesheet entry found with that ID.", 404));
  }

  // Prevent deletion if not Draft
  if (existingTimesheet.status !== "Draft") {
    return next(
      new AppError("You can only delete milestones from Draft timesheets.", 403)
    );
  }

  // Ensure the leave entry exists inside the timesheet
  const leaveExists = existingTimesheet.leaves.some(
    (leave) => leave._id.toString() === leaveEntryId
  );
  if (!leaveExists) {
    return next(new AppError("No leave entry found with that ID.", 404));
  }

  // Use MongoDB's `$pull` operator to remove the leave entry
  const updatedTimesheet = await Timesheet.findByIdAndUpdate(
    id,
    { $pull: { leaves: { _id: leaveEntryId } } }, // Remove the specific leave
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Timesheet entry deleted successfully.",
  });
});

// ===============================
// 5. Lock/Unlock Timesheet
// ===============================
exports.lockUnlockTimesheet = catchAsync(async (req, res, next) => {
  const { consultantId, year, month } = req.params;
  const { action } = req.body; // action = 'lock' or 'unlock'

  if (!consultantId || !year || !month || !action) {
    return next(
      new AppError("Please provide consultantId, year, month, and action.", 400)
    );
  }

  const processed = action === "lock";

  const updatedTimesheets = await Timesheet.updateMany(
    { consultantId, year, month },
    { processed },
    { new: true }
  );

  if (updatedTimesheets.matchedCount === 0) {
    return next(new AppError("No timesheets found to lock/unlock.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      processed: processed,
      updatedCount: updatedTimesheets.modifiedCount,
    },
  });
});

// ===============================
// 6. Get Timesheet Entries (Filter by Consultant, Year, Month and day)
// ===============================

exports.getTimesheetEntriesByDay = async (req, res) => {
  try {
    const { consultantId, year, month, day } = req.params;

    // Validate input
    if (!consultantId || !year || !month || !day) {
      return res.status(400).json({
        status: "fail",
        message: "Missing required parameters.",
      });
    }

    const timesheetEntries = await Timesheet.find({
      consultantId,
      year,
      month,
      day, // Only fetch data for the requested day
    }).populate({
      path: "milestones.milestone_id",
      select: "name", // Only fetch the milestone name
    });

    res.status(200).json({
      status: "success",
      results: timesheetEntries.length,
      data: { timesheetEntries },
    });
  } catch (err) {
    console.error("Error fetching timesheet entries:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch timesheet entries.",
    });
  }
};

// =======================================================================
// 7. Submit timesheet entries (Status changed from "Draft" → "Submitted")
// =======================================================================

exports.submitTimesheetEntries = catchAsync(async (req, res, next) => {
  let { consultantId, year, month } = req.params;

  // Convert year and month to numbers safely
  year = parseInt(year, 10);
  month = parseInt(month, 10);

  // Ensure consultantId is valid
  if (!consultantId || isNaN(year) || isNaN(month)) {
    return next(new AppError("Invalid consultantId, year, or month.", 400));
  }

  // Update all Draft timesheets to Submitted
  const updated = await Timesheet.updateMany(
    {
      $expr: { $eq: [{ $toString: "$consultantId" }, consultantId] }, // Ensure consultantId matches
      year,
      month,
      status: "Draft", // Only update Draft entries
    },
    { $set: { status: "Submitted" } }
  );

  res.status(200).json({
    status: "success",
    message: `Successfully submitted ${updated.modifiedCount} timesheet entries.`,
  });
});

// =======================================================================
// 8. Updating all timesheet entries Status to "Draft"
// =======================================================================

exports.updateExistingTimesheetsToDraft = catchAsync(async (req, res, next) => {
  try {
    const result = await Timesheet.updateMany(
      { status: { $exists: false } }, // Only update entries missing status
      { $set: { status: "Draft" } }
    );

    if (result.modifiedCount === 0) {
      return res.status(200).json({
        status: "success",
        message: "No timesheet entries needed updating.",
      });
    }

    res.status(200).json({
      status: "success",
      message: `Successfully updated ${result.modifiedCount} timesheet entries to Draft`,
    });
  } catch (error) {
    console.error("Error updating timesheet entries:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update timesheet entries.",
    });
  }
});

// =======================================================================
// 9. Revert timesheet entries (Status changed from "Submitted" → "Draft")
// =======================================================================

exports.revertTimesheetEntries = catchAsync(async (req, res, next) => {
  let { consultantId, year, month } = req.params;

  // Convert year and month to numbers safely
  year = parseInt(year, 10);
  month = parseInt(month, 10);

  // Ensure consultantId is valid
  if (!consultantId || isNaN(year) || isNaN(month)) {
    return next(new AppError("Invalid consultantId, year, or month.", 400));
  }

  // Update all Draft timesheets to Submitted
  const updated = await Timesheet.updateMany(
    {
      $expr: { $eq: [{ $toString: "$consultantId" }, consultantId] }, // Ensure consultantId matches
      year,
      month,
      status: "Submitted", // Only update Draft entries
    },
    { $set: { status: "Draft" } }
  );

  res.status(200).json({
    status: "success",
    message: `Successfully reverted ${updated.modifiedCount} timesheet entries.`,
  });
});

// =======================================================================
// 10. Approve timesheet entries (Status changed from "Submitted" → "Approved")
// =======================================================================

exports.approveTimesheetEntries = catchAsync(async (req, res, next) => {
  let { consultantId, year, month } = req.params;

  // Convert year and month to numbers safely
  year = parseInt(year, 10);
  month = parseInt(month, 10);

  // Ensure consultantId is valid
  if (!consultantId || isNaN(year) || isNaN(month)) {
    return next(new AppError("Invalid consultantId, year, or month.", 400));
  }

  // Update all Draft timesheets to Submitted
  const updated = await Timesheet.updateMany(
    {
      $expr: { $eq: [{ $toString: "$consultantId" }, consultantId] }, // Ensure consultantId matches
      year,
      month,
      status: "Submitted", // Only update Draft entries
    },
    { $set: { status: "Approved" } }
  );

  res.status(200).json({
    status: "success",
    message: `Successfully approved ${updated.modifiedCount} timesheet entries.`,
  });
});

// =======================================================================
// 11. Get all timesheet entries
// =======================================================================
exports.getAllConsultantsTimesheets = async (req, res) => {
  try {
    const { year, month } = req.params;

    // Fetch all timesheet data for the given month and year
    const timesheetEntries = await Timesheet.find({
      year,
      month,
      // status: "Approved",
      status: { $in: ["Approved", "Processed"] }, // This is added to make sure that in summary both processed and approved entires will show. If other places not showing only approved timesheet it could be this one. so revert back to the top version.
    })
      .populate({
        path: "milestones.milestone_id",
        select: "name", // Only fetch milestone name
      })
      .populate({
        path: "leaves.leave",
        model: "ConsultantLeave",
        select: "type", // Fetch leave type names
        options: { strictPopulate: false },
      })
      .populate({
        path: "consultantId",
        select: "name", // Fetch consultant's name
      });

    // Grouping timesheet entries by consultant
    const groupedByConsultant = timesheetEntries.reduce((acc, entry) => {
      const consultantId = entry.consultantId?._id.toString();

      if (!acc[consultantId]) {
        acc[consultantId] = {
          consultantId,
          consultantName: entry.consultantId?.name || "Unknown Consultant",
          timesheets: [],
        };
      }

      acc[consultantId].timesheets.push({
        _id: entry._id,
        day: entry.day,
        milestones: entry.milestones.map((milestone) => ({
          milestone_id: milestone.milestone_id?._id,
          name: milestone.milestone_id?.name || "Unknown Milestone",
          hours: milestone.hours,
          status: milestone.status,
        })),
        leaves:
          entry.leaves?.map((leave) => ({
            _id: leave.leave?._id,
            type: leave.leave?.type || "Unknown Leave",
            period: leave.period,
          })) || [],
        leaveSummary:
          entry.leaves?.reduce((summary, leave) => {
            const leaveType = leave.leave?.type || "Unknown Leave";
            const leaveValue = leave.period === "Full Day" ? 1 : 0.5;
            summary[leaveType] = (summary[leaveType] || 0) + leaveValue;
            return summary;
          }, {}) || {},
        totalWorkedHours: entry.milestones.reduce(
          (sum, milestone) => sum + milestone.hours,
          0
        ),
        weekend: entry.weekend,
        status: entry.status,
      });

      return acc;
    }, {});

    // Convert grouped object to an array
    const aggregatedEntries = Object.values(groupedByConsultant);

    res.status(200).json({
      status: "success",
      results: aggregatedEntries.length,
      data: { consultantsTimesheets: aggregatedEntries },
    });
  } catch (err) {
    console.error("Error fetching consultants' timesheet entries:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch consultants' timesheet entries.",
    });
  }
};

// =======================================================================
// 12. Process timesheet entries (Status changed from "Approved" → "Processed")
// =======================================================================

exports.processTimesheetEntries = catchAsync(async (req, res, next) => {
  let { consultantId, year, month } = req.params;

  // Convert year and month to numbers safely
  year = parseInt(year, 10);
  month = parseInt(month, 10);

  // Ensure consultantId is valid
  if (!consultantId || isNaN(year) || isNaN(month)) {
    return next(new AppError("Invalid consultantId, year, or month.", 400));
  }

  // Update all Draft timesheets to Submitted
  const updated = await Timesheet.updateMany(
    {
      $expr: { $eq: [{ $toString: "$consultantId" }, consultantId] }, // Ensure consultantId matches
      year,
      month,
      status: "Approved", // Only update Draft entries
    },
    { $set: { status: "Processed" } }
  );

  res.status(200).json({
    status: "success",
    message: `Successfully processed ${updated.modifiedCount} timesheet entries.`,
  });
});

// =======================================================================
// 13. Revert timesheet entries (Status changed from "Approved" → "Submitted")
// =======================================================================

exports.revertApprovedTimesheetEntries = catchAsync(async (req, res, next) => {
  let { consultantId, year, month } = req.params;

  // Convert year and month to numbers safely
  year = parseInt(year, 10);
  month = parseInt(month, 10);

  // Ensure consultantId is valid
  if (!consultantId || isNaN(year) || isNaN(month)) {
    return next(new AppError("Invalid consultantId, year, or month.", 400));
  }

  // Update all Draft timesheets to Submitted
  const updated = await Timesheet.updateMany(
    {
      $expr: { $eq: [{ $toString: "$consultantId" }, consultantId] }, // Ensure consultantId matches
      year,
      month,
      status: "Approved", // Only update Draft entries
    },
    { $set: { status: "Submitted" } }
  );

  res.status(200).json({
    status: "success",
    message: `Successfully reverted ${updated.modifiedCount} timesheet entries.`,
  });
});

// =======================================================================
// 14. Revert timesheet entries (Status changed from "Processed" → "Approved")
// =======================================================================

exports.revertProcessedTimesheetEntries = catchAsync(async (req, res, next) => {
  let { consultantId, year, month } = req.params;

  // Convert year and month to numbers safely
  year = parseInt(year, 10);
  month = parseInt(month, 10);

  // Ensure consultantId is valid
  if (!consultantId || isNaN(year) || isNaN(month)) {
    return next(new AppError("Invalid consultantId, year, or month.", 400));
  }

  // Update all Draft timesheets to Submitted
  const updated = await Timesheet.updateMany(
    {
      $expr: { $eq: [{ $toString: "$consultantId" }, consultantId] }, // Ensure consultantId matches
      year,
      month,
      status: "Processed", // Only update Draft entries
    },
    { $set: { status: "Approved" } }
  );

  res.status(200).json({
    status: "success",
    message: `Successfully reverted ${updated.modifiedCount} timesheet entries.`,
  });
});

// =================================================================================
// 15. Get all timesheet entries for all Deliverable (Milestone) / month / year
// =================================================================================
exports.getAllConsultantsWorkedHoursForDelievrablesMonthYear = async (
  req,
  res
) => {
  try {
    const { year, month } = req.params;

    const entries = await Timesheet.find({
      year,
      month,
      status: { $in: ["Approved", "Processed"] },
    })
      .populate({
        path: "milestones.milestone_id",
        select: "name",
      })
      .populate({
        path: "consultantId",
        select: "name",
      });

    const milestoneMap = {};

    for (const entry of entries) {
      const consultantName = entry.consultantId?.name || "Unknown Consultant";

      for (const milestone of entry.milestones || []) {
        const milestoneName =
          milestone.milestone_id?.name || "Unknown Deliverable";

        if (!milestoneMap[milestoneName]) {
          milestoneMap[milestoneName] = {
            consultants: {},
            totalHours: 0,
          };
        }

        milestoneMap[milestoneName].consultants[consultantName] =
          (milestoneMap[milestoneName].consultants[consultantName] || 0) +
          milestone.hours;

        milestoneMap[milestoneName].totalHours += milestone.hours;
      }
    }

    res.status(200).json({
      status: "success",
      data: { milestoneSummary: milestoneMap },
    });
  } catch (err) {
    console.error("Error generating milestone summary report:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to generate milestone summary report.",
    });
  }
};

// =================================================================================
// 16. Get all timesheet entries for selected Deliverable (Milestone) for a period
// =================================================================================
exports.getAllConsultantsWorkedHoursForSelectedDeliverableForPeriod = async (
  req,
  res
) => {
  try {
    const { milestoneId, fromYear, fromMonth, toYear, toMonth } = req.params;

    const fromY = parseInt(fromYear);
    const fromM = parseInt(fromMonth);
    const toY = parseInt(toYear);
    const toM = parseInt(toMonth);

    const fromIndex = fromY * 12 + fromM;
    const toIndex = toY * 12 + toM;

    const entries = await Timesheet.find({
      status: { $in: ["Processed"] },
      "milestones.milestone_id": milestoneId,
    })
      .populate({
        path: "milestones.milestone_id",
        select: "name",
      })
      .populate({
        path: "consultantId",
        select: "name role",
      });

    const consultantMap = {};
    let milestoneName = "Unknown Deliverable";
    let totalHours = 0;

    for (const entry of entries) {
      const entryIndex = entry.year * 12 + entry.month;
      if (entryIndex < fromIndex || entryIndex > toIndex) continue;

      const consultantName = entry.consultantId?.name || "Unknown Consultant";
      const consultantRole = entry.consultantId?.role || "Consultant";

      for (const milestone of entry.milestones || []) {
        if (milestone.milestone_id?._id.toString() !== milestoneId) continue;

        milestoneName = milestone.milestone_id?.name || milestoneName;

        if (!consultantMap[consultantName]) {
          consultantMap[consultantName] = {
            role: consultantRole,
            hours: 0,
          };
        }

        consultantMap[consultantName].hours += milestone.hours;
        totalHours += milestone.hours;
      }
    }

    const consultantList = Object.entries(consultantMap).map(
      ([name, data]) => ({
        name,
        role: data.role,
        hours: data.hours,
      })
    );

    res.status(200).json({
      status: "success",
      data: {
        deliverable: milestoneName,
        from: { year: fromY, month: fromM },
        to: { year: toY, month: toM },
        consultants: consultantList,
        totalHours,
      },
    });
  } catch (err) {
    console.error("Error generating consultant hours report:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to generate consultant hours report.",
    });
  }
};

// =================================================================================
// 17. Get all deliverables (Milestones) with consultants and their worked hour for given period
// =================================================================================
exports.getAllDelievrablesAndConsultantsWorkedHoursForSelectedPeriod = async (
  req,
  res
) => {
  try {
    const { fromYear, fromMonth, toYear, toMonth } = req.params;

    const fromY = parseInt(fromYear);
    const fromM = parseInt(fromMonth);
    const toY = parseInt(toYear);
    const toM = parseInt(toMonth);

    const fromIndex = fromY * 12 + fromM;
    const toIndex = toY * 12 + toM;

    const entries = await Timesheet.find({
      status: { $in: ["Processed"] },
    })
      .populate({
        path: "milestones.milestone_id",
        select: "name",
      })
      .populate({
        path: "consultantId",
        select: "name role",
      });

    const deliverableMap = {};

    for (const entry of entries) {
      const entryIndex = entry.year * 12 + entry.month;
      if (entryIndex < fromIndex || entryIndex > toIndex) continue;

      const consultantName = entry.consultantId?.name || "Unknown Consultant";
      const consultantRole = entry.consultantId?.role || "Consultant";

      for (const milestone of entry.milestones || []) {
        const milestoneId = milestone.milestone_id?._id?.toString();
        const milestoneName =
          milestone.milestone_id?.name || "Unknown Deliverable";

        if (!deliverableMap[milestoneName]) {
          deliverableMap[milestoneName] = {
            consultants: {},
            totalHours: 0,
          };
        }

        if (!deliverableMap[milestoneName].consultants[consultantName]) {
          deliverableMap[milestoneName].consultants[consultantName] = {
            role: consultantRole,
            hours: 0,
          };
        }

        deliverableMap[milestoneName].consultants[consultantName].hours +=
          milestone.hours;
        deliverableMap[milestoneName].totalHours += milestone.hours;
      }
    }

    // Format for frontend
    const result = Object.entries(deliverableMap).map(
      ([deliverable, data]) => ({
        deliverable,
        consultants: Object.entries(data.consultants).map(([name, cData]) => ({
          name,
          role: cData.role,
          hours: cData.hours,
        })),
        totalHours: data.totalHours,
      })
    );

    res.status(200).json({
      status: "success",
      data: {
        from: { year: parseInt(fromYear), month: parseInt(fromMonth) },
        to: { year: parseInt(toYear), month: parseInt(toMonth) },
        deliverables: result,
      },
    });
  } catch (err) {
    console.error("Error generating all milestone hours report:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to generate milestone-wise consultant hours report.",
    });
  }
};
