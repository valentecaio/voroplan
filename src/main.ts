import * as utils from './utils';
import * as gutils from './geometry';

import * as L from 'leaflet';
import * as d3 from 'd3-voronoi';

// constants
const dataset = 'bike';
const dataset_metro = 'dataset/rio_metro.csv';
const dataset_bike = 'https://riodejaneiro.publicbikesystem.net/customer/ube/gbfs/v1/en/station_information';
const dataset_constraints = 'dataset/rio_constraints.json';
const map_position = [-22.9668, -43.2029]; // Rio de Janeiro South Zone

// globals
let map: L.Map;                    // leaflet map
let layer_stations: L.LayerGroup;  // layer containing stations
let stations: any = [];            // list of stations containing lat and lng coordinates
let constraints: any = {};         // an outer polygon and a list of inner polygons
let clicked: any = [];             // list of clicked points
let dragStart: any;                // used to update station position when dragging
let voronoiPolygons: any = [];     // polygons generated by d3-voronoi
let voronoiLayout: d3.VoronoiLayout<[number, number]>; // d3-voronoi layout



/****** LOAD DATA ******/

// load stations data from csv or json
function loadStations(dataset) {
  let callback = (data) => {
    console.log('Loaded data:', data);
    data.forEach((station) => {
      stations.push({
        name: station.name,
        lat:  station.lat,
        lng:  station.lon != null ? station.lon : station.lng
      });
    });
    redraw();
  }
  if (dataset === 'metro') {
    utils.loadCSV(dataset_metro, callback);
  } else if (dataset === 'bike') {
    utils.loadRemoteJSON(dataset_bike, callback);
  }
}

function loadConstraints() {
  utils.loadJSON(dataset_constraints, (data) => {
    const map_func = (point) => [point.lat, point.lng];
    data.outer = data.outer.map(map_func);
    data.inner = data.inner.map((polygon) => polygon.map(map_func));
    gutils.polygonClose(data.outer);
    data.inner.forEach(gutils.polygonClose);
    constraints = data
    redraw();
  });
}



/****** MAP INIT AND DRAWING ******/

function init() {
  // leaflet
  map = L.map('map').setView(map_position, 15);
  map.on('click', onMapClick);
  layer_stations = L.layerGroup().addTo(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // d3
  voronoiLayout = d3.voronoi();

  // globals
  constraints = {outer: [], inner: []};
}

// callback for map click: create station marker and redraw voronoi
function onMapClick(e) {
  stations.push(e.latlng);

  // hack to get the clicked points in json format
  // clicked.push(e.latlng);
  // console.log(clicked)
  // const jsonContent = JSON.stringify(clicked, null, 2);
  // console.log(jsonContent);

  redraw();
}

// add a polygon to the map
function addPolygon(points, color, fill) {
  const latLngs = points.map(point => L.latLng(point[0], point[1]));
  L.polygon(latLngs, {color: color, fill: fill, fillOpacity: 0.3}).addTo(map);
}

// add a station point to the map
function addMarker(point) {
  const marker = L.marker([point.lat, point.lng], { draggable: true });
  marker.addTo(layer_stations);

  // started to drag: save marker position
  marker.on('dragstart', (e) => {
    dragStart = e.target.getLatLng();
  });

  // stoped to drag: update marker position and redraw voronoi
  marker.on('dragend', (e) => {
    const index = stations.findIndex(p => (p.lat == dragStart.lat) && (p.lng == dragStart.lng));
    stations[index] = e.target.getLatLng();
    redraw();
  });
}

// recalculate and redraw data on the map
function redraw() {
  // recalculate
  applyConstraintsOnPoints();
  voronoi();
  applyConstraintsOnVoronoi();

  // map cleanup
  layer_stations.clearLayers();
  map.eachLayer((layer) => {
    if (layer instanceof L.Polygon) {
      map.removeLayer(layer);
    }
  });

  // draw voronoi polygons
  voronoiPolygons.forEach(polygon => {
    addPolygon(polygon, 'blue', false);
  });

  // draw constraint polygons
  if (constraints.outer) {
    addPolygon(constraints.outer, 'red', false);
  }
  constraints.inner.forEach(polygon => { addPolygon(polygon, 'red', true); });

  // draw points
  stations.forEach(point => {
    addMarker(point);
  });
}



/****** GEOMETRIC CALCULATIONS ******/

// convert points pairs and calculate voronoi polygons
function voronoi() {
  const positions = stations.map(point => [point.lat, point.lng]);
  const voronoiDiagram = voronoiLayout(positions);
  voronoiPolygons = voronoiDiagram.polygons().map(polygon => polygon.filter(point => point !== null));
  voronoiPolygons.forEach(gutils.polygonClose);
}

// remove points that are outside the outer constraint or inside an inner constraint
function applyConstraintsOnPoints() {
  if (constraints.outer.length == 0) return;
  stations = stations.filter(point => gutils.pointInPolygon(point, constraints.outer));
  constraints.inner.forEach(polygon => {
    stations = stations.filter(point => !gutils.pointInPolygon(point, polygon));
  });
}

// apply constraints to the voronoi polygons
function applyConstraintsOnVoronoi() {
  // remove voronoi polygons outside the outer constraint
  for (let i = 0; i < voronoiPolygons.length; i++) {
    const new_polygon = gutils.polygonIntersection(voronoiPolygons[i], constraints.outer);
    voronoiPolygons[i] = new_polygon ? new_polygon : voronoiPolygons[i];
  }

  // remove intersections of inner constraints in voronoi polygons
  for (let i = 0; i < voronoiPolygons.length; i++) {
    for (let j = 0; j < constraints.inner.length; j++) {
      const new_polygon = gutils.polygonMinus(voronoiPolygons[i], constraints.inner[j]);
      voronoiPolygons[i] = new_polygon ? new_polygon : voronoiPolygons[i];
    }
  }

  // remove null polygons
  voronoiPolygons = voronoiPolygons.filter(polygon => polygon && polygon.length > 0);
}


/****** MAIN ******/

init();
loadConstraints();
loadStations(dataset);

