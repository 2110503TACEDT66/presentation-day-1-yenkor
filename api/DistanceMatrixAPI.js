const getDistanceMatrix = (origin, destinations) => {
  const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destinations}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  // console.log(apiUrl);

  return fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      // Process the API response here
      return data;
    })
    .catch((error) => {
      console.error("Error:", error);
      return null; // Return null in case of an error
    });
};

module.exports = getDistanceMatrix;
