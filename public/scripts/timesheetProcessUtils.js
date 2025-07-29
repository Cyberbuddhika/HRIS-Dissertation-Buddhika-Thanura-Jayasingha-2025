/**
 * ============================================================================
 * File: timesheetProcessUtils.js
 * Description: JavaScript for handling timesheet process functions.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

import { generateCalendarBody, getTimesheetData } from "./timesheetUtils.js";
import { showModal } from "./util.js";

let selectedConsultantIdForConsultant = "";
let consultantDataSetForConsultant = null;

/**
 * Function to get consultant data for the selected consultant
 */
const getDataForSelectedConsultant = async () => {
  const selectedConsultantId = document.getElementById(
    "timesheet-Process-consultant"
  ).value;
  selectedConsultantIdForConsultant = selectedConsultantId;

  try {
    const consultantApiResponse = await fetch(
      `/api/v1/consultants/${selectedConsultantId}`
    );
    const consultantData = await consultantApiResponse.json();

    const consultant = consultantData.data.consultant;
    consultantDataSetForConsultant = {
      name: consultant.name,
      designation: consultant.designation,
      noOfWorkingDaysPerMonth: consultant.noOfWorkingDaysPerMonth,
      noOfWorkingHoursPerMonth: consultant.noOfWorkingHoursPerMonth,
      milestones: consultant.assignedMilestones
        .filter((milestone) => milestone.milestoneStatus === "Active")
        .map((milestone) => ({
          id: milestone.id,
          name: milestone.name,
          project: milestone.project, // Include project name for context
        })),
    };

    return consultantDataSetForConsultant;
  } catch (err) {
    console.error("Error fetching consultant data:", err);
  }
};

/**
 * Function to update consultant's basic details in the UI
 */
export const updateBasicDataForSelectedConsultant = async () => {
  try {
    // Fetch basic consultant data
    const consultant = await getDataForSelectedConsultant();

    if (!consultant) {
      console.warn("No consultant data available.");
      return;
    }

    // Update the DOM with consultant's name and designation
    document.getElementById("consultant-name").textContent = consultant.name;
    document.getElementById("consultant-designation").textContent =
      consultant.designation;
    document.getElementById("consultant-working-hours-days").textContent =
      `${consultant.noOfWorkingHoursPerMonth} / ${consultant.noOfWorkingDaysPerMonth}`;
  } catch (err) {
    console.error("Error initializing basic data:", err);
  }
};

/**
 * Function to initiate generating calendar based on month and year user input
 *
 */

export const getMonthAndYearForTimesheetProcessPage = async (
  monthInput,
  yearInput
) => {
  try {
    const month = parseInt(monthInput.value);
    const year = parseInt(yearInput.value);

    // Calculate the calendar details
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let startDayOfTheMonth = new Date(year, month, 1).getDay();
    startDayOfTheMonth = startDayOfTheMonth === 0 ? 6 : startDayOfTheMonth - 1;

    const weekends = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = (new Date(year, month, day).getDay() + 6) % 7;
      if (currentDay === 5 || currentDay === 6) weekends.push(day);
    }

    // Generate the calendar
    generateCalendarBody(startDayOfTheMonth, daysInMonth, weekends);

    // Fetch timesheet data
    await getTimesheetData(
      monthInput,
      yearInput,
      selectedConsultantIdForConsultant
    );
  } catch (err) {
    console.error("Error in getMonthAndYear:", err);
  }
};

/**
 * Function to update timesheet entry status from Approved to Processed
 *
 */

const processTimesheetEntries = async () => {
  const processButton = document.getElementById("processButton");
  const consultantId = selectedConsultantIdForConsultant; // Get Consultant ID dynamically
  const year = parseInt(document.getElementById("year").value);
  const month = parseInt(document.getElementById("month").value) + 1;

  const userConfirmed = await showModal(
    "Are you sure you want to process this timesheet?",
    "confirm"
  );

  if (!userConfirmed) return;

  if (processButton) {
    try {
      const response = await fetch(
        `/api/v1/timesheet/process/${consultantId}/${year}/${month}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      if (response.ok) {
        await showModal(data.message, "alert");
        // Refresh calendar or UI
        getMonthAndYearForTimesheetProcessPage(
          document.getElementById("month"),
          document.getElementById("year")
        );
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }
};

/**
 * Function to update timesheet entry status from approved to submitted
 *
 */

const revertTimesheetEntriesToSubmitted = async () => {
  const revertButton = document.getElementById("revertToApproveButton");
  const consultantId = selectedConsultantIdForConsultant; // Get Consultant ID dynamically
  const year = parseInt(document.getElementById("year").value);
  const month = parseInt(document.getElementById("month").value) + 1;

  const userConfirmed = await showModal(
    "Are you sure you want to revert this approved timesheet?",
    "confirm"
  );

  if (!userConfirmed) return;

  if (revertButton) {
    try {
      const response = await fetch(
        `/api/v1/timesheet/revertApproved/${consultantId}/${year}/${month}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      if (response.ok) {
        await showModal(data.message, "alert");

        // Refresh calendar or UI
        getMonthAndYearForTimesheetProcessPage(
          document.getElementById("month"),
          document.getElementById("year")
        );
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }
};

/**
 * ============================================================================
 * Event Listners
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  const timesheetProcessViewModule = document.getElementById(
    "timesheetProcessView-module"
  );

  if (!timesheetProcessViewModule) return; // Exit if not on the timesheet page

  document
    .getElementById("revertToApproveButton")
    ?.addEventListener("click", revertTimesheetEntriesToSubmitted);
  document
    .getElementById("processButton")
    ?.addEventListener("click", processTimesheetEntries);
});
