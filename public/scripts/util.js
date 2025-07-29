/**
 * ============================================================================
 * File: util.js
 * Description: JavaScript for handling various helper functions.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

/**
 * Function to show current date
 *
 */
export const showDate = () => {
  const dateField = document.getElementById("dateFied");

  const today = new Date();
  const day = today.toDateString("default", { weekday: "long" });
  dateField.innerHTML = day;
};

/**
 * Displays a custom modal dialog with a message.
 *
 * @param {string} message - The message to display in the modal.
 * @param {"confirm" | "alert"} [type="confirm"] - The type of modal:
 *   - `"confirm"`: Displays OK and Cancel buttons (default).
 *   - `"alert"`: Displays only an OK button.
 *
 * @returns {Promise<boolean>} - Resolves to:
 *   - `true` if OK/Confirm is clicked.
 *   - `false` if Cancel is clicked.
 *
 * @example
 * // Example usage for confirmation modal:
 * const userConfirmed = await showModal("Are you sure you want to delete this entry?", "confirm");
 * if (userConfirmed) {
 *   console.log("User confirmed action.");
 * }
 *
 * @example
 * // Example usage for informational alert:
 * await showModal("Your changes have been saved successfully.", "alert");
 */
export const showModal = (message, type = "confirm") => {
  return new Promise((resolve) => {
    const modal = document.getElementById("customModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalMessage = document.getElementById("modalMessage");
    const modalCancel = document.getElementById("modalCancel");
    const modalConfirm = document.getElementById("modalConfirm");

    if (
      !modal ||
      !modalTitle ||
      !modalMessage ||
      !modalCancel ||
      !modalConfirm
    ) {
      console.error("Modal elements not found in the DOM.");
      return resolve(false);
    }

    // Set modal title and message
    modalTitle.textContent = type === "alert" ? "Notice" : "Confirmation";
    modalMessage.textContent = message;

    // Show cancel button only for confirmation modals
    if (type === "confirm") {
      modalCancel.classList.remove("hidden");
    } else {
      modalCancel.classList.add("hidden");
    }

    // Display the modal
    modal.classList.remove("hidden");

    // Handle Cancel button click
    modalCancel.onclick = () => {
      modal.classList.add("hidden");
      resolve(false); // Return false for cancel
    };

    // Handle Confirm/OK button click
    modalConfirm.onclick = () => {
      modal.classList.add("hidden");
      resolve(true); // Return true for confirm or alert OK
    };
  });
};
