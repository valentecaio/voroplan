import { parseCSV } from './utils';

import * as L from 'leaflet';
import * as d3 from 'd3-voronoi';
import { VoronoiLayout } from 'd3-voronoi';

// constants
const csvFilePath = 'dataset/rio_bikes.csv';
const position = [-22.9668, -43.2029]; // Rio de Janeiro South Zone

// globals
let mymap: L.Map;
let markersLayer: L.LayerGroup;
let points: any;
let voronoiLayout: VoronoiLayout<[number, number]>;
let voronoiPolygons: any;
let dragStart: any;


function init() {
  // leaflet
  mymap = L.map('map').setView(position, 15);
  mymap.on('click', onMapClick);
  markersLayer = L.layerGroup().addTo(mymap);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
  }).addTo(mymap);

  // d3
  voronoiLayout = d3.voronoi();
}

function loadPoints() {
  parseCSV(csvFilePath)
    .then((dataMap) => {
      console.log('Parsed CSV Data:', dataMap);
      points = dataMap;
      voronoi();
      redraw();
    })
    .catch((error) => {
      console.log('Error parsing CSV:', error)
    });
}

// callback for map click: add a marker and redraw voronoi
function onMapClick(e) {
  points.push(e.latlng);
  voronoi();
  redraw();
}

// callback for marker drag start: save marker position
function onDragStart(e) {
  dragStart = e.target.getLatLng();
}

// callback for marker drag end: update marker position and redraw voronoi
function onDragEnd(e) {
  const index = points.findIndex(
      p => (p.lat == dragStart.lat) && (p.lng == dragStart.lng)
    );
  points[index] = e.target.getLatLng();
  voronoi();
  redraw();
}

// add a marker to the map
function markerAdd(point) {
  const marker = L.marker([point.lat, point.lng], { draggable: true });
  marker.on('dragstart', onDragStart);
  marker.on('dragend', onDragEnd);
  marker.addTo(markersLayer);
}

// clear old polygons from the map
function voronoiClear() {
  mymap.eachLayer((layer) => {
    if (layer instanceof L.Polygon) {
      mymap.removeLayer(layer);
    }
  });
}

// convert points pairs and calculate voronoi polygons
function voronoi() {
  const positions = points.map(point => [point.lat, point.lng]);
  const voronoiDiagram = voronoiLayout(positions);
  voronoiPolygons = voronoiDiagram.polygons();
  // console.log('polygons', polygons);
}

function redraw() {
  // map cleanup
  markersLayer.clearLayers();
  voronoiClear();

  // draw polygons
  voronoiPolygons.forEach(polygon => {
    const latLngs = polygon.filter(point =>
        point !== null
      ).map(point =>
        L.latLng(point[0], point[1])
      );
    L.polygon(latLngs).addTo(mymap);
  });

  // draw points
  points.forEach(point => {
    markerAdd(point);
  });
}

init();
loadPoints();

