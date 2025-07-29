/**
 * ============================================================================
 * File: milestoneUtils.js
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
 * Function to fetch city names
 */
const getCities = async (country) => {
  try {
    const response = await fetch(
      `https://countriesnow.space/api/v0.1/countries/cities`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ country }),
      }
    );
    const data = await response.json();
    if (data.error) {
      console.error("Error fetching cities:", data.error);
      return [];
    }
    return data.data; // Assuming data.data contains the array of city names
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
};

/**
 * Function to populate city names in the City Dropdown
 */
const populateCityDropdown = async (country) => {
  try {
    const cities = await getCities(country);
    const cityDataList = document.getElementById("cities");

    // Clear any previous options
    cityDataList.innerHTML = "";

    // Add cities to the datalist
    cities.forEach((city) => {
      const option = document.createElement("option");
      option.value = city;
      cityDataList.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching cities:", error);
  }
};

// /**
//  * Function to populate Consultants Fee Categories
//  */

// async function populateFeeCategory(selectElement) {
//   if (!selectElement) {
//     console.error("Fee category select element not found!");
//     return;
//   }

//   try {
//     const response = await fetch("/api/v1/consultant-charge-out-rates");
//     const result = await response.json(); // Parse the JSON from the response
//     const feeCategories = result.data.data; // Access the correct array inside the response

//     // Clear any previous options
//     selectElement.innerHTML = "";

//     // Populate the select element with fetched fee categories
//     feeCategories.forEach((category) => {
//       const option = document.createElement("option");
//       option.value = category.category; // Assuming each category has a 'category' field
//       option.textContent = category.category; // Display the category name in the dropdown
//       selectElement.appendChild(option);
//     });
//   } catch (error) {
//     console.error("Error fetching fee categories:", error);
//   }
// }

/**
 * Function to populate Consultants for milestone
 */
async function populateConsultantSelect() {
  try {
    const response = await fetch("/api/v1/consultants");
    const data = await response.json();
    const consultants = data.data.consultants;

    // Sort consultants by name
    const sortedConsultants = consultants.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    const consultantSelectElements =
      document.querySelectorAll(".consultant-select");

    consultantSelectElements.forEach((selectElement) => {
      const selectedValue = selectElement.value; // Preserve the current selected value

      selectElement.innerHTML = ""; // Clear previous options
      sortedConsultants.forEach((consultant) => {
        const option = document.createElement("option");
        option.value = consultant._id;
        option.textContent = consultant.name;
        selectElement.appendChild(option);
      });

      selectElement.value = selectedValue; // Restore the selected value
    });
  } catch (error) {
    console.error("Error fetching consultants:", error);
  }
}

/**
 * Function to create Consultants for milestone
 */
const createConsultantsForMilestone = () => {
  const consultantContainer = document.getElementById(
    "deliverableConsultantsContainer"
  );
  const addConsultantBtn = document.getElementById("addConsultantBtn");

  let btnClicked = 0;

  if (addConsultantBtn) {
    addConsultantBtn.addEventListener("click", function () {
      btnClicked += 1;
      const removeConsultantBtnId = btnClicked;

      // HTML content for the new consultant row
      const htmlElement = `
        <div id="consultantDataRow${removeConsultantBtnId}" class="grid grid-cols-1 md:grid-cols-12 mb-2 gap-6 items-center">
          <!-- Consultant -->
          <div class="md:col-span-3">
            <div>
              <label for="consultant" class="block text-sm font-medium text-gray-700">Consultant</label>
              <select name="consultant[]" class="consultant-select mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm"></select>  
            </div>
          </div>

          <!-- Remove Button -->
          <div class="md:col-span-1">
            <div>
              <svg id="removeConsultantsIcon${removeConsultantBtnId}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-secondary-500 hover:cursor-pointer">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </div>
        </div>
      `;

      // Insert the new HTML element
      consultantContainer.insertAdjacentHTML("beforeend", htmlElement);

      // Add event listener to the new remove button
      document
        .getElementById(`removeConsultantsIcon${removeConsultantBtnId}`)
        .addEventListener("click", function () {
          document
            .getElementById(`consultantDataRow${removeConsultantBtnId}`)
            .remove();
        });

      // Re-populate the dropdowns if necessary
      populateConsultantSelect();
    });
  }
};

/**
 * Function to POST new Milestone
 * Sends form data to the server using fetch API.
 */
export const createNewMilestone = () => {
  // Function to populate dropdown options for Based Country.
  populateDropdown(
    "https://restcountries.com/v3.1/all?fields=name",
    "milestoneCountry",
    "Country",
    (item) => ({ value: item.name.common, text: item.name.common }),
    null, // No data path needed
    null, // No filtering needed
    (a, b) => a.name.common.localeCompare(b.name.common) // Sort by country name
  );

  // Function to populate dropdown options for City based on selected country.
  document
    .getElementById("milestoneCountry")
    .addEventListener("change", function () {
      const selectedCountry = this.value;
      populateCityDropdown(selectedCountry);
    });

  // Function to populate dropdown options for Projects.
  populateDropdown(
    "/api/v1/projects",
    "projectName",
    "Project",
    (item) => ({ value: item._id, text: item.name }),
    "data.data", // No data path needed
    null, // No filtering needed
    (a, b) => a.name.localeCompare(b.name) // Sort by country name
  );

  // Populate contract total value
  populateContractTotalValue(
    "milestoneTotalValue",
    "milestoneTotalFeeBudget",
    "milestoneTotalExpenseBudget",
    "milestoneTotalOverhead"
  );

  // populate milestone Leader
  populateDropdown(
    "/api/v1/consultants",
    "milestoneLeader",
    "Milestone Leader",
    (item) => ({ value: item._id, text: item.name }),
    "data.consultants", // Path to the data
    null, // No filtering needed
    (a, b) => a.name.localeCompare(b.name) // Sort by name,
  );

  // Populate consultants for the milestone
  createConsultantsForMilestone();

  milestoneForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(milestoneForm);
    const jsonData = Object.fromEntries(formData.entries());

    // Ensure the project ID is captured correctly
    const projectSelectElement = document.getElementById("projectName");
    jsonData.project = projectSelectElement.value;
    const projectID = projectSelectElement.value; // to redirect to this project after creation of the milestone

    // Handle consultants data
    const consultants = [];
    document.querySelectorAll(".consultant-select").forEach((select, index) => {
      const consultant = {
        consultant: select.value,
      };
      consultants.push(consultant);
    });

    jsonData.consultants = consultants;

    // Date validation
    const milestoneStartDate = document.getElementById("milestoneStartDate");
    const milestoneDueDate = document.getElementById("milestoneDueDate");

    // Function to compare dates
    const dateValidation = validateDates(milestoneStartDate, milestoneDueDate);

    // Call validateDates and stop submission if validation fails
    if (!dateValidation) {
      return; // Stop form submission
    }

    // Add event listeners to validate the dates when they are changed
    if (milestoneStartDate && milestoneDueDate) {
      milestoneStartDate.addEventListener("change", validateDates);
      milestoneDueDate.addEventListener("change", validateDates);
    }

    try {
      const response = await fetch("/api/v1/milestones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      const result = await response.json();

      if (response.ok) {
        actionAfterSuccessMessage("Deliverable created successfully!");
        setTimeout(() => {
          window.location.href = `/projects/${projectID}`; // This will redirect after 5 seconds
        }, 1000); // 5000 milliseconds = 5 seconds
      } else {
        actionAfterErrorMessage(result.message);
      }
    } catch (error) {
      console.error("Error Creating Deliverable:", error);
    }
  });
};

/**
 * Function to populate existing consultants for Milestone
 */
async function populateExistingConsultants(existingConsultants) {
  try {
    const response = await fetch("/api/v1/consultants");
    const data = await response.json();
    const consultants = data.data.consultants;

    const consultantContainer = document.getElementById(
      "deliverableConsultantsContainer"
    );
    consultantContainer.innerHTML = ""; // Clear existing consultant rows

    existingConsultants.forEach((existingConsultant, index) => {
      const removeConsultantBtnId = index + 1;

      const htmlElement = `
        <div id="consultantDataRow${removeConsultantBtnId}" class="grid grid-cols-1 md:grid-cols-12 mb-2 gap-6 items-center">
          <!-- Consultant -->
          <div class="md:col-span-3">
            <div>
              <label for="consultant" class="block text-sm font-medium text-gray-700">Consultant</label>
              <select name="consultant[]" class="consultant-select mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm"></select>  
            </div>
          </div>

          <!-- Remove Button -->
          <div class="md:col-span-1">
            <div>
              <svg id="removeConsultantsIcon${removeConsultantBtnId}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-secondary-500 hover:cursor-pointer">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </div>
        </div>
      `;

      consultantContainer.insertAdjacentHTML("beforeend", htmlElement);

      // Populate the dropdowns with consultant data
      const consultantSelect = document.querySelector(
        `#consultantDataRow${removeConsultantBtnId} .consultant-select`
      );
      consultants.forEach((consultant) => {
        const option = document.createElement("option");
        option.value = consultant._id;
        option.textContent = consultant.name;
        consultantSelect.appendChild(option);
      });
      consultantSelect.value = existingConsultant.consultant; // Set the correct consultant

      // Add event listener to remove button
      const removeConsultantBtn = document.getElementById(
        `removeConsultantsIcon${removeConsultantBtnId}`
      );
      removeConsultantBtn.addEventListener("click", function () {
        const elementToRemove = document.getElementById(
          `consultantDataRow${removeConsultantBtnId}`
        );
        elementToRemove.remove();
      });
    });
  } catch (error) {
    console.error("Error fetching consultants:", error);
  }
}

/**
 * Function to PATCH edited milestone
 * Sends form data to the server using fetch API.
 */
export const updateMilestoneData = () => {
  const urlParts = window.location.pathname.split("/");
  const milestoneId = urlParts[urlParts.length - 2]; // Assuming URL format is "/milestones/:id/edit"

  // Fetch existing milestone data
  fetch(`/api/v1/milestones/${milestoneId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        const milestone = data.data.data;

        // Populate the form fields with the existing milestone data
        document.getElementById("name").value = milestone.name;
        document.getElementById("description").value = milestone.description;
        document.getElementById("milestoneNote").value =
          milestone.milestoneNote;
        document.getElementById("milestoneCountry").value =
          milestone.milestoneCountry;
        document.getElementById("milestoneLocation").value =
          milestone.milestoneLocation || "";
        document.getElementById("milestoneStartDate").value = new Date(
          milestone.milestoneStartDate
        )
          .toISOString()
          .split("T")[0];
        document.getElementById("milestoneDueDate").value = new Date(
          milestone.milestoneDueDate
        )
          .toISOString()
          .split("T")[0];
        document.getElementById("milestoneStatus").value =
          milestone.milestoneStatus;
        document.getElementById("milestoneTotalFeeBudget").value =
          milestone.milestoneTotalFeeBudget || 0;
        document.getElementById("milestoneTotalExpenseBudget").value =
          milestone.milestoneTotalExpenseBudget || 0;
        document.getElementById("milestoneTotalOverhead").value =
          milestone.milestoneTotalOverhead || 0;

        // Function to populate dropdown options for Based Country.
        populateDropdown(
          "https://restcountries.com/v3.1/all?fields=name",
          "milestoneCountry",
          "Country",
          (item) => ({ value: item.name.common, text: item.name.common }),
          null, // No data path needed
          null, // No filtering needed
          (a, b) => a.name.common.localeCompare(b.name.common) // Sort by country name
        ).then(() => {
          // Set the previously saved country as the selected value
          document.getElementById("milestoneCountry").value =
            milestone.milestoneCountry;
        });

        // Populate the project dropdown and set the correct project
        populateDropdown(
          "/api/v1/projects",
          "projectName",
          "Project",
          (item) => ({ value: item._id, text: item.name }),
          "data.data", // No data path needed
          null, // No filtering needed
          (a, b) => a.name.localeCompare(b.name) // Sort by country name
        ).then(() => {
          document.getElementById("projectName").value = milestone.project;
        });

        // Function to populate dropdown options for City based on selected country.
        document
          .getElementById("milestoneCountry")
          .addEventListener("change", function () {
            const selectedCountry = this.value;
            populateCityDropdown(selectedCountry);
          });

        // Populate contract total value
        populateContractTotalValue(
          "milestoneTotalValue",
          "milestoneTotalFeeBudget",
          "milestoneTotalExpenseBudget",
          "milestoneTotalOverhead"
        );

        // Populate consultants for the milestone
        createConsultantsForMilestone();

        // Populate existing consultants
        populateExistingConsultants(milestone.consultants);

        const milestoneLeaderId = milestone.milestoneLeader; // Get the project leader ID from the project data

        // Function to populate the Project Leader dropdown and select the correct leader
        const findMilestoneLeader = async (milestoneLeaderId) => {
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
            const milestoneLeader = namesAndIds.find(
              (data) => data.id === milestoneLeaderId
            );

            const milestoneLeaderDropdown =
              document.getElementById("milestoneLeader");

            // Populate the dropdown with options
            namesAndIds.forEach((consultant) => {
              const option = document.createElement("option");
              option.value = consultant.id;
              option.textContent = consultant.name;
              milestoneLeaderDropdown.appendChild(option);
            });

            // Set the dropdown value to the project leader's ID
            if (milestoneLeader) {
              milestoneLeaderDropdown.value = milestoneLeaderId;
            } else {
              console.warn(
                "Milestone Leader not found in the dropdown options."
              );
            }
          } catch (error) {
            console.error(
              "Error fetching or setting the Milestone leader:",
              error
            );
          }
        };

        // Call the function with the project leader ID
        findMilestoneLeader(milestoneLeaderId);
      }
    })
    .catch((error) => {
      console.error("Error fetching milestone data:", error);
    });

  milestoneForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(milestoneForm);
    const jsonData = Object.fromEntries(formData.entries());

    // Handle consultants data
    const consultants = [];
    document.querySelectorAll(".consultant-select").forEach((select) => {
      const consultant = {
        consultant: select.value,
      };
      consultants.push(consultant);
    });

    jsonData.consultants = consultants;

    // Unformat AutoNumeric fields before submission
    const milestoneTotalFeeBudget = AutoNumeric.getAutoNumericElement(
      "#milestoneTotalFeeBudget"
    ).getNumber();
    const milestoneTotalExpenseBudget = AutoNumeric.getAutoNumericElement(
      "#milestoneTotalExpenseBudget"
    ).getNumber();
    const milestoneTotalOverhead = AutoNumeric.getAutoNumericElement(
      "#milestoneTotalOverhead"
    ).getNumber();

    jsonData.milestoneTotalFeeBudget = milestoneTotalFeeBudget;
    jsonData.milestoneTotalExpenseBudget = milestoneTotalExpenseBudget;
    jsonData.milestoneTotalOverhead = milestoneTotalOverhead;

    // Remove the milestoneTotalValue from jsonData
    delete jsonData.milestoneTotalValue;

    // Ensure the location data is passed in the update request
    jsonData.milestoneCountry =
      document.getElementById("milestoneCountry").value;
    jsonData.milestoneLocation =
      document.getElementById("milestoneLocation").value;

    // Date validation
    const milestoneStartDate = document.getElementById("milestoneStartDate");
    const milestoneDueDate = document.getElementById("milestoneDueDate");

    // Function to compare dates
    const dateValidation = validateDates(milestoneStartDate, milestoneDueDate);

    // Call validateDates and stop submission if validation fails
    if (!dateValidation) {
      return; // Stop form submission
    }

    // Add event listeners to validate the dates when they are changed
    if (milestoneStartDate && milestoneDueDate) {
      milestoneStartDate.addEventListener("change", validateDates);
      milestoneDueDate.addEventListener("change", validateDates);
    }

    // Capture the milestone status
    jsonData.milestoneStatus = document.getElementById("milestoneStatus").value;

    try {
      const response = await fetch(`/api/v1/milestones/${milestoneId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      const result = await response.json();

      if (response.ok) {
        actionAfterSuccessMessage("Deliverable updated successfully!");
        setTimeout(() => {
          window.location.href = `/milestones/${milestoneId}`; // This will redirect after 5 seconds
        }, 1000); // 5000 milliseconds = 5 seconds
      } else {
        actionAfterErrorMessage(result.message);
      }
    } catch (error) {
      console.error("Error Updating Deliverable:", error);
    }
  });
};
