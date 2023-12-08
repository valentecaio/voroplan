import * as L from 'leaflet';
import { parseCSV } from './utils';

// constants
const csvFilePath = 'dataset/rio_bikes.csv';
const position = [-22.9668, -43.2029]; // Rio de Janeiro South Zone

// global
let mymap: L.Map;
let markersLayer: L.LayerGroup;
let linesLayer: L.LayerGroup;

function onMapClick(e) {
  // Add a marker at the clicked location
  const marker = L.marker(e.latlng).addTo(markersLayer);

  // Draw a line from the last clicked point to the current point
  if (markersLayer.getLayers().length > 1) {
    const prevMarker = markersLayer.getLayers()[markersLayer.getLayers().length - 2].getLatLng();
    const line = L.polyline([prevMarker, e.latlng]).addTo(linesLayer);
  }
}

function init() {
  mymap = L.map('map').setView(position, 15);
  mymap.on('click', onMapClick);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
  }).addTo(mymap);

  markersLayer = L.layerGroup().addTo(mymap);
  linesLayer = L.layerGroup().addTo(mymap);
}

function loadPoints() {
  parseCSV(csvFilePath)
    .then((dataMap) => {
      console.log(dataMap);
      dataMap.forEach(point => {
        L.marker([point.lat, point.lng]).addTo(markersLayer);
      });
      console.log(markersLayer);
      console.log('Parsed CSV Data:', dataMap);
    })
    .catch((error) => {
      console.log('Error parsing CSV:', error)
    });
}

init();
loadPoints();
