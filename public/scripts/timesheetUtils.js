/**
 * ============================================================================
 * File: timesheetUtils.js
 * Description: JavaScript for handling timesheet functions.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

import { showModal } from "./util.js";

let currentConsultantId = "";
let timesheetEntries = "";
let consultantDataSet = null;
let leaveTypes = null;
let timesheetStatus = "Draft";

/**
 * ============================================================================
 * Main Functions
 * ============================================================================
 */

/**
 * Function to initialize basic consultant data (name and designation)
 *
 */

export const initializeBasicData = async () => {
  const isApprovalPage = document.getElementById(
    "timesheetApprovalView-module"
  );
  if (isApprovalPage) return; // Prevent it from running on approval page
  try {
    // Fetch basic consultant data
    const {
      name,
      designation,
      noOfWorkingDaysPerMonth,
      noOfWorkingHoursPerMonth,
    } = await getConsultantData();

    // Update the DOM with consultant's name and designation
    const consultantName = document.getElementById("consultant-name");
    const consultantDesignation = document.getElementById(
      "consultant-designation"
    );
    const consultantWorkingHoursDays = document.getElementById(
      "consultant-working-hours-days"
    );

    consultantName.textContent = name;
    consultantDesignation.textContent = designation;
    consultantWorkingHoursDays.textContent = `${noOfWorkingHoursPerMonth} / ${noOfWorkingDaysPerMonth}`;
  } catch (err) {
    console.error("Error initializing basic data:", err);
  }
};

/**
 * Function to initiate generating calendar based on month and year user input
 *
 */

export const getMonthAndYear = async (monthInput, yearInput) => {
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
    await getTimesheetData(monthInput, yearInput, currentConsultantId);

    // Update submit button style based on timesheet status (Draft or Submitted)
    // updateSubmitButton();
    updateButton("Draft", "submitButton");
  } catch (err) {
    console.error("Error in getMonthAndYear:", err);
  }
};

/**
 * Function to initialize modal for new timesheet data entry
 *
 */

export const openModal = async (day) => {
  const timesheetApprovalPage = document.getElementById(
    "timesheetApprovalView-module"
  );
  if (timesheetApprovalPage) {
    await showModal(
      "Timesheet data cannot cannot be modified by Line Manager.",
      "alert"
    ); // Show alert modal after submission

    // alert("Timesheet data cannot cannot be modified by Line Manager.");
    return;
  }
  if (timesheetStatus !== "Draft") {
    await showModal(
      "This timesheet has been submitted and cannot be modified.",
      "alert"
    );

    return;
  }
  try {
    const modal = document.getElementById("timesheetModal");
    const modalDate = document.getElementById("modalDate");
    const backdrop = document.getElementById("modalBackdrop");
    const milestoneSelect = document.getElementById("milestoneSelect");
    const weekendInput = document.getElementById("weekendInput");
    const existingEntriesContainer = document.getElementById("existingEntries");
    const leaveSelect = document.getElementById("leaveSelect");
    const statusSelect = document.getElementById("statusSelect");
    const workedFields = document.getElementById("workedFields");
    const leaveFields = document.getElementById("leaveFields");
    const leavePeriodFields = document.getElementById("leavePeriodFields");
    const leavePeriodSelect = document.getElementById("leavePeriodSelect");

    //  Clear previous milestone entries before adding new ones
    existingEntriesContainer.innerHTML = "";

    // Get selected year & month from dropdowns
    const selectedMonth = parseInt(document.getElementById("month").value);
    const selectedYear = parseInt(document.getElementById("year").value);

    if (isNaN(selectedMonth) || isNaN(selectedYear)) {
      console.error("Month or year is invalid.");
      return;
    }

    //  Declare selectedDate before using it
    const selectedDate = new Date(selectedYear, selectedMonth, day);

    // Create a full date string
    const dateString = new Date(
      selectedYear,
      selectedMonth,
      day
    ).toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Set the date inside the modal
    modalDate.textContent = `${dateString}`;
    modal.setAttribute("data-day", day);
    modal.setAttribute("data-month", selectedMonth);
    modal.setAttribute("data-year", selectedYear);

    modal.classList.remove("hidden");
    backdrop.classList.remove("hidden");

    // Clear previous milestone options
    milestoneSelect.innerHTML = '<option value="">Select an activity</option>';

    // Get consultant data (which already includes milestones)
    // const consultantData = await getConsultantData();
    const consultantData = consultantDataSet;

    if (!consultantData || !consultantData.milestones) {
      console.error("No milestones found in consultant data");
      return;
    }

    // Getting Leave types

    // Clear existing options before loading new ones
    leaveSelect.innerHTML = '<option value="">Select a leave type</option>';
    // Populate dropdown with leaves
    leaveTypes.forEach((leave) => {
      const option = document.createElement("option");
      option.value = leave._id;
      option.textContent = `${leave.type}`;
      leaveSelect.appendChild(option);
    });

    // Event Listener: When the user selects a leave type
    leaveSelect.addEventListener("change", function () {
      const selectedLeaveId = leaveSelect.value;
      const isHalfDayEligible =
        leaveTypes.find((leave) => leave._id === selectedLeaveId)
          ?.halfdayEligible || false; // checking half day leave types

      if (selectedLeaveId) {
        if (isHalfDayEligible) {
          // Show Full Day / Half Day option
          leavePeriodFields.classList.remove("hidden");
        } else {
          // Hide Full Day / Half Day option & Default to Full Day
          leavePeriodFields.classList.add("hidden");
          leavePeriodSelect.value = "Full Day"; // Auto-select Full Day
        }
      }
    });

    let currentConsultantId = consultantData.currentConsultantId;

    // Populate dropdown with milestones
    consultantData.milestones.forEach((milestone) => {
      const option = document.createElement("option");
      option.value = milestone.id;
      option.textContent = `${milestone.name} (${milestone.project})`;
      milestoneSelect.appendChild(option);
    });

    // Auto-detect if selected day is a weekend
    const isWeekend =
      selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
    weekendInput.checked = isWeekend;

    //  Event Listener to Toggle Fields Based on Status Selection
    statusSelect.addEventListener("change", () => {
      if (statusSelect.value === "worked") {
        workedFields.classList.remove("hidden"); // Show Milestone & Hours
        leaveFields.classList.add("hidden"); // Hide Leave dropdown
        leavePeriodFields.classList.add("hidden"); // Hide Leave period dropdown
      } else if (statusSelect.value === "leave") {
        leaveFields.classList.remove("hidden"); // Show Leave dropdown
        workedFields.classList.add("hidden"); // Hide Milestone & Hours
      }
    });

    //  Fetch existing timesheet entries for this day
    const timesheetEntries = await getTimesheetEntries(
      currentConsultantId,
      selectedYear,
      selectedMonth + 1,
      day
    );

    // Get all leaves from timesheet entries
    const leaveEntries = timesheetEntries.flatMap((entry) =>
      entry.leaves.map((leave) => ({
        leaveId: leave._id, // The leave entry ID
        leaveType: leave.leave, // The ID reference to leave type
        dayId: entry._id, // The Timesheet Entry (Day) ID
      }))
    );

    if (leaveEntries.length > 0) {
      leaveEntries.forEach((leaveEntry) => {
        // Find the corresponding leave type by matching _id
        const leaveType = leaveTypes.find(
          (leave) => leave._id === leaveEntry.leaveType
        );

        // Create the leave entry display
        const entryDiv = document.createElement("div");
        entryDiv.classList.add(
          "p-2",
          "mt-2",
          "bg-gray-100",
          "rounded",
          "flex",
          "justify-between"
        );

        entryDiv.innerHTML = `
          <span>${leaveType ? leaveType.type : "Unknown Leave"}</span>
          <button class="bg-red-500 text-white px-2 py-1 rounded delete-day-entry"
            data-entry-id="${leaveEntry.dayId}" 
            data-leave-id="${leaveEntry.leaveId}"> 
            Delete
          </button>
        `;

        // Append entryDiv inside the loop to ensure each leave gets displayed
        existingEntriesContainer.appendChild(entryDiv);
      });
    }

    // Then, check for Milestones
    if (timesheetEntries.length > 0) {
      timesheetEntries.forEach((entry) => {
        entry.milestones.forEach((milestone) => {
          const entryDiv = document.createElement("div");
          entryDiv.classList.add(
            "p-2",
            "mt-2",
            "bg-gray-100",
            "rounded",
            "flex",
            "justify-between"
          );

          entryDiv.innerHTML = `
        <span>${milestone.milestone_id.name} - ${milestone.hours}h (${milestone.status})</span>
        <button class="bg-red-500 text-white px-2 py-1 rounded delete-entry"
          data-entry-id="${entry._id}"
          data-milestone-id="${milestone._id}">
          Delete
        </button>
      `;

          existingEntriesContainer.appendChild(entryDiv);
        });
      });

      //  Add event listeners to delete buttons (Milestones)
      document.querySelectorAll(".delete-entry").forEach((btn) => {
        btn.addEventListener("click", async (event) => {
          const dayId = event.target.getAttribute("data-entry-id");
          const milestoneEntryId =
            event.target.getAttribute("data-milestone-id");
          // const entryId = event.target.getAttribute("data-id");
          await deleteTimesheetEntry(dayId, milestoneEntryId);
          openModal(day); // Refresh modal after deletion
        });
      });

      //  Add event listeners to delete buttons (Leave)
      document.querySelectorAll(".delete-day-entry").forEach((btn) => {
        btn.addEventListener("click", async (event) => {
          const dayId = event.target.getAttribute("data-entry-id");
          const leaveEntryId = event.target.getAttribute("data-leave-id");

          await deleteTimesheetLeaveEntry(dayId, leaveEntryId);
          openModal(day); // Refresh modal after deletion
        });
      });
    }
  } catch (err) {
    console.error("Error opening modal:", err);
  }
};

/**
 * Function to submit timesheet data
 *
 */

export const submitTimesheetEntry = async () => {
  try {
    const modal = document.getElementById("timesheetModal");
    const day = parseInt(modal.getAttribute("data-day"));
    const milestoneId = document.getElementById("milestoneSelect").value;
    const hours = parseFloat(document.getElementById("hoursInput").value);
    const status = document.getElementById("statusSelect").value;
    const weekend = document.getElementById("weekendInput").checked;
    const leave = document.getElementById("leaveSelect").value;
    const leavePeriodSelect =
      document.getElementById("leavePeriodSelect").value;

    const year = parseInt(document.getElementById("year").value);
    const month = parseInt(document.getElementById("month").value) + 1; // Convert to 1-based month;

    const requestBody = {
      consultantId: currentConsultantId,
      year,
      month,
      day,
      milestones: [],
    };

    //  If the user selected "worked", include milestones
    if (status === "worked") {
      if (!milestoneId || !hours) {
        await showModal("Please fill in all required fields.", "alert");

        return;
      }

      const consultantData = consultantDataSet;
      const milestone = consultantData.milestones.find(
        (m) => m.id === milestoneId
      );

      requestBody.milestones = [{ milestone_id: milestoneId, hours, status }];
    }

    // If the user selected "leave", include leave ID
    if (status === "leave") {
      if (!leave) {
        await showModal("Please select a leave type.", "alert");

        return;
      }

      const leaveData = [{ leave: leave, period: leavePeriodSelect }];

      requestBody.leaves = leaveData; // Attach leave ID
    }

    const response = await fetch("/api/v1/timesheet/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) throw new Error("Failed to submit timesheet entry");

    //  Instead of refetching, update the global variable
    const newEntry = await response.json();

    closeModal();
    await getMonthAndYear(
      document.getElementById("month"),
      document.getElementById("year")
    );
  } catch (err) {
    console.error("Error submitting timesheet entry:", err);
  }
};

/**
 * ============================================================================
 * Primary Functions
 * ============================================================================
 */

/**
 * Function to get consultant data
 * Get Consultant data using logged-in user id
 */

const getConsultantData = async () => {
  try {
    const userApiResponse = await fetch("/api/v1/users/me");
    const userData = await userApiResponse.json();

    console.log(userData);
    const consultantId = userData.data.data.consultant_id;
    currentConsultantId = consultantId;

    console.log("running getCOnsultant data - user route");
    console.log(consultantId);

    const consultantApiResponse = await fetch(
      `/api/v1/consultants/${consultantId}`
    );
    const consultantData = await consultantApiResponse.json();

    console.log("running get consultant route");
    console.log(consultantData);

    const name = consultantData.data.consultant.name;
    const designation = consultantData.data.consultant.designation;
    const noOfWorkingDaysPerMonth =
      consultantData.data.consultant.noOfWorkingDaysPerMonth;
    const noOfWorkingHoursPerMonth =
      consultantData.data.consultant.noOfWorkingHoursPerMonth;

    const assignedMilestones = consultantData.data.consultant.assignedMilestones
      .filter((milestone) => milestone.milestoneStatus === "Active")
      .map((milestone) => ({
        id: milestone.id,
        name: milestone.name,
        project: milestone.project, // Include project name for context
      }));

    // Combine all milestones (avoiding duplicates)
    const allMilestones = [...assignedMilestones];

    consultantDataSet = {
      name,
      designation,
      noOfWorkingDaysPerMonth,
      noOfWorkingHoursPerMonth,
      milestones: allMilestones,
      currentConsultantId, // Return milestone list
    };

    return consultantDataSet;
  } catch (err) {
    console.error("Error fetching consultant data:", err);
  }
};

/**
 * Function to generating calendar body
 *
 */

export const generateCalendarBody = (
  startDayOfTheMonth,
  daysInMonth,
  weekends
) => {
  const calendarBody = document.getElementById("calendarBody");
  const calendarHead = document.getElementById("calendarHead");

  calendarBody.innerHTML = "";
  calendarHead.innerHTML = "";

  calendarHead.innerHTML = `<tr class="bg-gray-100 text-center font-bold text-sm uppercase">
        <th class="p-2 border border-gray-300">Mon</th>
        <th class="p-2 border border-gray-300">Tue</th>
        <th class="p-2 border border-gray-300">Wed</th>
        <th class="p-2 border border-gray-300">Thu</th>
        <th class="p-2 border border-gray-300">Fri</th>
        <th class="p-2 border border-gray-300">Sat</th>
        <th class="p-2 border border-gray-300">Sun</th>
      </tr>`;

  let dayCounter = 1;

  for (let row = 0; row < 6; row++) {
    const tr = document.createElement("tr");

    for (let col = 0; col < 7; col++) {
      const td = document.createElement("td");
      td.classList.add("w-24", "p-2", "border", "border-gray-300", "align-top");
      // td.dataset.day = ""; // Clear day data attribute

      if ((row === 0 && col < startDayOfTheMonth) || dayCounter > daysInMonth) {
        td.classList.add("bg-gray-50");
      } else {
        td.classList.add("bg-gray-100", "cursor-pointer");
        const isWeekend = weekends.includes(dayCounter);
        td.setAttribute("data-day", dayCounter); // Add data-day attribute

        //  Only add click event for valid day numbers
        td.addEventListener("click", (event) => {
          event.stopPropagation(); // Prevent bubbling issues
          openModal(parseInt(td.getAttribute("data-day"))); // Ensure a valid number
        });

        // // Click event to open modal
        // td.addEventListener("click", () => openModal(dayCounter));

        if (isWeekend) {
          td.classList.add("bg-gray-200");
        }

        const dayDiv = document.createElement("div");
        dayDiv.classList.add("font-bold", "text-lg", "p-1", "rounded-full");
        dayDiv.textContent = dayCounter;

        td.appendChild(dayDiv);
        // td.dataset.day = dayCounter; // Set the day attribute for later reference
        dayCounter++;
      }

      tr.appendChild(td);
    }

    calendarBody.appendChild(tr);

    if (dayCounter > daysInMonth) break;
  }
};

/**
 * Function to fetch timesheet data
 *
 */

export const getTimesheetData = async (
  monthInput,
  yearInput,
  currentConsultantId
) => {
  try {
    const month = parseInt(monthInput.value) + 1;
    const year = parseInt(yearInput.value);

    if (!currentConsultantId) {
      console.info("Skipping timesheet fetch — consultant ID missing.");
      return;
    }

    // if (!currentConsultantId) {
    //   throw new Error("currentConsultantId is undefined or missing.");
    // }

    const url = `/api/v1/timesheet/${currentConsultantId}/${year}/${month}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch timesheet data: ${response.statusText}`);
    }

    const data = await response.json();

    timesheetEntries = data.data.timesheetEntries; // Saving timesheet entry data in the global variable
    // const newEntries = data.data.timesheetEntries;

    /*************************************************************************************************************
     * - This function ensures that only "Submitted" timesheet entries are processed on the approval page.
     * - If any "Draft" entries exist, the approval process stops to prevent incorrect data from being displayed.
     */

    const timesheetApprovalModule = document.getElementById(
      "timesheetApprovalView-module"
    );

    if (timesheetApprovalModule) {
      // Check if any timesheet entry has "Draft" status
      const hasDraftEntries = timesheetEntries.some(
        (entry) => entry.status === "Draft"
      );

      if (hasDraftEntries) {
        await showModal(
          "There are no submitted timesheet data for the selected month!",
          "alert"
        );

        lockButton("revertToDraftButton");
        lockButton("approveButton");

        clearTimesheetSummary();

        console.warn("Draft entries detected. Approval process halted.");
        return false; // Prevent further execution
      }

      // Check if any timesheet entry has "Approved" status
      const hasApprovedEntries = timesheetEntries.some(
        (entry) => entry.status === "Approved"
      );

      if (hasApprovedEntries) {
        await showModal(
          "Entries for this month are already approved!",
          "alert"
        );

        lockButton("revertToDraftButton");
        lockButton("approveButton");
        // Process the data to calculate totals
        const { totalWorkedHours, totalWorkedDays, leaveSummary } =
          processTimesheetMetrics(timesheetEntries);

        //Update the summary section
        updateTimesheetSummary(totalWorkedHours, totalWorkedDays, leaveSummary);

        // Process and display the milestone summary
        generateMilestoneSummary(timesheetEntries);

        // Update the calendar with milestones
        await updateCalendarWithMilestones(timesheetEntries);
        return;
      }
      unlockButton("revertToDraftButton");
      unlockButton("approveButton");
    }

    /*************************************************************************************************************
     Timesheet Process Page */
    /*************************************************************************************************************
     * - This function ensures that only "Approved" timesheet entries are processed on the process page.
     * - If any "Draft" entries exist, the process process stops to prevent incorrect data from being displayed.
     */

    const timesheetprocessModule = document.getElementById(
      "timesheetProcessView-module"
    );

    if (timesheetprocessModule) {
      // Check if any timesheet entry has "Draft" status
      const hasDraftEntries = timesheetEntries.some(
        (entry) => entry.status === "Draft" || entry.status === "Submitted"
      );

      if (hasDraftEntries) {
        await showModal(
          "There are no approved timesheet data for the selected month!",
          "alert"
        );

        lockButton("processButton");
        lockButton("revertToApproveButton");

        console.warn(
          "Draft entries or submitted entries detected. Processing operation halted."
        );
        return false; // Prevent further execution
      }

      // Check if any timesheet entry has "Approved" status
      const hasProcessedEntries = timesheetEntries.some(
        (entry) => entry.status === "Processed"
      );

      if (hasProcessedEntries) {
        await showModal(
          "Entries for this month are already processed!",
          "alert"
        );

        lockButton("revertToApproveButton");
        lockButton("processButton");

        // Process the data to calculate totals
        const { totalWorkedHours, totalWorkedDays, leaveSummary } =
          processTimesheetMetrics(timesheetEntries);

        //Update the summary section
        updateTimesheetSummary(totalWorkedHours, totalWorkedDays, leaveSummary);

        // Process and display the milestone summary
        generateMilestoneSummary(timesheetEntries);

        // Update the calendar with milestones
        await updateCalendarWithMilestones(timesheetEntries);
        return;
      }
      unlockButton("revertToApproveButton");
      unlockButton("processButton");
    }

    /*************************************************************************************************************
     */

    // Process the data to calculate totals
    const { totalWorkedHours, totalWorkedDays, leaveSummary } =
      processTimesheetMetrics(timesheetEntries);

    //Update the summary section
    updateTimesheetSummary(totalWorkedHours, totalWorkedDays, leaveSummary);

    // Process and display the milestone summary
    generateMilestoneSummary(timesheetEntries);

    // Update the calendar with milestones
    await updateCalendarWithMilestones(timesheetEntries);
  } catch (err) {
    console.error("Error fetching timesheet data:", err);
  }
};

/**
 * Function to close the new timesheet data entry modal
 *
 */

const closeModal = () => {
  document.getElementById("timesheetModal").classList.add("hidden");
  document.getElementById("modalBackdrop").classList.add("hidden");

  //  Clear the existing entries container to prevent duplicate entries
  const existingEntriesContainer = document.getElementById("existingEntries");
  if (existingEntriesContainer) {
    existingEntriesContainer.innerHTML = "";
  }
};

/**
 * Function to get timesheet entries for a day
 *
 */

const getTimesheetEntries = async (currentConsultantId, year, month, day) => {
  try {
    const url = `/api/v1/timesheet/${currentConsultantId}/${year}/${month}/${day}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch timesheet entries: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.data.timesheetEntries || [];
  } catch (err) {
    console.error("Error fetching timesheet entries:", err);
    return [];
  }
};

/**
 * Function to show delete confirmation
 *
 */
const deleteTimesheetEntry = async (dayId, milestoneEntryId) => {
  // if (!confirm("Are you sure you want to delete this entry?")) return;
  const userConfirmed = await showModal(
    "Are you sure you want to delete this entry?",
    "confirm"
  );

  if (!userConfirmed) return;

  try {
    const response = await fetch(
      `/api/v1/timesheet/${dayId}/milestones/${milestoneEntryId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to delete timesheet entry: ${response.statusText}`
      );
    }

    const monthPicker = document.getElementById("month");
    const yearPicker = document.getElementById("year");
    getMonthAndYear(monthPicker, yearPicker);
  } catch (err) {
    console.error("Error deleting timesheet entry:", err);
  }
};

/**
 * Function to show delete entire day entry
 *
 */
const deleteTimesheetLeaveEntry = async (dayId, leaveEntryId) => {
  // if (!confirm("Are you sure you want to delete this entry?")) return;
  const userConfirmed = await showModal(
    "Are you sure you want to delete this entry?",
    "confirm"
  );
  if (!userConfirmed) return;

  try {
    const response = await fetch(`/api/v1/timesheet/${dayId}/${leaveEntryId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to delete timesheet entry: ${response.statusText}`
      );
    }

    const monthPicker = document.getElementById("month");
    const yearPicker = document.getElementById("year");
    getMonthAndYear(monthPicker, yearPicker);
  } catch (err) {
    console.error("Error deleting timesheet entry:", err);
  }
};

/**
 * ============================================================================
 * Secondary Functions
 * ============================================================================
 */

/**
 * Function to process timesheet metrics
 *
 */

// const processTimesheetMetrics = (timesheetEntries) => {
//   let totalWorkedHours = 0;
//   let totalWorkedDays = 0;
//   let totalDaysOff = 0;

//   timesheetEntries.forEach((entry) => {
//     const { totalWorkedHours: dayWorkedHours, milestones } = entry;

//     // Add to total worked hours
//     totalWorkedHours += dayWorkedHours;

//     // If there are any milestones with "worked" status, count as a worked day
//     if (dayWorkedHours > 0) {
//       totalWorkedDays += 1;
//     }

//     // Check if the day includes a "day-off" milestone
//     const hasDayOff = milestones.some(
//       (milestone) => milestone.status === "day-off",
//     );
//     if (hasDayOff) {
//       totalDaysOff += 1;
//     }
//   });

//   return { totalWorkedHours, totalWorkedDays, totalDaysOff };
// };

const processTimesheetMetrics = (timesheetEntries) => {
  let totalWorkedHours = 0;
  let totalWorkedDays = 0;
  let leaveSummary = {}; // Store different leave types and their count

  timesheetEntries.forEach((entry) => {
    const {
      totalWorkedHours: dayWorkedHours,
      milestones,
      leaveSummary: entryLeaveSummary,
    } = entry;

    //  Add up worked hours
    totalWorkedHours += dayWorkedHours;

    // //  Count a worked day if any milestones exist
    // if (dayWorkedHours > 0) {
    //   totalWorkedDays += 1;
    // }

    // As of 28-02-2025 Work days calculation was done by dividing worked hours by 8.

    totalWorkedDays = (totalWorkedHours / 8).toFixed(2);

    //  Track leave days
    if (entryLeaveSummary) {
      for (const [leaveType, leaveCount] of Object.entries(entryLeaveSummary)) {
        leaveSummary[leaveType] = (leaveSummary[leaveType] || 0) + leaveCount;
      }
    }
  });

  return { totalWorkedHours, totalWorkedDays, leaveSummary };
};

/**
 * Function to update the summary section
 *
 */

const updateTimesheetSummary = (
  totalWorkedHours,
  totalWorkedDays,
  leaveSummary
) => {
  const reportedTimeElement = document.getElementById("reported-time");
  const leaveSummaryContainer = document.getElementById("leave-summary");

  // Update reported time
  if (reportedTimeElement) {
    reportedTimeElement.textContent = `${totalWorkedHours}h / ${totalWorkedDays} Days`;
  }

  //  Clear previous leave summary to avoid duplication
  leaveSummaryContainer.innerHTML = "";

  //  Dynamically create leave elements
  for (const [leaveType, totalDays] of Object.entries(leaveSummary)) {
    const leaveDiv = document.createElement("div");
    leaveDiv.classList.add(
      "text-sm",
      "gap-2",
      "flex",
      "flex-col",
      "items-center",
      "mx-2"
    );

    leaveDiv.innerHTML = `
      <div class="text-black font-medium">${leaveType}</div>
      <div class="text-2xl font-bold">${totalDays} days</div>
    `;

    leaveSummaryContainer.appendChild(leaveDiv);
  }
};

/**
 * Function to update the calendar with milestone hours
 *
 */

const updateCalendarWithMilestones = async (timesheetEntries) => {
  timesheetStatus = "Draft"; // Reset for every month
  for (const entry of timesheetEntries) {
    const { day, milestones, leaves, status } = entry;

    // Get the cell for the specific day
    const calendarCell = document.querySelector(
      `#calendarBody td[data-day="${day}"]`
    );

    //Update global `timesheetStatus` if any entry is NOT draft
    if (status !== "Draft") {
      timesheetStatus = status; // Store the highest status
    }

    if (calendarCell) {
      // Clear previous content to prevent duplicates
      calendarCell
        .querySelectorAll("div:not(:first-child)")
        .forEach((el) => el.remove());
      const milestonesContainer = document.createElement("div");
      milestonesContainer.classList.add("mt-2");

      // Check if the day has a leave entry
      if (leaves && leaves.length > 0) {
        leaves.forEach((leave) => {
          const leaveDiv = document.createElement("div");
          leaveDiv.classList.add("text-sm", "text-red-600", "font-bold");

          // Ensure leave type exists before accessing it
          leaveDiv.textContent = leave?.type || "Unknown Leave";

          milestonesContainer.appendChild(leaveDiv);
        });
      }

      //  Display milestones (if available)
      if (milestones.length > 0) {
        milestones.forEach((milestone) => {
          const milestoneDiv = document.createElement("div");
          milestoneDiv.classList.add(
            "p-2",
            "mt-2",
            "mb-2",
            "rounded-md",
            "text-white",
            getMilestoneColor(milestone.milestone_id)
          );
          milestoneDiv.textContent = `${milestone.name} - ${milestone.hours}h`;
          milestonesContainer.appendChild(milestoneDiv);
        });
      }

      calendarCell.appendChild(milestonesContainer);
    }
  }
};

/**
 * Function to generate the milestone summary
 *
 */

const generateMilestoneSummary = (timesheetEntries) => {
  // Create a map to store the total hours for each milestone
  const milestoneTotals = new Map();

  // Iterate through all timesheet entries
  timesheetEntries.forEach((entry) => {
    entry.milestones.forEach((milestone) => {
      const { milestone_id, name, hours, status } = milestone;

      // Ignore milestones with the status "day-off"
      if (status === "day-off") return;

      // Accumulate hours for each milestone
      if (milestoneTotals.has(name)) {
        milestoneTotals.set(name, milestoneTotals.get(name) + hours);
      } else {
        milestoneTotals.set(name, hours);
      }
    });
  });

  // Get the summary container
  const summaryContainer = document.getElementById("milestone-box");

  // Clear any existing content
  summaryContainer.innerHTML = "";

  // Generate a milestone box for each milestone
  milestoneTotals.forEach(async (totalHours, name) => {
    // const milestoneName = await getMilestoneData(milestoneId);

    // Create the milestone box
    const milestoneBox = document.createElement("div");
    milestoneBox.classList.add(
      "flex",
      "gap-5",
      "items-center",
      "justify-between",
      "p-4",
      "border",
      "border-gray-300",
      "bg-white",
      "rounded-lg",
      "min-w-[200px]",
      "max-h-2"
    );

    milestoneBox.innerHTML = `
      <div>
        <div class="text-base text-black">${name}</div>
      </div>
      <div class="text-base font-bold">${totalHours}h ${(totalHours / 8).toFixed(2)} days </div>
    `;

    // Append the milestone box to the summary container
    summaryContainer.appendChild(milestoneBox);
  });
};

const changeTimesheetStatusToSubmit = async () => {
  const consultantId = currentConsultantId; // Get Consultant ID dynamically
  const year = parseInt(document.getElementById("year").value);
  const month = parseInt(document.getElementById("month").value) + 1; // Making it 1 base (Jan = 1)

  // if (!confirm("Are you sure you want to submit all draft timesheets?")) return;
  const userConfirmed = await showModal(
    "Are you sure you want to submit all draft timesheets?",
    "confirm"
  );
  if (!userConfirmed) return;

  try {
    const response = await fetch(
      `/api/v1/timesheet/submit/${consultantId}/${year}/${month}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();
    if (response.ok) {
      showModal(data.message, "alert");
      // alert(data.message);
      // Refresh calendar or UI
      getMonthAndYear(
        document.getElementById("month"),
        document.getElementById("year")
      );
    } else {
      throw new Error(data.message);
    }
  } catch (err) {
    console.error("Error submitting timesheets:", err);
  }
};

/**
 * ============================================================================
 * Utility Functions
 * ============================================================================
 */

// Predefined color palette for milestones
const milestoneColors = [
  "bg-secondary-200",
  "bg-secondary-500",
  "bg-secondary-600",
  "bg-green-600",
  "bg-black",
];

// Object to track assigned colors
const assignedMilestoneColors = {};
let colorIndex = 0; // Keep track of used colors

/**
 * Function to get a color for each milestone
 *
 */

const getMilestoneColor = (milestoneId) => {
  if (assignedMilestoneColors[milestoneId]) {
    return assignedMilestoneColors[milestoneId]; // Return assigned color
  }

  // Assign a new color from the array
  let assignedColor = milestoneColors[colorIndex];

  // Cycle through colors if we run out
  colorIndex = (colorIndex + 1) % milestoneColors.length;

  // Store the assigned color
  assignedMilestoneColors[milestoneId] = assignedColor;
  return assignedColor;
};

/**
 * Function to get consultant Leave types
 *
 */

export const getConsultantLeaveTypes = async () => {
  try {
    const url = `/api/v1/consultant-leaves/`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch timesheet entries: ${response.statusText}`
      );
    }

    const data = await response.json();

    // Ensure correct data assignment
    leaveTypes = data.data.data || [];
  } catch (err) {
    console.error("Error fetching timesheet entries:", err);
    return [];
  }
};

/**
 * Function to generate a simple hash from a string (e.g., milestoneId)
 *
 */

String.prototype.hashCode = function () {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    hash = this.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

/**
 * Function to attach event listeners to calendar cells
 *
 */

const attachCalendarClickEvents = () => {
  document.querySelectorAll("#calendarBody td[data-day]").forEach((cell) => {
    cell.addEventListener("click", () => {
      const day = cell.getAttribute("data-day");
      openModal(day);
    });
  });
};

// /**
//  * Function to update submit button
//  *
//  */
// const updateSubmitButton = () => {
//   const submitButton = document.getElementById("submitButton");

//   if (timesheetStatus !== "Draft") {
//     submitButton.disabled = true;
//     submitButton.classList.add("bg-secondary-900", "cursor-not-allowed"); // Gray out
//     submitButton.classList.remove("bg-secondary-600", "hover:bg-secondary-200");
//   } else {
//     submitButton.disabled = false;
//     submitButton.classList.add("bg-secondary-600", "hover:bg-secondary-200"); // Restore original
//     submitButton.classList.remove("bg-secondary-900", "cursor-not-allowed");
//   }
// };

/**
 * Function to update submit button
 * @example
 * // Example usage :
 * updateButton("Draft", "submitButton");
 *
 */
export const updateButton = (status, btnId) => {
  const submitButton = document.getElementById(btnId);
  if (!submitButton) return; // 🛡️ Guard clause to prevent TypeError

  if (timesheetStatus !== status) {
    submitButton.disabled = true;
    submitButton.classList.add("bg-secondary-900", "cursor-not-allowed"); // Gray out
    submitButton.classList.remove("bg-secondary-600", "hover:bg-secondary-200");
  } else {
    submitButton.disabled = false;
    submitButton.classList.add("bg-secondary-600", "hover:bg-secondary-200"); // Restore original
    submitButton.classList.remove("bg-secondary-900", "cursor-not-allowed");
  }
};

/**
 * Function to Lock button
 *
 */
export const lockButton = (btnId) => {
  const submitButton = document.getElementById(btnId);

  submitButton.disabled = true;
  submitButton.classList.add("bg-secondary-900", "cursor-not-allowed"); // Gray out
  submitButton.classList.remove("bg-secondary-600", "hover:bg-secondary-200");
};

/**
 * Function to Unlock button
 *
 */
export const unlockButton = (btnId) => {
  const submitButton = document.getElementById(btnId);

  submitButton.disabled = false;
  submitButton.classList.add("bg-secondary-600", "hover:bg-secondary-200"); // Restore original
  submitButton.classList.remove("bg-secondary-900", "cursor-not-allowed");
};

export const initializeCalendar = async () => {
  try {
    await initializeBasicData(); // Fetch consultant data

    // Attach click events to calendar days
    attachCalendarClickEvents();
  } catch (err) {
    console.error("Error initializing calendar:", err);
  }
};

/**
 * Function to clear the summary section
 * This is used in approval page when we detected draft and return the approval function.
 */

const clearTimesheetSummary = () => {
  const reportedTimeElement = document.getElementById("reported-time");
  const leaveSummaryContainer = document.getElementById("leave-summary");
  const milestoneBox = document.getElementById("milestone-box");

  //  Clear previous leave summary to avoid duplication
  leaveSummaryContainer.innerHTML = "";
  reportedTimeElement.innerHTML = "";
  milestoneBox.innerHTML = "";
};

/**
 * ============================================================================
 * Event Listners
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  const timesheetModule = document.getElementById("timesheet-module");

  if (!timesheetModule) return; // Exit if not on the timesheet page

  document.getElementById("modalClose")?.addEventListener("click", closeModal);
  document
    .getElementById("submitEntry")
    ?.addEventListener("click", submitTimesheetEntry);
  document
    .getElementById("submitButton")
    .addEventListener("click", changeTimesheetStatusToSubmit);
});
