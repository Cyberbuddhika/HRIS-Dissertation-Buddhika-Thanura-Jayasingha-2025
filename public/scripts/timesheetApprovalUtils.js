/**
 * ============================================================================
 * File: timesheetApprovalUtils.js
 * Description: JavaScript for handling timesheet approval functions.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

import { generateCalendarBody, getTimesheetData } from "./timesheetUtils.js";
import { showModal } from "./util.js";

let selectedConsultantIdByLineManager = "";
let consultantDataSetForLineManager = null;

/**
 * Function to initialize timesheet approval page
 */
export const initilizeTimesheetApprovalPageData = async () => {
  await setConsultantDropdown(); // Populate dropdown

  //  Attach event listener for consultant selection
  const consultantSelect = document.getElementById("lineManagerConsultant");
  if (consultantSelect) {
    consultantSelect.addEventListener("change", async () => {
      await updateBasicDataForSelectedConsultant(); // Fetch consultant data on selection
    });
  }
};

/**
 * Function to fetch consultants for the Line Manager
 */
const getConsultantsForLinemanager = async (consultantID) => {
  try {
    const response = await fetch(
      `/api/v1/consultants/line-manager/${consultantID}`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch consultant entries: ${response.statusText}`
      );
    }

    const consultantList = await response.json();
    return consultantList.data.consultants || []; //  Extract consultants array
  } catch (error) {
    console.error("Error fetching consultants:", error);
    return [];
  }
};

/**
 * Function to populate consultant dropdown
 */
export const setConsultantDropdown = async () => {
  try {
    // Get the logged-in user
    const userApiResponse = await fetch("/api/v1/users/me");
    const userData = await userApiResponse.json();
    const consultantId = userData.data.data.consultant_id;

    if (!consultantId) {
      console.warn("No consultant ID found for the user.");
      return;
    }

    // Fetch consultants assigned to this line manager
    const consultantList = await getConsultantsForLinemanager(consultantId);

    // Get the dropdown element
    const consultantSelect = document.getElementById("lineManagerConsultant");

    if (!consultantSelect) {
      console.error("Consultant dropdown element not found.");
      return;
    }

    // Clear existing options before adding new ones
    consultantSelect.innerHTML = `<option value="">Select a Consultant</option>`;

    // Populate dropdown with consultant names
    consultantList.forEach((consultant) => {
      const option = document.createElement("option");
      option.value = consultant._id; // Store ID as value
      option.textContent = consultant.name; // Show name
      consultantSelect.appendChild(option);
    });

    //  Auto-select first consultant (optional)
    if (consultantList.length > 0) {
      consultantSelect.value = consultantList[0]._id;
      await updateBasicDataForSelectedConsultant(); // Fetch data for first consultant
    }
  } catch (error) {
    console.error("Error setting consultant dropdown:", error);
  }
};

/**
 * Function to get consultant data for the selected consultant
 */
const getDataForSelectedConsultant = async () => {
  const selectedConsultantId = document.getElementById(
    "lineManagerConsultant"
  ).value;
  selectedConsultantIdByLineManager = selectedConsultantId;

  try {
    const consultantApiResponse = await fetch(
      `/api/v1/consultants/${selectedConsultantId}`
    );
    const consultantData = await consultantApiResponse.json();

    const consultant = consultantData.data.consultant;
    consultantDataSetForLineManager = {
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

    return consultantDataSetForLineManager;
  } catch (err) {
    console.error("Error fetching consultant data:", err);
  }
};

/**
 * Function to update consultant's basic details in the UI
 */
const updateBasicDataForSelectedConsultant = async () => {
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

export const getMonthAndYearForTimesheetApprovalPage = async (
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
      selectedConsultantIdByLineManager
    );
  } catch (err) {
    console.error("Error in getMonthAndYear:", err);
  }
};

/**
 * Function to update timesheet entry status from submitted to draft
 *
 */

const revertTimesheetEntriesToDraft = async () => {
  const revertButton = document.getElementById("revertToDraftButton");
  const consultantId = selectedConsultantIdByLineManager; // Get Consultant ID dynamically
  const year = parseInt(document.getElementById("year").value);
  const month = parseInt(document.getElementById("month").value) + 1;

  const userConfirmed = await showModal(
    "Are you sure you want to revert this submitted timesheet?",
    "confirm"
  );

  if (!userConfirmed) return;

  if (revertButton) {
    try {
      const response = await fetch(
        `/api/v1/timesheet/revert/${consultantId}/${year}/${month}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      if (response.ok) {
        await showModal(data.message, "alert");

        // Refresh calendar or UI
        getMonthAndYearForTimesheetApprovalPage(
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
 * Function to update timesheet entry status from submitted to approved
 *
 */

const approveTimesheetEntries = async () => {
  const approveButton = document.getElementById("approveButton");
  const consultantId = selectedConsultantIdByLineManager; // Get Consultant ID dynamically
  const year = parseInt(document.getElementById("year").value);
  const month = parseInt(document.getElementById("month").value) + 1;

  const userConfirmed = await showModal(
    "Are you sure you want to approve this timesheet?",
    "confirm"
  );

  if (!userConfirmed) return;

  if (approveButton) {
    try {
      const response = await fetch(
        `/api/v1/timesheet/approve/${consultantId}/${year}/${month}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      if (response.ok) {
        await showModal(data.message, "alert");
        // Refresh calendar or UI
        getMonthAndYearForTimesheetApprovalPage(
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
  const timesheetApprovalViewModule = document.getElementById(
    "timesheetApprovalView-module"
  );

  if (!timesheetApprovalViewModule) return; // Exit if not on the timesheet page

  document
    .getElementById("revertToDraftButton")
    ?.addEventListener("click", revertTimesheetEntriesToDraft);
  document
    .getElementById("approveButton")
    ?.addEventListener("click", approveTimesheetEntries);
});
