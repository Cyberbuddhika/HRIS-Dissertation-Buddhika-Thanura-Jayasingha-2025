/**
 * ============================================================================
 * File: script.js
 * Description: JavaScript for handling sidebar navigation toggle and status filtering.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

import { toggleSection } from "./navigation.js";
import { initFilter, initSorting, initSearch } from "./tableUtils.js";
import {
  consultantCreateFromSubmit,
  loadConsultantDataForEditForm,
  consultantEditFormUpdate,
  showConsultantsForProjects,
} from "./consultantUtils.js";

import {
  createNewProject,
  loadProjectData,
  updateProjectData,
} from "./projectUtlis.js";

import { createNewMilestone, updateMilestoneData } from "./milestoneUtils.js";

import { login, logout } from "./login.js";

import { showDate } from "./util.js";

import {
  getMonthAndYear,
  initializeBasicData,
  getConsultantLeaveTypes,
} from "./timesheetUtils.js";

import {
  initilizeTimesheetApprovalPageData,
  getMonthAndYearForTimesheetApprovalPage,
} from "./timesheetApprovalUtils.js";

import {
  fetchTimesheetSummary,
  printTimesheetSummaryTable,
} from "./timesheetSummaryUtils.js";

import {
  printTimesheetReportTable,
  runReportFunctions,
  getMilestoneList,
} from "./timesheetReportUtils.js";

import {
  updateBasicDataForSelectedConsultant,
  getMonthAndYearForTimesheetProcessPage,
} from "./timesheetProcessUtils.js";

import { userEditFormUpdate, userCreateFormSubmit } from "./userUtils.js";
import { updatePassword } from "./profileUtils.js";
import {
  showSidebarComponents,
  getUserRole,
  getUserName,
} from "./userPermissions.js";

/**
 * ============================================================================
 * AUTHENTICATION (LOGIN + LOGOUT)
 * ============================================================================
 */
/**
 * Handles login & logout functionality.
 */

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const logoutBtn = document.getElementById("logout");

  // Handle login
  if (loginForm) login();

  // Handle logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
});

/**
 * ============================================================================
 * SIDEBAR NAVIGATION + TABLE FILTERING, SORT & SEARCH (OVERVIEW PAGE)
 * ============================================================================
 */
/**
 * Handles the toggling of sidebar sections for consultants, projects, and milestones.
 * Handles the toggling of Active Inactive Status for consultants, projects, and milestones (OVERVIEW PAGE).
 * Handles the sorting for consultants, projects, and milestones (OVERVIEW PAGE).
 * Handles the searching for consultants, projects, and milestones (OVERVIEW PAGE).
 */

document.addEventListener("DOMContentLoaded", () => {
  /**
   * Sidebar navigation - Toggle Section
   * Handles the toggling of sidebar sections for consultants, projects, and milestones.
   */

  const consultant = document.getElementById("consultant");
  const project = document.getElementById("project");
  const milestone = document.getElementById("milestone");
  const timesheet = document.getElementById("timesheet");
  const user = document.getElementById("user");
  const profile = document.getElementById("profile");

  const consultantContainer = document.getElementById("consultantContainer");
  const projectContainer = document.getElementById("projectContainer");
  const milestoneContainer = document.getElementById("milestoneContainer");
  const timesheetContainer = document.getElementById("timesheetContainer");
  const userContainer = document.getElementById("userContainer");
  const profileContainer = document.getElementById("profileContainer");

  const consultantUpArrow = document.getElementById("consultantUpArrow");
  const consultantDownArrow = document.getElementById("consultantDownArrow");

  const projectUpArrow = document.getElementById("projectUpArrow");
  const projectDownArrow = document.getElementById("projectDownArrow");

  const milestoneUpArrow = document.getElementById("milestoneUpArrow");
  const milestoneDownArrow = document.getElementById("milestoneDownArrow");

  const timesheetUpArrow = document.getElementById("timesheetUpArrow");
  const timesheetDownArrow = document.getElementById("timesheetDownArrow");

  const userUpArrow = document.getElementById("userUpArrow");
  const userDownArrow = document.getElementById("userDownArrow");

  const profileUpArrow = document.getElementById("profileUpArrow");
  const profileDownArrow = document.getElementById("profileDownArrow");

  // Add click event listeners to toggle sections
  if (consultant) {
    consultant.addEventListener("click", () => {
      toggleSection(
        consultantContainer,
        consultantUpArrow,
        consultantDownArrow
      );
    });
  }

  if (project) {
    project.addEventListener("click", () => {
      toggleSection(projectContainer, projectUpArrow, projectDownArrow);
    });
  }

  if (milestone) {
    milestone.addEventListener("click", () => {
      toggleSection(milestoneContainer, milestoneUpArrow, milestoneDownArrow);
    });
  }

  if (timesheet) {
    timesheet.addEventListener("click", () => {
      toggleSection(timesheetContainer, timesheetUpArrow, timesheetDownArrow);
    });
  }

  if (user) {
    user.addEventListener("click", () => {
      toggleSection(userContainer, userUpArrow, userDownArrow);
    });
  }

  if (profile) {
    profile.addEventListener("click", () => {
      toggleSection(profileContainer, profileUpArrow, profileDownArrow);
    });
  }

  /**
   * Initialize toggling of Active Inactive for consultants, projects, and milestones
   */

  initFilter(
    "toggleActiveConsultants",
    "toggleInactiveConsultants",
    "showAllConsultants",
    "consultantTableBody",
    5
  );
  initFilter(
    "toggleActiveProjects",
    "toggleInactiveProjects",
    "showAllProjects",
    "projectTableBody",
    5
  );
  initFilter(
    "toggleActiveMilestones",
    "toggleInactiveMilestones",
    "showAllMilestones",
    "milestoneTableBody",
    5
  );

  initFilter(
    "toggleActiveUsers",
    "toggleInactiveUsers",
    "showAllUsers",
    "userTableBody",
    5
  );

  /**
   * Initialize sorting for each table
   */
  initSorting("consultantTable");
  initSorting("projectTable");
  initSorting("milestoneTable");
  initSorting("userTable");

  /**
  //  * Initialize search for consultants, projects, and milestones
  //  */
  initSearch("searchInputConsultants", "consultantTableBody");
  initSearch("searchInputProjects", "projectTableBody");
  initSearch("searchInputMilestones", "milestoneTableBody");
  initSearch("searchInputUsers", "userTableBody");
});

/**
 * ============================================================================
 * DASHBAORD
 * ============================================================================
 */

/**
 * Handles showing the date.
 */
document.addEventListener("DOMContentLoaded", function () {
  const dashboard = document.getElementById("dashbaord");
  if (dashboard) showDate();
});

/**
 * ============================================================================
 * CONSULTANT CREATE FORM
 * ============================================================================
 */

/**
 * Event listener to handle consultant create form submission.
 * Sends form data to the server using fetch API.
 */
document.addEventListener("DOMContentLoaded", function () {
  const consultantForm = document.getElementById("consultantForm");
  if (consultantForm) consultantCreateFromSubmit();
});

/**
 * ============================================================================
 * CONSULTANT EDIT FORM
 * ============================================================================
 */

/**
 * Load data for Edit consultant form
 */

document.addEventListener("DOMContentLoaded", function () {
  const consultantUpdate = document.getElementById("updateConsultant"); // to make sure this runs only in edit form
  if (consultantUpdate) loadConsultantDataForEditForm();
});

/**
 * Function to send PATCH request with updated Consultant data
 */
document.addEventListener("DOMContentLoaded", function () {
  const consultantUpdate = document.getElementById("updateConsultant");
  const consultantForm = document.getElementById("consultantForm");
  if (consultantForm && consultantUpdate) consultantEditFormUpdate();
});

/**
 * ============================================================================
 * PROJECT VIEW - SHOW CONSULTANT NAMES FOR EACH MILESTONES
 * ============================================================================
 */

/**
 * Event listener to handle show consultants for each milestones in the project.
 */
document.addEventListener("DOMContentLoaded", function () {
  showConsultantsForProjects();
});

/**
 * ============================================================================
 * PROJECT CREATE FORM
 * ============================================================================
 */

/**
 * Event listener to handle Create Project form submission.
 * Sends form data to the server using fetch API.
 */
document.addEventListener("DOMContentLoaded", function () {
  const projectForm = document.getElementById("projectForm");
  const createProject = document.getElementById("createProject");
  if (projectForm && createProject) createNewProject();
});

/**
 * ============================================================================
 * PROJECT EDIT FORM
 * ============================================================================
 */

/**
 * Load data for Edit project form
 */
document.addEventListener("DOMContentLoaded", function () {
  const projectUpdate = document.getElementById("updateProject"); // Ensure this only runs on the edit form
  if (projectUpdate) loadProjectData();
});

/**
 * Function to send PATCH request with updated Project data
 */
document.addEventListener("DOMContentLoaded", function () {
  const projectUpdate = document.getElementById("updateProject");
  const projectForm = document.getElementById("projectForm");
  if (projectForm && projectUpdate) updateProjectData();
});

/**
 * ============================================================================
 * MILESTONE CREATE FORM
 * ============================================================================
 */

/**
 * Function to submit New Milestone Create Data Form.
 * Sends form data to the server using fetch API.
 */
document.addEventListener("DOMContentLoaded", function () {
  const milestoneForm = document.getElementById("milestoneForm");
  const createMilestone = document.getElementById("createMilestone");
  if (milestoneForm && createMilestone) createNewMilestone();
});

/**
 * ============================================================================
 * MILESTONE EDIT FORM
 * ============================================================================
 */

/**
 * Function to send PATCH request with updated Milestone data
 */
document.addEventListener("DOMContentLoaded", function () {
  const milestoneForm = document.getElementById("milestoneForm");
  const updateMilestone = document.getElementById("updateMilestone");
  if (milestoneForm && updateMilestone) updateMilestoneData();
});

/**
 * ============================================================================
 * TIMESHEET
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", function () {
  const timesheetModule = document.getElementById("timesheet-module");
  const timesheetApprovalModule = document.getElementById(
    "timesheetApprovalView-module"
  );
  const timesheetProcessModule = document.getElementById(
    "timesheetProcessView-module"
  );

  if (timesheetModule || timesheetApprovalModule) {
    const monthPicker = document.getElementById("month");
    const yearPicker = document.getElementById("year");
    const viewCalendarBtn = document.getElementById("viewCalendarBtn");
    const yearSelect = document.getElementById("year");

    initializeBasicData();

    if (viewCalendarBtn) {
      viewCalendarBtn.addEventListener("click", () =>
        getMonthAndYear(monthPicker, yearPicker)
      );
    }

    // Set Year dropdown automatically

    if (!yearSelect) return; // Prevent errors if the element is missing

    const currentYear = new Date().getFullYear();
    const endYear = currentYear; // Show options for 3 years ahead
    // const endYear = currentYear + 3; // Show options for 3 years ahead

    // Clear existing options (optional)
    yearSelect.innerHTML = "";

    for (let year = currentYear - 5; year <= endYear; year++) {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;

      if (year === currentYear) {
        option.selected = true; // Set the current year as default
      }

      yearSelect.appendChild(option);
    }

    getConsultantLeaveTypes();
  }
});

/**
 * ============================================================================
 * TIMESHEET APPROVAL VIEW
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", function () {
  const timesheetApprovalModule = document.getElementById(
    "timesheetApprovalView-module"
  );

  if (timesheetApprovalModule) {
    // Set Year dropdown automatically
    const yearSelect = document.getElementById("year");
    if (!yearSelect) return; // Prevent errors if the element is missing

    const currentYear = new Date().getFullYear();
    const endYear = currentYear; // Show options for 3 years ahead
    // const endYear = currentYear + 3; // Show options for 3 years ahead

    // Clear existing options (optional)
    yearSelect.innerHTML = "";

    for (let year = currentYear - 5; year <= endYear; year++) {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;

      if (year === currentYear) {
        option.selected = true; // Set the current year as default
      }

      yearSelect.appendChild(option);
    }

    initilizeTimesheetApprovalPageData();

    if (viewCalendarBtn) {
      const monthPicker = document.getElementById("month");
      const yearPicker = document.getElementById("year");
      viewCalendarBtn.addEventListener("click", () =>
        getMonthAndYearForTimesheetApprovalPage(monthPicker, yearPicker)
      );
    }
  }
});

/**
 * ============================================================================
 * TIMESHEET SUMMARY VIEW
 * ============================================================================
 */
document.addEventListener("DOMContentLoaded", function () {
  const timesheetSummaryModule = document.getElementById(
    "timesheetSummaryView-module"
  );

  if (timesheetSummaryModule) {
    // Set Year dropdown automatically
    const yearSelect = document.getElementById("year");
    if (!yearSelect) return; // Prevent errors if the element is missing

    const currentYear = new Date().getFullYear();
    const endYear = currentYear; // Show options for 3 years ahead
    // const endYear = currentYear + 3; // Show options for 3 years ahead

    // Clear existing options (optional)
    yearSelect.innerHTML = "";

    for (let year = currentYear - 5; year <= endYear; year++) {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;

      if (year === currentYear) {
        option.selected = true; // Set the current year as default
      }

      yearSelect.appendChild(option);
    }

    // Attach event listener for year and month dropdowns
    document
      .getElementById("year")
      .addEventListener("change", fetchTimesheetSummary);
    document
      .getElementById("month")
      .addEventListener("change", fetchTimesheetSummary);
    document
      .getElementById("printTableBtn")
      .addEventListener("click", function () {
        printTimesheetSummaryTable();
      });
  }
});

/**
 * ============================================================================
 * TIMESHEET PROCESS VIEW
 * ============================================================================
 */
document.addEventListener("DOMContentLoaded", function () {
  const timesheetProcessModule = document.getElementById(
    "timesheetProcessView-module"
  );

  if (timesheetProcessModule) {
    // Set Year dropdown automatically
    const yearSelect = document.getElementById("year");
    if (!yearSelect) return; // Prevent errors if the element is missing

    const currentYear = new Date().getFullYear();
    const endYear = currentYear; // Show options for 3 years ahead
    // const endYear = currentYear + 3; // Show options for 3 years ahead

    // Clear existing options (optional)
    yearSelect.innerHTML = "";

    for (let year = currentYear - 5; year <= endYear; year++) {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;

      if (year === currentYear) {
        option.selected = true; // Set the current year as default
      }

      yearSelect.appendChild(option);
    }

    const consultantSelect = document.getElementById(
      "timesheet-Process-consultant"
    );
    if (consultantSelect) {
      consultantSelect.addEventListener("change", async () => {
        await updateBasicDataForSelectedConsultant(); // Fetch consultant data on selection
      });
    }

    if (viewCalendarBtn) {
      const monthPicker = document.getElementById("month");
      const yearPicker = document.getElementById("year");
      viewCalendarBtn.addEventListener("click", () =>
        getMonthAndYearForTimesheetProcessPage(monthPicker, yearPicker)
      );
    }
  }
});

/**
 * ============================================================================
 * TIMESHEET REPORT VIEW
 * ============================================================================
 */
document.addEventListener("DOMContentLoaded", function () {
  const timesheetReportModule = document.getElementById(
    "timesheetReportView-module"
  );

  if (timesheetReportModule) {
    const reportDropdown = document.getElementById("reportType");
    const milestoneDropdown = document.getElementById("milestoneList");

    // Set Year dropdown automatically
    const fromYearSelect = document.getElementById("fromYear");
    const toYearSelect = document.getElementById("toYear");
    if (!fromYearSelect || !toYearSelect) return;

    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 5;
    const endYear = currentYear;

    fromYearSelect.innerHTML = "";
    toYearSelect.innerHTML = "";

    for (let year = startYear; year <= endYear; year++) {
      const fromOption = document.createElement("option");
      fromOption.value = year;
      fromOption.textContent = year;
      if (year === currentYear) fromOption.selected = true;

      const toOption = document.createElement("option");
      toOption.value = year;
      toOption.textContent = year;
      if (year === currentYear) toOption.selected = true;

      fromYearSelect.appendChild(fromOption);
      toYearSelect.appendChild(toOption);
    }

    reportDropdown.addEventListener("change", () => {
      const selectedReport = reportDropdown.value;

      if (selectedReport === "milestoneHours") {
        getMilestoneList();
        milestoneDropdown.classList.remove("hidden");
      } else {
        milestoneDropdown.classList.add("hidden");
      }
    });
    document
      .getElementById("viewReportBtn")
      .addEventListener("click", runReportFunctions);
    document
      .getElementById("printReportTableBtn")
      .addEventListener("click", async function () {
        await printTimesheetReportTable(); // Just print what's already there
      });
  }
});

/**
 * ============================================================================
 * USER
 * ============================================================================
 */

/**
 * Create a User
 */
document.addEventListener("DOMContentLoaded", function () {
  const userCreateForm = document.getElementById("userCreateForm"); // Ensure this matches your form ID

  if (userCreateForm) {
    userCreateForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      userCreateFormSubmit();
    });
  }
});

/**
 * Update User data
 */
document.addEventListener("DOMContentLoaded", function () {
  const userForm = document.getElementById("UserForm");

  if (userForm) {
    userForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await userEditFormUpdate();
    });
  }
});

/**
 * ============================================================================
 * MY PROFILE
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", function () {
  const passwordChangeForm = document.getElementById("passwordChangeForm");

  if (passwordChangeForm) {
    passwordChangeForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Prevent page reload
      await updatePassword(passwordChangeForm); // Pass form element to function
    });
  }
});

/**
 * ============================================================================
 * USER PERMISSION
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", async function () {
  const userRoleState = await getUserRole();

  if (userRoleState === "leader") {
    showSidebarComponents("timesheet-approve");
  }

  if (userRoleState === "admin" || userRoleState === "super admin") {
    showSidebarComponents(
      "consultants",
      "consultant-create",
      "projects",
      "project-create",
      "timesheet-approve",
      "timesheet-operations",
      "timesheet-report",
      "user"
    );
  }
});

/**
 * ============================================================================
 * DASHBAORD
 * ============================================================================
 */

/**
 * Function to make sentence case
 */

const toSentenceCase = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Updating Dashboard
 */

document.addEventListener("DOMContentLoaded", async function () {
  const dashboard = document.getElementById("dashboard");

  if (dashboard) {
    const userNameState = await getUserName();
    const userRoleState = await getUserRole();

    const welcomeTag = document.getElementById("welcome-tag");
    const tagline = document.getElementById("tagline");

    welcomeTag.innerText = `Welcome to HRIS, ${toSentenceCase(userNameState)}!`;

    if (userRoleState === "leader") {
      tagline.innerText = `Here, you can manage your own timesheets and approve your team’s timesheets.`;
    }

    if (userRoleState === "admin" || userRoleState === "super admin") {
      tagline.innerText = `Here, you can manage all your consultants, projects, deliverables, timesheets and more.`;
    }

    if (userRoleState === "user") {
      tagline.innerText = `Here, you can manage your own timesheets.`;
    }
  }
});
