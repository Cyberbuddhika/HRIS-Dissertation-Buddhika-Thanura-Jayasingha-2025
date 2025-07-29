/**
 * ============================================================================
 * File: consultantUtils.js
 * Description: JavaScript for handling consultant Create & Update form data functions.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

import AutoNumeric from "autonumeric";

import {
  populateDropdown,
  validateDates,
  actionAfterSuccessMessage,
  actionAfterErrorMessage,
  populateNationalitiesDropdown,
} from "./formUtils.js";

/**
 * Function to populate checkboxes for Contractual Benefits.
 * Fetches data from the API and appends checkboxes to the Contractual Benefits section.
 */
export const populateContractualBenefits = async () => {
  try {
    const response = await fetch("/api/v1/consultant-benifits");
    const data = await response.json();

    if (response.ok) {
      const benefitsContainer = document.getElementById("benefitCheckboxes");
      data.data.data.forEach((benefit) => {
        const div = document.createElement("div");
        div.className = "flex gap-2";

        const label = document.createElement("label");
        label.setAttribute("for", benefit.benefit.toLowerCase());
        label.className = "block text-sm font-medium text-gray-700";
        label.textContent = benefit.benefit;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "contractualBenefits";
        checkbox.value = benefit.benefit; // Use value attribute to set the benefit name
        checkbox.id = benefit.benefit.toLowerCase();
        checkbox.className =
          "mt-1 h-4 w-4 text-secondary-600 border-gray-300 rounded focus:ring-secondary-500";

        div.appendChild(checkbox);
        div.appendChild(label);
        benefitsContainer.appendChild(div);
      });
    } else {
      console.error("Error fetching contractual benefits:", data.message);
    }
  } catch (error) {
    console.error("Error fetching contractual benefits:", error);
  }
};

/**
 * Function to handle working days and hours per month.
 */

export const consultantWorkingHoursAndDates = () => {
  const salaryRateSelect = document.getElementById("salaryRate");
  const noOfWorkingHoursInput = document.getElementById(
    "noOfWorkingHoursPerMonth"
  );
  const noOfWorkingDaysInput = document.getElementById(
    "noOfWorkingDaysPerMonth"
  );

  if (salaryRateSelect && noOfWorkingHoursInput && noOfWorkingDaysInput) {
    salaryRateSelect.addEventListener("change", () => {
      if (salaryRateSelect.value === "Hourly") {
        noOfWorkingHoursInput.disabled = false;
        noOfWorkingHoursInput.value = ""; // Clear value for manual entry
      } else {
        noOfWorkingHoursInput.disabled = true;
        noOfWorkingHoursInput.value = noOfWorkingDaysInput.value * 8; // Automatically calculate
      }
    });

    // Ensure proper state on page load
    if (salaryRateSelect.value !== "Hourly") {
      noOfWorkingHoursInput.disabled = true;
      noOfWorkingHoursInput.value = noOfWorkingDaysInput.value * 8;
    }

    noOfWorkingDaysInput.addEventListener("input", () => {
      if (salaryRateSelect.value !== "Hourly") {
        noOfWorkingHoursInput.value = noOfWorkingDaysInput.value * 8;
      }
    });
  }
};

/**
 * Function to convert contractual benifits check box data in to an Array.
 */
export const handlingContractualBenifits = () => {
  const selectedBenefits = [];
  document
    .querySelectorAll('#benefitCheckboxes input[type="checkbox"]:checked')
    .forEach((checkbox) => {
      selectedBenefits.push(checkbox.value);
    });

  return selectedBenefits;
};

/**
 * Function to Replace consultantCategory ID with the name.
 * @param {string} [dropdownId] - ID of the consultant Category Dropdown
 */
export const replaceConsultantIDWithName = (dropdownId) => {
  const consultantCategorySelect = document.getElementById(dropdownId);
  return consultantCategorySelect.options[
    consultantCategorySelect.selectedIndex
  ].text;
};

/**
 * Function to validate profile image size while upload by user.
 */
const validateImageSize = () => {
  const fileInput = document.getElementById("profileImage");

  if (fileInput.files.length > 0) {
    const fileSize = fileInput.files[0].size / 1024 / 1024; // Size in MB
    const maxFileSize = 2; // 2MB limit

    if (fileSize > maxFileSize) {
      actionAfterErrorMessage(
        "Profile image file size is exceeded the Max file size!"
      );
      e.preventDefault(); // Prevent form submission
      return false;
    }
  }
};

/**
 * Function to POST new consultant.
 */
export const consultantCreateFromSubmit = () => {
  if (consultantForm) {
    // Function to populate dropdown options for Consultant Category.
    populateDropdown(
      "/api/v1/consultant-category",
      "consultantCategory",
      "consultant Category",
      (item) => ({ value: item._id, text: item.category }),
      "data.data", // Path to the data
      null, // No filtering needed
      (a, b) => b.category.localeCompare(a.category) // Sort by category name
    );

    // Function to populate dropdown options for Based Country.
    populateDropdown(
      "https://restcountries.com/v3.1/all?fields=name",
      "basedCountry",
      "Country",
      (item) => ({ value: item.name.common, text: item.name.common }),
      null, // No data path needed
      null, // No filtering needed
      (a, b) => a.name.common.localeCompare(b.name.common) // Sort by country name
    );

    // // Function to populate dropdown options for Nationality.
    // populateDropdown(
    //   "https://restcountries.com/v3.1/all?fields=name",
    //   "nationality",
    //   "nationality",
    //   (item) => ({
    //     value: item.demonyms?.eng?.m || "",
    //     text: item.demonyms?.eng?.m || "",
    //   }),
    //   null, // No data path needed
    //   (item) => !!item.demonyms?.eng, // Filter out countries without demonyms
    //   (a, b) => (a.demonyms.eng.m || "").localeCompare(b.demonyms.eng.m || ""), // Sort by demonym
    // );

    populateNationalitiesDropdown();

    // Function to populate dropdown options for Line Manager.
    populateDropdown(
      "/api/v1/consultants",
      "lineManager",
      "Line Manager",
      (item) => ({ value: item._id, text: item.name }),
      "data.consultants", // Path to the data
      null, // No filtering needed
      (a, b) => a.name.localeCompare(b.name) // Sort by name,
    );

    // Initialize autoNumeric on the salary input field
    const salaryInput = new AutoNumeric("#salary", {
      digitGroupSeparator: ",", // For thousand separator
      decimalCharacter: ".", // Decimal point
      decimalPlaces: 2, // Two decimal places
      unformatOnSubmit: true, // Ensure the number is submitted without formatting
    });

    // Function to populate checkboxes for Contractual Benefits.
    populateContractualBenefits();

    // Logic to handle working days and hours per month
    consultantWorkingHoursAndDates();

    consultantForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData(consultantForm);
      const jsonData = Object.fromEntries(formData.entries());

      // Handle contractual benefits
      const selectedBenefits = handlingContractualBenifits();
      jsonData.contractualBenefits = selectedBenefits;

      // Replace consultantCategory ID with the name
      const consultantCategoryData =
        replaceConsultantIDWithName("consultantCategory");
      jsonData.consultantCategory = consultantCategoryData;

      // Remove contractUrl if it's empty
      if (!jsonData.contractUrl) {
        delete jsonData.contractUrl;
      }

      // // Function to validate size of the uploading profile image
      // if (!validateImageSize()) return;

      // Dates Validation
      const contractStartDate = document.getElementById("contractStartDate");
      const contractEndDate = document.getElementById("contractEndDate");

      // Function to compare dates
      const dateValidation = validateDates(contractStartDate, contractEndDate);

      // Call validateDates and stop submission if validation fails
      if (!dateValidation) {
        return; // Stop form submission
      }

      // Add event listeners to validate the dates when they are changed
      if (contractStartDate && contractEndDate) {
        contractStartDate.addEventListener("change", validateDates);
        contractEndDate.addEventListener("change", validateDates);
      }

      // IR35 compliance

      const ir35Checkbox = document.getElementById("ir35Compliance");
      const ir35Description = document.getElementById("ir35Description");

      // Check if IR35 compliance is checked but description is empty
      if (ir35Checkbox.checked && !ir35Description.value.trim()) {
        // Show a custom error message
        actionAfterErrorMessage(
          "Please provide a description for IR35 compliance."
        );
        // alert("Please provide a description for IR35 compliance.");
        ir35Description.focus();
        return; // Prevent form submission
      } else {
        // Ensure IR35 compliance data is correctly set
        jsonData.ir35Compliance = {
          compliance: ir35Checkbox.checked, // Set true if checked, false if not
          description: ir35Description.value.trim() || null, // Set description or null if empty
        };
      }

      try {
        const response = await fetch("/api/v1/consultants", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(jsonData),
        });

        const result = await response.json();

        if (response.ok) {
          actionAfterSuccessMessage("Consultant created successfully!");
          setTimeout(() => {
            window.location.href = "/consultants"; // This will redirect after 5 seconds
          }, 1000); // 5000 milliseconds = 5 seconds
        } else {
          actionAfterErrorMessage(result.message);
        }
      } catch (error) {
        console.error("Error creating consultant:", error);
      }
    });
  }
};

/**
 * Function to load consultant data to Consultant Edit Form.
 */
export const loadConsultantDataForEditForm = () => {
  // Extract the consultant ID from the URL
  const urlParts = window.location.pathname.split("/");
  const consultantId = urlParts[urlParts.length - 2];

  // Fetch the consultant data
  fetch(`/api/v1/consultants/${consultantId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        const consultant = data.data.consultant;

        // Populate the form fields with the consultant data
        document.getElementById("name").value = consultant.name;
        document.getElementById("designation").value = consultant.designation;
        document.getElementById("companyEmailAddress").value =
          consultant.companyEmailAddress;
        document.getElementById("contractNumber").value =
          consultant.contractNumber;
        document.getElementById("contractUrl").value =
          consultant.contractUrl || "";
        document.getElementById("contractStartDate").value = new Date(
          consultant.contractStartDate
        )
          .toISOString()
          .split("T")[0];
        document.getElementById("contractEndDate").value = new Date(
          consultant.contractEndDate
        )
          .toISOString()
          .split("T")[0];
        document.getElementById("consultantStatus").value =
          consultant.consultantStatus;
        document.getElementById("salaryRate").value = consultant.salaryRate;
        document.getElementById("salary").value = consultant.salary;
        document.getElementById("noOfWorkingDaysPerMonth").value =
          consultant.noOfWorkingDaysPerMonth;
        document.getElementById("noOfWorkingHoursPerMonth").value =
          consultant.noOfWorkingHoursPerMonth;
        document.getElementById("address").value = consultant.address;
        document.getElementById("basedCountry").value = consultant.basedCountry;
        document.getElementById("nationality").value = consultant.nationality;
        document.getElementById("contactNumber").value =
          consultant.contactNumber;
        document.getElementById("emergencyContactNumber").value =
          consultant.emergencyContactNumber;

        // Handle IR35 compliance
        document.getElementById("ir35Compliance").checked =
          consultant.ir35Compliance.compliance;
        document.getElementById("ir35Description").value =
          consultant.ir35Compliance.description || "";

        // Populate Contractual Benefits
        const selectedBenefits = consultant.contractualBenefits;
        const benefitsCheckboxes = document.querySelectorAll(
          '#benefitCheckboxes input[type="checkbox"]'
        );
        benefitsCheckboxes.forEach((checkbox) => {
          if (selectedBenefits.includes(checkbox.value)) {
            checkbox.checked = true;
          }
        });

        // Initialize autoNumeric on the salary input field
        const salaryInput = new AutoNumeric("#salary", {
          digitGroupSeparator: ",", // For thousand separator
          decimalCharacter: ".", // Decimal point
          decimalPlaces: 2, // Two decimal places
          unformatOnSubmit: true, // Ensure the number is submitted without formatting
        });

        // Getting Line Manager Data
        const lineManagerId = consultant.lineManager; // // Get the line manager's ID from the consultant data

        // Function to populate the line manager dropdown and select the correct leader
        const findlineManager = async (lineManagerId) => {
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
            const lineManager = namesAndIds.find(
              (data) => data.id === lineManagerId
            );

            const lineManagerDropdown = document.getElementById("lineManager");

            // Set the dropdown value to the line manager's ID
            if (lineManager) {
              lineManagerDropdown.value = lineManagerId;
            } else {
              console.warn("Line Manager not found in the dropdown options.");
            }
          } catch (error) {
            console.error("Error fetching or setting the Line Manager:", error);
          }
        };

        // Call the function with the line manager's ID
        findlineManager(lineManagerId);
      } else {
        console.error("Error fetching consultant data:", data.message);
      }
    })
    .catch((error) => {
      console.error("Error fetching consultant data:", error);
    });
};

/**
 * Function to PATCH data from Consultant Edit Form.
 */
export const consultantEditFormUpdate = () => {
  // Logic to handle working days and hours per month
  consultantWorkingHoursAndDates();

  // Initialize autoNumeric on the salary input field
  const salaryInput = new AutoNumeric("#salary", {
    digitGroupSeparator: ",", // For thousand separator
    decimalCharacter: ".", // Decimal point
    decimalPlaces: 2, // Two decimal places
    unformatOnSubmit: true, // Ensure the number is submitted without formatting
  });

  consultantForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(consultantForm);
    const jsonData = Object.fromEntries(formData.entries());

    // Handle contractual benefits
    const selectedBenefits = handlingContractualBenifits();
    jsonData.contractualBenefits = selectedBenefits;

    // Replace consultantCategory ID with the name
    const consultantCategoryData =
      replaceConsultantIDWithName("consultantCategory");
    jsonData.consultantCategory = consultantCategoryData;

    // Remove contractUrl if it's empty
    if (!jsonData.contractUrl) {
      delete jsonData.contractUrl;
    }

    // Dates Validation
    const contractStartDate = document.getElementById("contractStartDate");
    const contractEndDate = document.getElementById("contractEndDate");

    // Function to compare dates
    const dateValidation = validateDates(contractStartDate, contractEndDate);

    // Call validateDates and stop submission if validation fails
    if (!dateValidation) {
      return; // Stop form submission
    }

    // Add event listeners to validate the dates when they are changed
    if (contractStartDate && contractEndDate) {
      contractStartDate.addEventListener("change", validateDates);
      contractEndDate.addEventListener("change", validateDates);
    }

    // IR35 compliance
    const ir35Checkbox = document.getElementById("ir35Compliance");
    const ir35Description = document.getElementById("ir35Description");

    // Check if IR35 compliance is checked but description is empty
    if (ir35Checkbox.checked && !ir35Description.value.trim()) {
      // Show a custom error message
      actionAfterErrorMessage(
        "Please provide a description for IR35 compliance."
      );
      ir35Description.focus();
      return; // Prevent form submission
    }

    try {
      // Extract the consultant ID from the URL
      const urlParts = window.location.pathname.split("/");
      const consultantId = urlParts[urlParts.length - 2];

      console.log(jsonData);

      const response = await fetch(`/api/v1/consultants/${consultantId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      if (!response.ok) {
        // Handle errors
        const result = await response.json();
        actionAfterErrorMessage(result.message || "Error updating consultant.");
        return;
      }

      actionAfterSuccessMessage("Consultant updated successfully!");
      setTimeout(() => {
        window.location.href = "/consultants"; // Redirect after 2 seconds
      }, 1000);
    } catch (error) {
      console.error("Error updating consultant:", error);
      actionAfterErrorMessage("Error updating consultant.");
    }
  });
};

/**
 * Function to populate consultant names.
 * Fetches data from the consultant.
 */
const getConsultantsName = async (consultantId) => {
  try {
    const response = await fetch(`/api/v1/consultants/${consultantId}`);
    const data = await response.json();

    return data.data.consultant.name;
  } catch (error) {
    console.error("Error fetching consultant names:", error);
  }
};

/**
 * Function to populate consultant names for project.
 * Populate Consultant names in the project milestone section.
 */
export const showConsultantsForProjects = async () => {
  // Get all milestone cards
  const milestoneCards = document.querySelectorAll(".milestone-card");

  milestoneCards.forEach(async (milestoneCard) => {
    // Get consultant ID divs for this milestone
    const consultantIdDivs = milestoneCard.querySelectorAll(".consultant-id");
    const consultantNameContainer =
      milestoneCard.querySelector(".consultant-names");

    // Fetch consultant names
    const consultantIds = Array.from(consultantIdDivs).map((div) =>
      div.getAttribute("data-id")
    );

    let consultantNames = await Promise.all(
      consultantIds.map((id) => getConsultantsName(id))
    );

    // Join the consultant names and insert into the corresponding container
    consultantNameContainer.textContent = consultantNames.join(", ");
  });
};
