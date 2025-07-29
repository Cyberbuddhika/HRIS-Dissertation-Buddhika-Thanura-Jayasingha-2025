// const axios = require("axios");

/**
 * Function to get latitude and longitude for a given location using Mapbox API.
 * @param {String} country - The country name to geocode.
 * @param {String} location - The location (e.g., city) to geocode.
 * @param {String} token - The Mapbox API access token.
 * @param {String} mapstyle - The Mapbox map style (e.g., "light-v11").
 * @param {String} size - The size of the map image (e.g., "300x400").
 * @returns {Object} - An object containing the latitude, longitude, and the full URL for the static map.
 */
async function getGeoLocations(location, token, mapstyle, size) {
  try {
    // Geocode the location (e.g., city)
    const geocodeUrlLocation = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(location)}&access_token=${token}`;
    const response = await fetch(geocodeUrlLocation, { method: "GET" });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch geolocation data: ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Filter out any invalid features
    const validFeatures = data.features.filter(
      (feature) => feature && feature.geometry && feature.geometry.coordinates,
    );

    if (validFeatures.length === 0) {
      throw new Error("No valid features found in the geolocation response.");
    }

    const [locationLng, locationLat] = validFeatures[0].geometry.coordinates;

    console.log([locationLng, locationLat]);

    // Adjust the center of the map slightly based on the location coordinates
    const centerLng = locationLng + 0.05; // Adjust this value as needed
    const centerLat = locationLat - 0.05; // Adjust this value as needed

    // Construct the Mapbox static map URL
    const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/${mapstyle}/static/pin-l+2db2eb(${locationLng},${locationLat})/${centerLng},${centerLat},3.19,0/${size}@2x?before_layer=admin-0-boundary&access_token=${token}`;

    return { locationLat, locationLng, mapUrl };
  } catch (error) {
    console.error("Error in getGeoLocations:", error);
    throw error;
  }
}

module.exports = getGeoLocations;
