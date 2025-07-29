/**
 * ============================================================================
 * File: userUtils.js
 * Description: JavaScript for handling user Create & Update form data functions.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

import {
  actionAfterSuccessMessage,
  actionAfterErrorMessage,
} from "./formUtils.js";

import { showModal } from "./util.js";

/**
 * Function to PATCH data from User Edit Form.
 */
export const userEditFormUpdate = async () => {
  const userForm = document.getElementById("UserForm");

  if (!userForm) {
    console.error("User form not found!");
    return;
  }

  //  Manually Extract Input Values
  const userName = document.getElementById("userName").value; // Name (Disabled, so not included in FormData)
  const userEmail = document.getElementById("userEmail").value; // Email (Disabled, so not included in FormData)
  const userRole = document.getElementById("userRole").value; // Role
  const userStatus = document.getElementById("userStatus").value === "true"; // Convert string to Boolean

  // Manually Construct JSON Object
  const jsonData = {
    role: userRole,
    active: userStatus,
  };

  try {
    // Extract User ID from URL (assuming /users/:id/edit)
    const urlParts = window.location.pathname.split("/");
    const userId = urlParts[urlParts.indexOf("users") + 1]; // Extract user ID

    // Send PATCH Request
    const response = await fetch(`/api/v1/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Error Response:", result);
      actionAfterErrorMessage(result.message || "Error updating user.");
      return;
    }

    //  Success Message & Redirect
    actionAfterSuccessMessage("User updated successfully!");
    setTimeout(() => {
      window.location.href = "/users"; // Redirect after success
    }, 1000);
  } catch (error) {
    console.error("Error updating user:", error);
    actionAfterErrorMessage("Error updating user.");
  }
};

/**
 * Function to POST data from User Creation Form. - User Create -
 */
export const userCreateFormSubmit = async () => {
  const userCreateForm = document.getElementById("userCreateForm");

  if (!userCreateForm) {
    console.error("User form not found!");
    return;
  }

  // Manually extract input values
  const name = document.getElementById("userName").value.trim();
  const email = document.getElementById("userEmail").value.trim();
  const role = document.getElementById("userRole").value;
  const consultant = document.getElementById("consultant_Id").value;
  const password = document.getElementById("password").value;
  const passwordConfirmation = document.getElementById(
    "passwordConfirmation"
  ).value;

  // Ensure required fields are filled
  if (!name || !email || !role || !password || !passwordConfirmation) {
    showModal("Please fill in all fields.", "alert");

    return;
  }

  // Ensure password & confirmation match
  if (password !== passwordConfirmation) {
    showModal("Passwords do not match!", "alert");

    return;
  }

  // Create JSON object manually
  const jsonData = {
    name,
    email,
    role,
    consultant_id: consultant,
    password,
    passwordConfirmation,
    active: true,
  };

  try {
    const response = await fetch("/api/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonData),
    });

    const result = await response.json();

    if (!response.ok) {
      actionAfterErrorMessage(result.message || "Error creating user.");
      return;
    }

    //  Success Message & Redirect
    actionAfterSuccessMessage("User created successfully!");

    setTimeout(() => {
      window.location.href = "/users"; // Redirect after 2 seconds
    }, 1000);
  } catch (error) {
    console.error("Error creating user:", error);
    showModal("Error creating user.", "alert");
  }
};
