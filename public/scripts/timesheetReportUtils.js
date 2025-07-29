/**
 * ============================================================================
 * File: timesheetReportUtils.js
 * Description: JavaScript for handling timesheet reports (operation process) functions.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */
import { doc } from "prettier";
import { fetchCurrentUser } from "./timesheetSummaryUtils.js";
import { populateDropdown } from "./formUtils.js";

let reportName;

/**
 * Function to Fetch Milestone Summary
 */

export const fetchMilestoneSummary = async () => {
  const year = document.getElementById("year").value;
  const month = parseInt(document.getElementById("month").value) + 1;

  try {
    const response = await fetch(
      `/api/v1/timesheet/milestones/${year}/${month}`
    );
    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to fetch milestone summary:", data.message);
      return;
    }

    const { milestoneSummary } = data.data;
    const consultantsSet = new Set();

    Object.values(milestoneSummary).forEach((milestone) => {
      Object.keys(milestone.consultants).forEach((consultant) =>
        consultantsSet.add(consultant)
      );
    });

    const consultantHeaders = Array.from(consultantsSet).sort();
    populateMilestoneSummaryTable(milestoneSummary, consultantHeaders);
  } catch (error) {
    console.error("Error fetching milestone summary:", error);
  }
};

/**
 * Function to Populate Milestone Summary Table
 */

const populateMilestoneSummaryTable = (milestones) => {
  const tableBody = document.getElementById("milestoneSummaryTableBody");
  const tableHead = document.getElementById("milestoneSummaryTableHead");

  tableHead.innerHTML = `
    <tr>
      <th class="border px-4 py-2 w-[250px]">Deliverable</th>
      <th class="border px-4 py-2 w-[250px]">Consultant</th>
      <th class="border px-4 py-2 w-[100px]">Hours Worked</th>
      
    </tr>
  `;

  tableBody.innerHTML = "";

  Object.entries(milestones).forEach(([milestoneName, data]) => {
    const consultantEntries = Object.entries(data.consultants);

    consultantEntries.forEach(([consultant, hours], index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td class="border px-4 py-2 ${index === 0 ? "font-semibold" : ""}">
          ${index === 0 ? milestoneName : ""}
        </td>
        <td class="border px-4 py-2">${consultant}</td>
        <td class="border px-4 py-2">${hours} hrs</td>
        
      `;

      tableBody.appendChild(row);
    });

    // Add Total row for the milestone
    const totalRow = document.createElement("tr");
    totalRow.innerHTML = `
      <td class="border px-4 py-2"></td>
      <td class="border px-4 py-2 font-bold text-right">Total</td>
      <td class="border px-4 py-2 font-bold">${data.totalHours} hrs</td>
    `;
    tableBody.appendChild(totalRow);
  });
};

/**
 * Function to Print Milestone Summary Table
 */

export const printMilestoneSummaryTable = () => {
  const table = document.getElementById("milestoneSummaryTable");
  if (!table) {
    alert("Milestone table not found. Please generate the report first.");
    return;
  }

  const printWindow = window.open("", "", "width=900,height=700");
  const doc = printWindow.document;

  doc.open();
  doc.write(
    "<!DOCTYPE html><html><head><title>Print Milestone Summary</title></head><body></body></html>"
  );
  doc.close();

  const head = doc.head;
  const body = doc.body;

  // Style
  const style = document.createElement("style");
  style.textContent = `
    body { font-family: Arial, sans-serif; padding: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
    th { background-color: #f4f4f4; }
    h2, h4 { margin-bottom: 12px; }

    @media print {
      button { display: none; }
      footer { position: fixed; bottom: 20px; width: 100%; text-align: center; font-size: 10px; }
    }
  `;
  head.appendChild(style);

  // Heading
  const heading = document.createElement("h2");
  heading.textContent = "Milestone Summary Report";
  body.appendChild(heading);

  const today = new Date();
  const dateInfo = document.createElement("h4");
  dateInfo.textContent = `Generated on: ${today.toLocaleDateString()}`;
  body.appendChild(dateInfo);

  // Clone table
  const clonedTable = table.cloneNode(true);
  body.appendChild(clonedTable);

  // Print Button (fallback)
  const printBtn = document.createElement("button");
  printBtn.textContent = "Print Report";
  printBtn.style.margin = "20px 0";
  printBtn.onclick = () => printWindow.print();
  body.appendChild(printBtn);

  // Footer
  const footer = document.createElement("footer");
  footer.textContent = `© ${today.getFullYear()} HRIS - FUTUREFISH.ORG | Built by @cyberBuddhika`;
  body.appendChild(footer);

  // Trigger print
  printWindow.print();
};

/**
 * Function to Fetch Consultant Worked Hours for the Selected Milestone for a Given Period
 */

export const fetchMilestoneHoursReport = async () => {
  const milestoneId = document.getElementById("milestoneList").value;
  const fromYear = document.getElementById("fromYear").value;
  const fromMonth = parseInt(document.getElementById("fromMonth").value) + 1;
  const toYear = document.getElementById("toYear").value;
  const toMonth = parseInt(document.getElementById("toMonth").value) + 1;

  try {
    const response = await fetch(
      `/api/v1/timesheet/${milestoneId}/${fromYear}/${fromMonth}/${toYear}/${toMonth}`
    );
    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to fetch milestone hours report:", data.message);
      return;
    }

    const { deliverable, consultants, totalHours } = data.data;

    buildMilestoneReportTable(
      deliverable,
      fromYear,
      fromMonth,
      toYear,
      toMonth,
      consultants,
      totalHours
    );

    // show Print report button
    const printReportButton = document.getElementById("printReportTableBtn");
    printReportButton.classList.remove("hidden");
  } catch (error) {
    console.error("Error fetching milestone hours report:", error);
  }
};

/**
 * Function to run report functions
 */
export const runReportFunctions = async () => {
  const selectedDropdownReport = document.getElementById("reportType").value;

  if (selectedDropdownReport === "milestoneHours") {
    fetchMilestoneHoursReport();
  } else if (selectedDropdownReport === "allMilestones") {
    fetchAllMilestoneReport();
  }
};

/**
 * Function to Fetch Consultant Worked Hours for the Selected Milestone for a Given Period
 */

export const fetchAllMilestoneReport = async () => {
  const fromYear = document.getElementById("fromYear").value;
  const fromMonth = parseInt(document.getElementById("fromMonth").value) + 1;
  const toYear = document.getElementById("toYear").value;
  const toMonth = parseInt(document.getElementById("toMonth").value) + 1;

  try {
    const response = await fetch(
      `/api/v1/timesheet/milestones/${fromYear}/${fromMonth}/${toYear}/${toMonth}`
    );
    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to fetch milestone hours report:", data.message);
      return;
    }

    const { from, to, deliverables } = data.data;

    if (!Array.isArray(deliverables)) {
      console.warn("No deliverables found for this period.");
      return;
    }

    // Clear table first
    const thead = document.getElementById("milestone-report-table-head");
    const tbody = document.getElementById("milestone-report-table-body");
    thead.innerHTML = "";
    tbody.innerHTML = "";

    // Loop over each deliverable and build a report section
    for (const deliverableData of deliverables) {
      const { deliverable, consultants, totalHours } = deliverableData;

      buildMultiDeliverableReportTable(
        from.year,
        from.month,
        to.year,
        to.month,
        deliverables
      );
    }

    // Show print button
    const printReportButton = document.getElementById("printReportTableBtn");
    printReportButton.classList.remove("hidden");
  } catch (error) {
    console.error("Error fetching milestones report:", error);
  }
};

/**
 * Function to Build Milestone Report Table
 */

export const buildMilestoneReportTable = (
  deliverable,
  fromYear,
  fromMonth,
  toYear,
  toMonth,
  consultants,
  totalHours
) => {
  // Target thead and tbody separately
  const thead = document.getElementById("milestone-report-table-head");
  const tbody = document.getElementById("milestone-report-table-body");

  // Set header
  thead.innerHTML = `
    <tr>
      <th colspan="4" class="text-left py-2 px-4 font-bold">
         ${deliverable} 
      </th>
    </tr>
    <tr>
      <th class="border px-4 py-2">Consultant</th>
      <th class="border px-4 py-2">Role</th>
      <th class="border px-4 py-2">Hours</th>
      <th class="border px-4 py-2 w-[100px]">Days</th>
    </tr>
  `;

  // Set body
  let totalDays = 0;

  const bodyRows = consultants
    .map((c) => {
      const days = +(c.hours / 8).toFixed(2); // Rounded to 2 decimals
      totalDays += days;

      return `
        <tr>
          <td class="border px-4 py-2">${c.name}</td>
          <td class="border px-4 py-2">${c.role}</td>
          <td class="border px-4 py-2">${c.hours}</td>
          <td class="border px-4 py-2">${days} days</td>
        </tr>
      `;
    })
    .join("");

  const totalRow = `
    <tr>
      <td class="border px-4 py-2 font-bold">Total</td>
      <td class="border px-4 py-2"></td>
      <td class="border px-4 py-2 font-bold">${totalHours}</td>
      <td class="border px-4 py-2 font-bold">${totalDays.toFixed(2)} days</td>
    </tr>
  `;

  tbody.innerHTML = bodyRows + totalRow;

  reportName = `Deliverable monthly report - ${deliverable}`;
};

/**
 * Function to Build Report 2, All Milestones report
 */
export const buildMultiDeliverableReportTable = (
  fromYear,
  fromMonth,
  toYear,
  toMonth,
  deliverables
) => {
  const thead = document.getElementById("milestone-report-table-head");
  const tbody = document.getElementById("milestone-report-table-body");

  // Clear existing content
  thead.innerHTML = "";
  tbody.innerHTML = "";

  // Table header
  thead.innerHTML = `
    <tr>
      <th colspan="4" class="text-left py-2 px-4 font-bold">
        Deliverables Report (${fromMonth}/${fromYear} to ${toMonth}/${toYear})
      </th>
    </tr>
    <tr>
      <th class="border px-4 py-2">Consultant</th>
      <th class="border px-4 py-2">Role</th>
      <th class="border px-4 py-2">Hours</th>
      <th class="border px-4 py-2">Days</th>
    </tr>
  `;

  // Add data rows for each deliverable
  deliverables.forEach(({ deliverable, consultants, totalHours }) => {
    // Deliverable title row
    const titleRow = `
      <tr>
        <td colspan="4" class="border px-4 py-2 font-semibold bg-gray-100">
          Deliverable: ${deliverable}
        </td>
      </tr>
    `;

    const consultantRows = consultants
      .map((c) => {
        const hours = parseFloat(c.hours || 0);
        const days = (hours / 8).toFixed(2);
        return `
          <tr>
            <td class="border px-4 py-2">${c.name}</td>
            <td class="border px-4 py-2">${c.role}</td>
            <td class="border px-4 py-2">${hours.toFixed(2)}</td>
            <td class="border px-4 py-2">${days}</td>
          </tr>
        `;
      })
      .join("");

    const totalRow = `
      <tr>
        <td class="border px-4 py-2 font-bold">Total</td>
        <td class="border px-4 py-2"></td>
        <td class="border px-4 py-2 font-bold">${totalHours.toFixed(2)}</td>
        <td class="border px-4 py-2 font-bold">${(totalHours / 8).toFixed(2)}</td>
      </tr>
    `;

    tbody.innerHTML += titleRow + consultantRows + totalRow;
  });

  // Update report name
  reportName = `Deliverable Period Summary (${fromMonth}/${fromYear} to ${toMonth}/${toYear})`;
};

/**
 * Generate Print version of the Timesheet Report Table
 */

export const printTimesheetReportTable = async () => {
  const table = document.getElementById("milestone-report-table");
  const fromMonthDropdown = document.getElementById("fromMonth");
  const fromYearDropdown = document.getElementById("fromYear");
  const toMonthDropdown = document.getElementById("toMonth");
  const toYearDropdown = document.getElementById("toYear");

  // Fetch current logged in user
  const loggedInUser = await fetchCurrentUser();

  if (!table) {
    console.error("Error: Table not found!");
    alert("Table not found! Please generate the timesheet before printing.");
    return;
  }

  // Get the selected option's text (the month name)
  const selectedFromMonthName =
    fromMonthDropdown.options[fromMonthDropdown.selectedIndex].text;

  const selectedToMonthName =
    toMonthDropdown.options[toMonthDropdown.selectedIndex].text;

  // Get the selected option's text (the year name)
  const selectedFromYearName =
    fromYearDropdown.options[fromYearDropdown.selectedIndex].text;

  const selectedToYearName =
    toYearDropdown.options[toYearDropdown.selectedIndex].text;

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
  title.textContent = reportName;
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
    body { padding: 2px; margin-bottom: 100px; }
    button { display: none; }
    print-spacer {
      height: 100px;
      margin-top: 50px;
    }
    tfoot td { height: 120px;
    border: none !important;
    background-color: transparent !important; }

  }
`;
  head.appendChild(style);

  // Add heading
  const heading = doc.createElement("h2");
  heading.textContent = reportName;
  body.appendChild(heading);

  const heading2 = doc.createElement("h4");
  heading2.textContent = `From: ${selectedFromMonthName} ${selectedFromYearName} | To: ${selectedToMonthName} ${selectedToYearName}`;
  body.appendChild(heading2);

  // Clone the table and add it
  // const tableClone = table.cloneNode(true);
  // body.appendChild(tableClone);
  body.innerHTML += table.outerHTML;

  // Add a print button as a fallback
  const printButton = doc.createElement("button");
  printButton.textContent = "Print";
  printButton.style.margin = "20px 0";
  printButton.style.padding = "8px 16px";
  printButton.onclick = function () {
    printWindow.print();
  };
  body.appendChild(printButton);

  //Adding a invicible block make space for footer
  const spacer = doc.createElement("div");
  spacer.style.height = "100px"; // or however tall your footer is
  spacer.style.display = "block";

  // Print-only styles
  spacer.className = "print-spacer";
  body.appendChild(spacer);

  // Add a footer
  const footer = doc.createElement("footer");
  footer.style.marginTop = "240px"; // This adds space above the footer
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

  const currentTime = new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const today = new Date();

  const currentYear = today.getFullYear();

  // Add your footer text
  footer.textContent = `© ${currentYear} HRIS - Buddhika Thanura Jayasingha. | Designed & Develpoed by @cyberBuddhika. This timesheet summary was automatically generated by ${loggedInUser} on ${currentDate} at ${currentTime}.`;

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

    .print-spacer {
      height: 100px;
    }
  }
`;
  head.appendChild(printStyles);

  printWindow.print();

  printWindow.close();
};

/**
 * Get the list of milestone to populate the dropdown
 */

export const getMilestoneList = async () => {
  const response = await fetch(`/api/v1/milestones`);
  const data = await response.json();

  const milestones = data.data.data;

  const milestoneDropdown = document.getElementById("milestoneList");

  // Clear any previous options
  milestoneDropdown.innerHTML = "";

  // Add each milestone as an <option>
  milestones.forEach((milestone) => {
    const option = document.createElement("option");
    option.value = milestone._id;
    option.textContent = milestone.name;
    milestoneDropdown.appendChild(option);
  });
};
