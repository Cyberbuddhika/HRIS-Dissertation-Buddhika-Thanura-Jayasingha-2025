/**
 * ============================================================================
 * File: tableUtils.js
 * Description: JavaScript for handling table sorting, searching and filtering.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

/**
 * Universal function to filter status
 * @param {string} status - The status to filter (All, Active, Inactive).
 * @param {string} tableBodyId - The ID of the table body to filter.
 * @param {number} colNumber - The column number containing the status.
 */
const filterStatus = (status, tableBodyId, colNumber) => {
  const tableBody = document.getElementById(tableBodyId);
  if (!tableBody) return; // If the table body doesn't exist, exit the function

  const rows = tableBody.getElementsByTagName("tr");
  Array.from(rows).forEach((row) => {
    const statusCell = row.querySelector(`td:nth-child(${colNumber})`);
    if (
      status === "All" ||
      (status === "Active" && statusCell.textContent.includes("Active")) ||
      (status === "Inactive" && statusCell.textContent.includes("Inactive"))
    ) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
};

/**
 * Initialize filter for a specific section
 * @param {string} toggleActiveId - The ID of the active toggle element.
 * @param {string} toggleInactiveId - The ID of the inactive toggle element.
 * @param {string} showAllId - The ID of the show all element.
 * @param {string} tableBodyId - The ID of the table body to filter.
 * @param {number} colNumber - The column number containing the status.
 */
export const initFilter = (
  toggleActiveId,
  toggleInactiveId,
  showAllId,
  tableBodyId,
  colNumber
) => {
  const toggleActive = document.getElementById(toggleActiveId);
  const toggleInactive = document.getElementById(toggleInactiveId);
  const showAll = document.getElementById(showAllId);

  if (!toggleActive || !toggleInactive || !showAll) return; // If elements don't exist, exit the function

  toggleActive.addEventListener("click", () => {
    filterStatus("Inactive", tableBodyId, colNumber);
    toggleActive.classList.add("hidden");
    toggleInactive.classList.remove("hidden");
  });

  toggleInactive.addEventListener("click", () => {
    filterStatus("Active", tableBodyId, colNumber);
    toggleInactive.classList.add("hidden");
    toggleActive.classList.remove("hidden");
  });

  showAll.addEventListener("click", () => {
    filterStatus("All", tableBodyId, colNumber);
  });

  // Initial load to show all data
  filterStatus("Active", tableBodyId, colNumber);
};

/**
 * Universal function to sort table columns
 * @param {string} tableId - The ID of the table to sort.
 */
export const initSorting = (tableId) => {
  const table = document.getElementById(tableId);
  if (!table) return; // If the table doesn't exist, exit the function

  const headers = table.querySelectorAll("th[data-column]");
  headers.forEach((header) => {
    header.classList.add("cursor-pointer", "hover:bg-gray-200", "sortable");
    header.addEventListener("click", () => {
      const column = header.dataset.column;
      const order = header.classList.contains("asc") ? "desc" : "asc";

      // Remove sort classes from all headers
      headers.forEach((h) => h.classList.remove("asc", "desc"));
      // Add sort class to the clicked header
      header.classList.add(order);

      // Get rows and sort them
      const rows = Array.from(table.querySelector("tbody").rows);
      rows.sort((a, b) => {
        const cellA = a.querySelector(`td[data-column="${column}"]`);
        const cellB = b.querySelector(`td[data-column="${column}"]`);

        // Handle null or undefined cells by using an empty string as a fallback
        const textA = (cellA && cellA.textContent.trim()) || "";
        const textB = (cellB && cellB.textContent.trim()) || "";

        if (order === "asc") {
          return textA.localeCompare(textB);
        } else {
          return textB.localeCompare(textA);
        }
      });

      // Re-append sorted rows to the tbody
      rows.forEach((row) => table.querySelector("tbody").appendChild(row));
    });
  });
};

/**
 * Universal function to search content
 * @param {string} searchInputId - The ID of the search box.
 * @param {string} tableBodyId - The ID of the table to sort.
 */

// Universal search function
export const initSearch = (searchInputId, tableBodyId) => {
  const searchInput = document.getElementById(searchInputId);
  const tableBody = document.getElementById(tableBodyId);

  if (!searchInput || !tableBody) return; // If elements don't exist, exit the function

  searchInput.addEventListener("input", () => {
    const filter = searchInput.value.toLowerCase();
    const rows = tableBody.getElementsByTagName("tr");

    Array.from(rows).forEach((row) => {
      const cells = row.getElementsByTagName("td");
      let match = false;

      Array.from(cells).forEach((cell) => {
        if (cell.textContent.toLowerCase().includes(filter)) {
          match = true;
        }
      });

      if (match) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });
};
