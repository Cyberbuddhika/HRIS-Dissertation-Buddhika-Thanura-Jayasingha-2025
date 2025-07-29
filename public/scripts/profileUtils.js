/**
 * ============================================================================
 * File: profileUtils.js
 * Description: JavaScript for handling profile section functions.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

import { showModal } from "./util.js";

/**
 * Function to handle password update when form is submitted.
 */
export const updatePassword = async (form) => {
  // Get form input values
  const passwordCurrent = document.getElementById("passwordCurrent").value;
  const password = document.getElementById("password").value;
  const passwordConfirmation = document.getElementById(
    "passwordConfirmation"
  ).value;

  // Basic validation to check if new passwords match
  if (password !== passwordConfirmation) {
    showModal("Passwords do not match!", "alert");
    return;
  }

  try {
    const response = await fetch("/api/v1/users/updateMyPassword", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        passwordCurrent,
        password,
        passwordConfirmation,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      showModal(result.message || "Error updating password.", "alert");
      return;
    }

    // Show success message
    showModal("Password updated successfully!", "alert");

    //  Clear input fields after successful update
    form.reset();
  } catch (error) {
    console.error("Error updating password:", error);
    showModal("Something went wrong. Please try again!", "alert");
  }
};
