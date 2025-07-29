/**
 * ============================================================================
 * File: navigation.js
 * Description: Functions for handling sidebar navigation.
 * Author: Buddhika Jayasingha
 * ============================================================================


/**
 * Toggle function for sidebar sections.
 * @param {HTMLElement} container - The container to toggle.
 * @param {HTMLElement} upArrow - The up arrow icon element.
 * @param {HTMLElement} downArrow - The down arrow icon element.
 */
export const toggleSection = (container, upArrow, downArrow) => {
  const isOpen = container.classList.contains("is-open");
  if (isOpen) {
    container.classList.remove("max-h-96", "is-open");
    container.classList.add("max-h-0");
    downArrow.classList.remove("hidden");
    upArrow.classList.add("hidden");
  } else {
    container.classList.remove("max-h-0");
    container.classList.add("max-h-96", "is-open");
    upArrow.classList.remove("hidden");
    downArrow.classList.add("hidden");
  }
};
