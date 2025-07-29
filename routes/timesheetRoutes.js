/**
 * ============================================================================
 * File: timesheetRoutes.js
 * Description: Route definitions for Timesheet API endpoints.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

const express = require("express");
const timesheetController = require("../controllers/timesheetController");
const authController = require("./../controllers/authController");

const router = express.Router();

// Protect all routes
router.use(authController.protect);

// Get deliverable report for given period with consultants and their worked hours
router
  .route("/milestones/:fromYear/:fromMonth/:toYear/:toMonth")
  .get(
    authController.restrictTo("admin", "super admin"),
    timesheetController.getAllDelievrablesAndConsultantsWorkedHoursForSelectedPeriod
  );

// Get deliverable report for selected deliverable for given period with consultants and their worked hours
router
  .route("/:milestoneId/:fromYear/:fromMonth/:toYear/:toMonth")
  .get(
    authController.restrictTo("admin", "super admin"),
    timesheetController.getAllConsultantsWorkedHoursForSelectedDeliverableForPeriod
  );

// Get deliverable report for selected deliverable for given month with consultants and their worked hours
router
  .route("/milestones/:year/:month")
  .get(
    authController.restrictTo("admin", "super admin"),
    timesheetController.getAllConsultantsWorkedHoursForDelievrablesMonthYear
  );

// -------------------- Public to All Authenticated Users -------------------- //

// Get timesheet entries for a specific consultant, year, and month
router
  .route("/:consultantId/:year/:month")
  .get(timesheetController.getTimesheetEntries);

// Get timesheet entries for all consultants for a specific year and month
router
  .route("/:year/:month")
  .get(timesheetController.getAllConsultantsTimesheets);

// Get timesheet entries by day
router
  .route("/:consultantId/:year/:month/:day")
  .get(timesheetController.getTimesheetEntriesByDay);

// Add new entry
router.route("/").post(timesheetController.addTimesheetEntry);

// Update milestone
router
  .route("/:id/milestones/:milestoneEntryId")
  .patch(timesheetController.updateTimesheetMilestone);

// Delete milestone
router
  .route("/:id/milestones/:milestoneEntryId")
  .delete(timesheetController.deleteTimesheetMilestone);

// Delete a timesheet entry
router
  .route("/:id/:leaveEntryId")
  .delete(timesheetController.deleteTimesheetEntry);

// Submit timesheet
router
  .route("/submit/:consultantId/:year/:month")
  .patch(timesheetController.submitTimesheetEntries);

// -------------------- Leader & Admin Access -------------------- //

router
  .route("/revert/:consultantId/:year/:month")
  .patch(
    authController.restrictTo("leader", "admin", "super admin"),
    timesheetController.revertTimesheetEntries
  );

router
  .route("/approve/:consultantId/:year/:month")
  .patch(
    authController.restrictTo("leader", "admin", "super admin"),
    timesheetController.approveTimesheetEntries
  );

// -------------------- Admin & Super Admin Access -------------------- //

router
  .route("/revertApproved/:consultantId/:year/:month")
  .patch(
    authController.restrictTo("admin", "super admin"),
    timesheetController.revertApprovedTimesheetEntries
  );

router
  .route("/process/:consultantId/:year/:month")
  .patch(
    authController.restrictTo("admin", "super admin"),
    timesheetController.processTimesheetEntries
  );

router
  .route("/revertProcessed/:consultantId/:year/:month")
  .patch(
    authController.restrictTo("admin", "super admin"),
    timesheetController.revertProcessedTimesheetEntries
  );

router
  .route("/updateStatus")
  .patch(
    authController.restrictTo("admin", "super admin"),
    timesheetController.updateExistingTimesheetsToDraft
  );

router
  .route("/lock/:consultantId/:year/:month")
  .patch(
    authController.restrictTo("admin", "super admin"),
    timesheetController.lockUnlockTimesheet
  );

module.exports = router;
