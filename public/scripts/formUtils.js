/**
 * ============================================================================
 * File: fromUtils.js
 * Description: JavaScript for handling form data functions.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

import AutoNumeric from "autonumeric";
/**
 * Universal function to populate dropdown options.
 * @param {string} url - The URL to fetch data from.
 * @param {string} dropdownId - The ID of the dropdown element to populate.
 * @param {string} dataType - A label for the type of data being populated (e.g., "country", "project", "consultant").
 * @param {function} processData - A callback function to process each item in the data array.
 *                                 Should return an object with `value` and `text` properties.
 * @param {string|null} [dataPath=null] - A string representing the path to the data within the response.
 *                                        If the data is nested, use dot notation (e.g., "data.items").
 * @param {function|null} [filterData=null] - An optional callback function to filter the data array.
 *                                            Should return a boolean indicating whether to include the item.
 * @param {function|null} [sortFunction=null] - An optional callback function to sort the items.
 *
 */
export const populateDropdown = async (
  url,
  dropdownId,
  dataType,
  processData,
  dataPath = null,
  filterData = null,
  sortFunction = null
) => {
  try {
    // Fetch data from the provided URL
    const response = await fetch(url);
    const responseData = await response.json();

    // Access the correct data path if provided
    let items = responseData;

    if (dataPath) {
      dataPath.split(".").forEach((key) => {
        items = items[key];
      });
    }

    // Apply filtering if a filter function is provided
    items = filterData ? items.filter(filterData) : items;

    // Sort the items if a sort function is provided
    if (sortFunction) {
      items.sort(sortFunction);
    }

    if (response.ok) {
      const dropdown = document.getElementById(dropdownId);
      dropdown.innerHTML = ""; // Clear any existing options

      items.forEach((item) => {
        const { value, text } = processData(item);
        const option = document.createElement("option");
        option.value = value;
        option.textContent = text;
        dropdown.appendChild(option);
      });
    } else {
      console.error(`Error fetching ${dataType}:`, data.message);
    }
  } catch (error) {
    console.error(`Error fetching ${dataType}:`, error);
  }
};

/**
 * Universal function to validate End date is greater than Start Date for Consultants Contract Data, Project & Milestones Commence and End Dates.
 * @param {string} startDate - Element Id for the Start Date.
 * @param {string} endDate - Element Id for the End Date.
 *
 */

export const validateDates = (contractStartDate, contractEndDate) => {
  const startDateValue = new Date(contractStartDate.value);
  let endDateValue = new Date(contractEndDate.value);

  // Set the time to midnight to ensure the comparison is only based on the date
  startDateValue.setHours(0, 0, 0, 0);
  endDateValue.setHours(0, 0, 0, 0);

  if (endDateValue <= startDateValue) {
    actionAfterErrorMessage(
      "The contract end date must be greater than the start date."
    );
    endDateValue = ""; // Clear the invalid end date
    return false; // Prevent form submission
  }
  return true; // Date validation passed
};

/**
 * Function to handle actions with Success Messages.
 * @param {string} message - The Message you want to show as success.
 */
export const actionAfterSuccessMessage = (message) => {
  const contentContainer = document.querySelector(".grid"); // The scrollable container
  document.getElementById("successMessage").classList.remove("hidden");
  document.getElementById("errorMessage").classList.add("hidden");
  document.getElementById("successMessage").textContent = ""; // Clear any previous error message
  document.getElementById("successMessage").textContent = message;

  contentContainer.scrollTo({ top: 0, behavior: "smooth" });
};

/**
 * Function to handle actions with Success Messages.
 * @param {string} errorMessage - The Message you want to show as an error.
 */
export const actionAfterErrorMessage = (errorMessage) => {
  const contentContainer = document.querySelector(".grid"); // The scrollable container
  document.getElementById("errorMessage").classList.remove("hidden");
  document.getElementById("successMessage").classList.add("hidden");
  document.getElementById("errorMessage").textContent =
    `Error: ${errorMessage || "An error occurred"}`;
  document.getElementById("successMessage").textContent = ""; // Clear any previous success message
  contentContainer.scrollTo({ top: 0, behavior: "smooth" });
};

/**
 * Function to calculate and show Total Contract / Deliverable Value.
 * Sum up the data from Total Fees, Total expenses and Total Overhead.
 * Using AutoNumeric - https://autonumeric.org/
 */
export const populateContractTotalValue = async (
  totalValueFieldId,
  totalFeesFieldId,
  totalExpensesFieldId,
  totalOverheadFieldId
) => {
  let feesTotal = 0;
  let expensesTotal = 0;
  let overheadTotal = 0;

  try {
    const contractTotalValueField = document.getElementById(totalValueFieldId);
    // Initialize AutoNumeric on the input fields
    const totalFeesField = new AutoNumeric(`#${totalFeesFieldId}`, {
      digitGroupSeparator: ",",
      decimalCharacter: ".",
      decimalPlaces: 2,
      unformatOnSubmit: true,
    });

    const totalExpensesField = new AutoNumeric(`#${totalExpensesFieldId}`, {
      digitGroupSeparator: ",",
      decimalCharacter: ".",
      decimalPlaces: 2,
      unformatOnSubmit: true,
    });

    const totalOverheadField = new AutoNumeric(`#${totalOverheadFieldId}`, {
      digitGroupSeparator: ",",
      decimalCharacter: ".",
      decimalPlaces: 2,
      unformatOnSubmit: true,
    });

    // Function to update the total value
    function updateTotalValue() {
      // Get unformatted values using AutoNumeric's getNumber method
      feesTotal = totalFeesField.getNumber() || 0;
      expensesTotal = totalExpensesField.getNumber() || 0;
      overheadTotal = totalOverheadField.getNumber() || 0;

      const totalValue = feesTotal + expensesTotal + overheadTotal;

      contractTotalValueField.value = totalValue.toFixed(2); // Display the total value
    }

    // Add event listeners to update the total value whenever inputs change
    totalFeesField.domElement.addEventListener("input", updateTotalValue);
    totalExpensesField.domElement.addEventListener("input", updateTotalValue);
    totalOverheadField.domElement.addEventListener("input", updateTotalValue);

    // Initial calculation
    updateTotalValue();
  } catch (error) {
    console.log(error);
    actionAfterErrorMessage("Error showing Contract Total Value:", error);
  }
};

/**
 * Function to populate dropdown options for Nationality.
 *
 */

export const populateNationalitiesDropdown = async () => {
  const dropdownNational = document.getElementById("nationality");

  try {
    const response = await fetch("/resources/nationalities.json");
    const nationalities = await response.json();

    nationalities.forEach((nationality) => {
      const option = document.createElement("option");
      option.value = nationality;
      option.textContent = nationality;
      dropdownNational.appendChild(option);
    });
  } catch (error) {
    console.error(error);
  }
};
