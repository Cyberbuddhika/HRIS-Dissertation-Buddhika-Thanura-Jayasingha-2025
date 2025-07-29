/**
 * ============================================================================
 * File: projectUtlis.js
 * Description: JavaScript for handling form data functions.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

import AutoNumeric from "autonumeric";

import {
  populateDropdown,
  validateDates,
  actionAfterSuccessMessage,
  actionAfterErrorMessage,
  populateContractTotalValue,
} from "./formUtils.js";

/**
 * Function to POST new PROJECT
 * Sends form data to the server using fetch API.
 */
export const createNewProject = () => {
  // populate Project Leader
  populateDropdown(
    "/api/v1/consultants",
    "projectLeader",
    "Project Leader",
    (item) => ({ value: item._id, text: item.name }),
    "data.consultants", // Path to the data
    null, // No filtering needed
    (a, b) => a.name.localeCompare(b.name) // Sort by name,
  );
  // Populate contract total value
  populateContractTotalValue(
    "contractTotalValue",
    "contractTotalFees",
    "contractTotalExpenses",
    "contractTotalOverhead"
  );

  projectForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(projectForm);
    const jsonData = Object.fromEntries(formData.entries());

    // Handle Checkbox data for BMGF Finance
    const bmgfProjectFinanceCheckbox =
      document.getElementById("bmgfProjectFinance");
    jsonData.bmgfProjectFinance = bmgfProjectFinanceCheckbox.checked;

    // Remove the contractTotalValue from jsonData
    delete jsonData.contractTotalValue;

    // End date must be greater than Start Date
    const projectStartDate = document.getElementById("projectStartDate");
    const projectDueDate = document.getElementById("projectDueDate");

    // Function to compare dates
    const dateValidation = validateDates(projectStartDate, projectDueDate);

    // Call validateDates and stop submission if validation fails
    if (!dateValidation) {
      return; // Stop form submission
    }

    // Add event listeners to validate the dates when they are changed
    if (projectStartDate && projectDueDate) {
      projectStartDate.addEventListener("change", validateDates);
      projectDueDate.addEventListener("change", validateDates);
    }

    try {
      const response = await fetch("/api/v1/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      const result = await response.json();

      if (response.ok) {
        actionAfterSuccessMessage("Project created successfully!");
        setTimeout(() => {
          window.location.href = "/projects"; // This will redirect after 5 seconds
        }, 1000); // 5000 milliseconds = 5 seconds
      } else {
        actionAfterErrorMessage(result.message);
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  });
};

/**
 * Function to Load data for Project Update Page
 */

export const loadProjectData = () => {
  // Extract the project ID from the URL
  const urlParts = window.location.pathname.split("/");
  const projectId = urlParts[urlParts.length - 2];

  // Fetch the project data
  fetch(`/api/v1/projects/${projectId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        const project = data.data.data;

        // Populate the form fields with the project data
        document.getElementById("name").value = project.name;
        document.getElementById("projectClientName").value =
          project.projectClientName;
        document.getElementById("description").value = project.description;
        document.getElementById("projectStartDate").value = new Date(
          project.projectStartDate
        )
          .toISOString()
          .split("T")[0];
        document.getElementById("projectDueDate").value = new Date(
          project.projectDueDate
        )
          .toISOString()
          .split("T")[0];
        document.getElementById("projectStatus").value = project.projectStatus;
        document.getElementById("contractTotalFees").value =
          project.contractTotalFees || 0;
        document.getElementById("contractTotalExpenses").value =
          project.contractTotalExpenses || 0;
        document.getElementById("contractTotalOverhead").value =
          project.contractTotalOverhead || 0;
        document.getElementById("contractTotalValue").value =
          project.contractTotalValue || 0;

        populateContractTotalValue(
          "contractTotalValue",
          "contractTotalFees",
          "contractTotalExpenses",
          "contractTotalOverhead"
        );

        // Handle Checkbox data for BMGF Finance
        document.getElementById("bmgfProjectFinance").checked =
          project.bmgfProjectFinance;

        const projectLeaderId = project.projectLeader; // Get the project leader ID from the project data

        // Function to populate the Project Leader dropdown and select the correct leader
        const findProjectLeader = async (projectLeaderId) => {
          try {
            const response = await fetch("/api/v1/consultants");
            const data = await response.json();

            // Map consultants to get names and IDs
            const namesAndIds = data.data.consultants.map((consultant) => {
              return {
                name: consultant.name,
                id: consultant._id, // Assuming the ID field is _id
              };
            });

            // Find the project leader by ID
            const projectLeader = namesAndIds.find(
              (data) => data.id === projectLeaderId
            );

            const projectLeaderDropdown =
              document.getElementById("projectLeader");

            // Populate the dropdown with options
            namesAndIds.forEach((consultant) => {
              const option = document.createElement("option");
              option.value = consultant.id;
              option.textContent = consultant.name;
              projectLeaderDropdown.appendChild(option);
            });

            // Set the dropdown value to the project leader's ID
            if (projectLeader) {
              projectLeaderDropdown.value = projectLeaderId;
            } else {
              console.warn("Project Leader not found in the dropdown options.");
            }
          } catch (error) {
            console.error(
              "Error fetching or setting the project leader:",
              error
            );
          }
        };

        // Call the function with the project leader ID
        findProjectLeader(projectLeaderId);
      }
    })
    .catch((error) => {
      console.error("Error fetching project data:", error);
    });
};

/**
 * Function to PATCH updated Project data
 */

export const updateProjectData = () => {
  // populateProjectLeader();
  // populateDropdown(
  //   "/api/v1/consultants",
  //   "projectLeader",
  //   "Project Leader",
  //   (item) => ({ value: item._id, text: item.name }),
  //   "data.consultants", // Path to the data
  //   null, // No filtering needed
  //   (a, b) => a.name.localeCompare(b.name), // Sort by name,
  // );

  projectForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(projectForm);
    const jsonData = Object.fromEntries(formData.entries());

    // Handle Checkbox data for BMGF Finance
    const bmgfProjectFinanceCheckbox =
      document.getElementById("bmgfProjectFinance");
    jsonData.bmgfProjectFinance = bmgfProjectFinanceCheckbox.checked;

    // Unformat AutoNumeric fields before submission
    const contractTotalFees =
      AutoNumeric.getAutoNumericElement("#contractTotalFees").getNumber();
    const contractTotalExpenses = AutoNumeric.getAutoNumericElement(
      "#contractTotalExpenses"
    ).getNumber();
    const contractTotalOverhead = AutoNumeric.getAutoNumericElement(
      "#contractTotalOverhead"
    ).getNumber();

    jsonData.contractTotalFees = contractTotalFees;
    jsonData.contractTotalExpenses = contractTotalExpenses;
    jsonData.contractTotalOverhead = contractTotalOverhead;

    // Remove the contractTotalValue from jsonData
    delete jsonData.contractTotalValue;

    // Ensure projectStatus is captured from the form
    jsonData.projectStatus = document.getElementById("projectStatus").value;

    // End date must be greater than Start Date
    const projectStartDate = document.getElementById("projectStartDate");
    const projectDueDate = document.getElementById("projectDueDate");

    // Function to compare dates
    const dateValidation = validateDates(projectStartDate, projectDueDate);

    // Call validateDates and stop submission if validation fails
    if (!dateValidation) {
      return; // Stop form submission
    }

    // Add event listeners to validate the dates when they are changed
    if (projectStartDate && projectDueDate) {
      projectStartDate.addEventListener("change", validateDates);
      projectDueDate.addEventListener("change", validateDates);
    }

    try {
      // Extract the project ID from the URL
      const urlParts = window.location.pathname.split("/");
      const projectId = urlParts[urlParts.length - 2];

      const response = await fetch(`/api/v1/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      const result = await response.json();

      if (response.ok) {
        actionAfterSuccessMessage("Project updated successfully!");
        setTimeout(() => {
          window.location.href = "/projects"; // This will redirect after 5 seconds
        }, 1000); // 5000 milliseconds = 5 seconds
      } else {
        actionAfterErrorMessage(result.message);
      }
    } catch (error) {
      console.error("Error updating project:", error);
      actionAfterErrorMessage("Error updating project.");
    }
  });
};
