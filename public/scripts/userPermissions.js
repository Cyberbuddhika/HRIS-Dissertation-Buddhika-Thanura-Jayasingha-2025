/**
 * ============================================================================
 * File: uerPermissions.js
 * Description: Functions for handling user permissions to view content. (Hide module from sidebar based on user roles)
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

/*
 * - Usage -
 * -Show a single section-
 * showSidebarComponents("profile");
 *
 * -Show multiple sections-
 * showSidebarComponents(["profile", "timesheet-overview", "timesheet-approval"]);
 */

let userCache = null;

export const showSidebarComponents = (...classNames) => {
  classNames.forEach((className) => {
    const elements = document.getElementsByClassName(className);
    Array.from(elements).forEach((el) => el.classList.remove("hidden"));
  });
};

const fetchUserInfo = async () => {
  if (userCache) return userCache;

  try {
    const response = await fetch("/api/v1/users/me");
    const data = await response.json();

    const user = data.data.data;
    if (user?.role && user?.name) {
      // Cache in sessionStorage

      sessionStorage.setItem("userRole", user.role);
      sessionStorage.setItem("userName", user.name);

      userCache = user; // Store in memory for this session
      return user;
    }

    throw new Error("User info not found in response");
  } catch (err) {
    console.error("Failed to fetch user info:", err);
    return null;
  }
};

export const getUserRole = async () => {
  const cachedRole = sessionStorage.getItem("userRole");

  if (cachedRole) return cachedRole;

  const user = await fetchUserInfo();
  return user?.role || null;
};

export const getUserName = async () => {
  const cachedName = sessionStorage.getItem("userName");

  if (cachedName) return cachedName;

  const user = await fetchUserInfo();
  return user?.name || null;
};
