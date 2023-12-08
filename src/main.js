const mymap = L.map('map').setView([-22.9668, -43.2029], 15); // Rio de Janeiro coordinates

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(mymap);

// empty layer group for markers and lines
const markersLayer = L.layerGroup().addTo(mymap);
const linesLayer = L.layerGroup().addTo(mymap);

// Function to add a marker and draw a line on click
function onMapClick(e) {
  // Add a marker at the clicked location
  const marker = L.marker(e.latlng).addTo(markersLayer);

  // Draw a line from the last clicked point to the current point
  if (markersLayer.getLayers().length > 1) {
    const prevMarker = markersLayer.getLayers()[markersLayer.getLayers().length - 2].getLatLng();
    const line = L.polyline([prevMarker, e.latlng]).addTo(linesLayer);
}
}

// Attach the click event to the map
mymap.on('click', onMapClick);

