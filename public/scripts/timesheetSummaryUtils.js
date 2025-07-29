/**
 * ============================================================================
 * File: timesheetSummaryUtils.js
 * Description: JavaScript for handling timesheet summary (operation process) functions.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

import { populateDropdown } from "./formUtils.js";

/**
 * Function to Fetch Current user
 */

export const fetchCurrentUser = async () => {
  try {
    const response = await fetch("/api/v1/users/me");
    const data = await response.json();
    return data.data.data.name;
  } catch (err) {
    console.error("Failed to fetch current user:", err);
    return null;
  }
};

/**
 * Function to Initialize the Process View
 */

export const initializeProcessView = async () => {
  // Get all consultants and assigned to the dropdown
  populateDropdown(
    "/api/v1/consultants",
    "consultants",
    "Consultants",
    (item) => ({ value: item._id, text: item.name }),
    "data.consultants", // Path to the data
    null, // No filtering needed
    (a, b) => a.name.localeCompare(b.name) // Sort by name,
  );

  //  Attach event listener for consultant selection
  const consultantSelect = document.getElementById("consultants");
  if (consultantSelect) {
    consultantSelect.addEventListener("change", async () => {
      await getDataForSelectedConsultant(); // Fetch consultant data on selection
    });
  }
};

/**
 * Function to get consultant data for the selected consultant
 */
const getDataForSelectedConsultant = async () => {
  const selectedConsultantId = document.getElementById("consultants").value;

  try {
    const response = await fetch(`/api/v1/consultants/${selectedConsultantId}`);
    const data = await response.json();
    const name = data.data.consultant.name;
    const designation = data.data.consultant.designation;

    const consultantNameContainer = document.getElementById(
      "consultantNameContainer"
    );

    document.getElementById("consultant-name").textContent = name;
    document.getElementById("consultant-designation").textContent = designation;
    consultantNameContainer.classList.remove("hidden");
  } catch (err) {
    console.log(err);
  }
};

/**
 * Fetch timesheet summary based on selected year and month.
 */
export const fetchTimesheetSummary = async () => {
  const year = document.getElementById("year").value;
  const month = parseInt(document.getElementById("month").value) + 1; // Ensure month is a number

  try {
    const response = await fetch(`/api/v1/timesheet/${year}/${month}`);
    const data = await response.json();

    if (response.ok) {
      const processedData = processConsultantData(
        data.data.consultantsTimesheets
      );

      populateTimesheetTable(processedData);
    } else {
      console.error("Error fetching timesheet summary:", data.message);
    }
  } catch (error) {
    console.error("Error fetching timesheet summary:", error);
  }
};

/**
 * Process consultants' timesheet data.
 */
const processConsultantData = (consultants) => {
  return consultants.map((consultant) => {
    let totalWorkedHours = 0;
    let workedDays = new Set();
    let leaveSummary = {}; // Store total leave days per type
    let milestoneSummary = {}; // Store total hours worked per milestone

    consultant.timesheets.forEach((entry) => {
      // Track worked days
      if (entry.totalWorkedHours > 0) {
        workedDays.add(entry.day);
      }

      // Aggregate worked hours per milestone
      if (entry.milestones && Array.isArray(entry.milestones)) {
        entry.milestones.forEach((milestone) => {
          if (!milestoneSummary[milestone.name]) {
            milestoneSummary[milestone.name] = 0;
          }
          milestoneSummary[milestone.name] += milestone.hours;
          totalWorkedHours += milestone.hours;
        });
      }

      // Aggregate leave days per type
      if (entry.leaves && Array.isArray(entry.leaves)) {
        entry.leaves.forEach((leave) => {
          const leaveType = leave.type || "Unknown Leave";
          const leaveValue = leave.period === "Full Day" ? 1 : 0.5;
          leaveSummary[leaveType] = (leaveSummary[leaveType] || 0) + leaveValue;
        });
      }
    });

    return {
      consultantName: consultant.consultantName,
      workedHours: totalWorkedHours,
      workedDays: workedDays.size,
      leaveSummary,
      milestoneSummary,
    };
  });
};

/**
 * Populate the timesheet table dynamically.
 */
const populateTimesheetTable = (consultants) => {
  const tableBody = document.getElementById("timesheetTableBody");
  tableBody.innerHTML = ""; // Clear existing rows

  let maxMilestones = 0;

  consultants.forEach((consultant) => {
    const milestoneCount = Object.keys(
      consultant.milestoneSummary || {}
    ).length;
    if (milestoneCount > maxMilestones) {
      maxMilestones = milestoneCount;
    }
  });

  consultants.forEach((consultant) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td class="border px-4 py-2">${consultant.consultantName}</td>
      <td class="border px-4 py-2">${consultant.workedHours} hrs</td>
      <td class="border px-4 py-2">${(consultant.workedHours / 8).toFixed(2)} days</td>
      ${generateMilestoneColumns(consultant.milestoneSummary)}
      <td class="border px-4 py-2">${generateLeaveSummary(consultant.leaveSummary)}</td>
      
    `;

    tableBody.appendChild(row);
  });
};

/**
 * Generate leave summary as a formatted string.
 */

const getLeaveColor = (type) => {
  switch (type.toLowerCase()) {
    case "annual leave":
      return "bg-secondary-100";
    case "medical leave":
      return "bg-secondary-300";
    case "public holiday":
      return "bg-green-100";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const generateLeaveSummary = (leaveSummary) => {
  if (!leaveSummary || Object.keys(leaveSummary).length === 0) {
    return `<span class="text-gray-400 italic">No Leaves</span>`;
  }

  return Object.entries(leaveSummary)
    .map(
      ([type, days]) =>
        `<div class="mb-2 inline-flex items-center badge ${getLeaveColor(type)} text-xs font-medium p-2 py-1 rounded-lg shadow-lg">
          <span class="mr-1 badge-bold">${type}: </span>
          <span class="font-bold badge-value"> ${days} days</span>
        </div>`
    )
    .join("");
};

/**
 * Generate milestone summary as table columns dynamically.
 */
const generateMilestoneColumns = (milestoneSummary) => {
  if (!milestoneSummary || Object.keys(milestoneSummary).length === 0) {
    return `<td class="border px-4 py-2 text-gray-400 italic">No Deliverables</td>`;
  }

  const columnContent = Object.entries(milestoneSummary)
    .map(
      ([milestone, hours]) =>
        `<div class="mb-2 inline-flex items-center badge  text-xs font-medium px-2 py-1 rounded-lg shadow-md bg-gray-100">
          <span class="mr-1 ">${milestone}:</span>
          <span class="font-bold badge-bold badge-value"> ${hours} hrs</span>
        </div>`
    )
    .join("");

  return `<td class="border px-4 py-2 whitespace-normal break-words max-w-sm">${columnContent}</td>`;
};

/**
 * Generate Print version of the Timesheet Summary Table
 */

export const printTimesheetSummaryTable = async () => {
  const table = document.getElementById("timesheetTable");
  const monthDropdown = document.getElementById("month");
  const yearDropdown = document.getElementById("year");

  // Fetch current logged in user
  const loggedInUser = await fetchCurrentUser();

  if (!table) {
    console.error("Error: Table not found!");
    alert("Table not found! Please generate the timesheet before printing.");
    return;
  }

  // Get the selected option's text (the month name)
  const selectedMonthName =
    monthDropdown.options[monthDropdown.selectedIndex].text;

  // Get the selected option's text (the year name)
  const selectedYearName =
    yearDropdown.options[yearDropdown.selectedIndex].text;

  // Create a new window
  const printWindow = window.open("", "", "width=900,height=700");
  const doc = printWindow.document;

  // Create basic structure
  doc.open();
  // doc.write("<!DOCTYPE html><html><head></head><body></body></html>");
  doc.close();

  // access head and body
  const head = doc.querySelector("head");
  const body = doc.querySelector("body");

  // Create and add title
  const title = doc.createElement("title");
  title.textContent = "Print Timesheet Summary";
  head.appendChild(title);

  // Create and add style
  const style = doc.createElement("style");
  style.textContent = `
  body { font-family: Arial, sans-serif; padding: 20px; }
  table { width: 100%; border-collapse: collapse; padding: 10px;}
  th, td { border: 1px solid #000; padding: 8px; text-align: left; vertical-align: top; padding-left: 12px;}
  th { background-color: #f4f4f4; padding-left: 12px; }

  /* Leave & Milestone badge styles */
  .badge {
    display: inline-flex;
    font-size: 0.75rem;
    font-weight: 500;
    padding: 4px 8px;
    margin: 2px;
  }

  .badge-bold {
    font-weight: 700;
  }



  .bg-secondary-100 {
    background-color: #e0f2fe;
    color: #0369a1;
  }
  
   .bg-secondary-300 {
    background-color: #f3f4f6;
    color: #d0383f;
  }

  .bg-green-100 {
    background-color: #dcfce7;
    color: #166534;
  }

  .bg-gray-100 {
    background-color: #f3f4f6;
    color: #374151;
  }
  
  .badge-value {
  margin-left: 4px;
}

  @media print {
    body { padding: 2px; }
    button { display: none; }
  }
`;
  head.appendChild(style);

  // Add heading
  const heading = doc.createElement("h2");
  heading.textContent = "Timesheet Summary";
  body.appendChild(heading);

  const heading2 = doc.createElement("h4");
  heading2.textContent = `Month: ${selectedMonthName} | Year: ${selectedYearName}`;
  body.appendChild(heading2);

  // Clone the table and add it
  const tableClone = table.cloneNode(true);
  body.appendChild(tableClone);

  // Add a print button as a fallback
  const printButton = doc.createElement("button");
  printButton.textContent = "Print";
  printButton.style.margin = "20px 0";
  printButton.style.padding = "8px 16px";
  printButton.onclick = function () {
    printWindow.print();
  };
  body.appendChild(printButton);

  // Add a footer
  const footer = doc.createElement("footer");
  footer.style.marginTop = "40px"; // This adds space above the footer
  footer.style.paddingTop = "20px";
  footer.style.borderTop = "1px solid #ccc"; // Optional: adds a line above the footer
  footer.style.textAlign = "center";
  footer.style.fontSize = "12px";
  footer.style.color = "#666";

  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Add your footer text
  footer.textContent = `© ${selectedYearName} HRIS - Buddhika Thanura Jayasingha. | Designed & Develpoed by @cyberBuddhika. This timesheet summary was automatically generated by ${loggedInUser} on ${currentDate}.`;

  // Add the footer to the document
  body.appendChild(footer);

  // Make sure the footer appears at the bottom when printing
  const printStyles = doc.createElement("style");
  printStyles.textContent = `
  @media print {
    footer {
      position: fixed;
      bottom: 20px;
      left: 0;
      right: 0;
      text-align: center;
    }
  }
`;
  head.appendChild(printStyles);

  printWindow.print();

  printWindow.close();
};
