/**
 * ============================================================================
 * File: login.js
 * Description: JavaScript for handling authentication functions.
 * Author: Buddhika Jayasingha

 * ============================================================================
 */

import { showModal } from "./util.js";
/**
 * Function to login users
 *
 */
export const login = () => {
  const loginForm = document.getElementById("loginForm");

  if (!loginForm) return; // Ensure the element exists

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent the form from submitting the traditional way

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/api/v1/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.clear();
        localStorage.clear();
        // Successful login
        window.location.href = "/";
      } else {
        // Extract the error message
        const message = data.message || data.error || "Something went wrong";

        if (
          response.status === 429 ||
          message.toLowerCase().includes("too many")
        ) {
          showModal(
            "You’ve reached the maximum number of login attempts. Please wait 15 minutes before trying again.",
            "alert"
          );
        } else {
          showModal(message, "alert");
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
      showModal("An error occurred. Please try again later.", "alert");
    }
  });
};

/**
 * Function to logout users
 *
 */
export const logout = async () => {
  try {
    const res = await fetch("/api/v1/users/logout", {
      method: "GET",
    });

    sessionStorage.clear();
    localStorage.clear();

    if (res.ok) {
      await showModal("Logged out Successfully", "alert");

      setTimeout(() => {
        location.replace("/login");
      }, 1000);
    } else {
      showModal("Error logging out! Try again", "alert");
    }
  } catch (err) {
    showModal("Error logging out! Try again", "alert");
  }
};
