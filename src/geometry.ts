/*************************
 *
 * this module contains geometric functions to manipulate polygons and points
 *
 *************************/

import * as turf from '@turf/turf';
import * as d3 from 'd3-voronoi';
import { Delaunay } from 'd3-delaunay';

/*************************
 *
 * VORONOI
 *
 *************************/

// compute voronoi using d3-delaunay: faster and more robust
export function voronoi(points, boundPolygon) {
  const bounds = boundingBox(boundPolygon).flat(); // d3-delaunay requires a flat array
  const delaunay = Delaunay.from(latLngToArray(points));
  const voronoiDiagram = delaunay.voronoi(bounds);
  const polygons = [];
  for (const polygon of voronoiDiagram.cellPolygons()) {
    if (polygon) {
      polygons.push(polygon);
    }
  }
  polygons.forEach(polygonClose);
  return polygons;
}

// old method, compute voronoi using d3-voronoi
export function voronoi2(points, boundPolygon) {
  const bounds = boundingBox(boundPolygon);
  const voronoiLayout = d3.voronoi().extent(bounds);
  const voronoiDiagram = voronoiLayout(latLngToArray(points));
  const polygons = voronoiDiagram.polygons().map(polygon => polygon.filter(point => point !== null));
  polygons.forEach(polygonClose);
  return polygons;
}


/*************************
 *
 * GENERAL GEOMETRY
 *
 *************************/

// create turf polygons from arrays
function createTurfPolygons(polygons) {
  // each polygon must have at least 4 points
  polygons = polygons.filter(polygon => polygon.length >= 4);

  let tpolygons = [];
  polygons.forEach(polygon => {
    tpolygons.push(turf.polygon([polygon]));
  });

  // validate polygon orientation
  tpolygons.forEach(tpolygon => {
    turf.booleanClockwise(tpolygon.geometry.coordinates[0]) || tpolygon.geometry.coordinates[0].reverse();
  });

  return tpolygons;
}

// convert lat/lng points to arrays of coordinates
export function latLngToArray(points) {
  return points.map(point => [point.lat, point.lng]);
}

 // compare two points
export function pointsEqual(point1, point2) {
  if (point1 == null || point2 == null) {
    return false;
  }
  const p1lat = point1.lat != null ? point1.lat : point1[0];
  const p1lng = point1.lng != null ? point1.lng : point1[1];
  const p2lat = point2.lat != null ? point2.lat : point2[0];
  const p2lng = point2.lng != null ? point2.lng : point2[1];
  return p1lat === p2lat && p1lng === p2lng;
}

// returns the bounding box of a list of points (or a polygon)
export function boundingBox(polygon) {
  let minLat = Infinity;
  let minLng = Infinity;
  let maxLat = -Infinity;
  let maxLng = -Infinity;

  polygon.forEach(point => {
    minLat = Math.min(minLat, point.lat != null ? point.lat : point[0]);
    minLng = Math.min(minLng, point.lng != null ? point.lng : point[1]);
    maxLat = Math.max(maxLat, point.lat != null ? point.lat : point[0]);
    maxLng = Math.max(maxLng, point.lng != null ? point.lng : point[1]);
  });

  return [
    [minLat, minLng],
    [maxLat, maxLng]
  ];
}

// add the first point to the end of the polygon if necessary
export function polygonClose(polygon) {
  if (polygon[0] !== polygon[polygon.length - 1]) {
    polygon.push(polygon[0]);
  }
}

// subtract polygon2 from polygon1 and returns the result
// removes the intersection of the polygon2 in polygon1
export function polygonMinus(polygon1, polygon2) {
  if (polygon1.length < 4 || polygon2.length < 4) {
    return;
  }

  let [tpolygon1, tpolygon2] = createTurfPolygons([polygon1, polygon2]);

  // removes the intersection of the polygon2 in polygon1
  const intersection = turf.intersect(tpolygon1, tpolygon2);
  return (intersection != null) ? turf.difference(tpolygon1, intersection).geometry.coordinates[0] : polygon1;
}

// returns a new polygon that is the intersection of the polygon1 in polygon2
export function polygonIntersection(polygon1, polygon2) {
  if (polygon1.length < 4 || polygon2.length < 4) {
    return;
  }

  let [tpolygon1, tpolygon2] = createTurfPolygons([polygon1, polygon2]);

  // returns the intersection of the polygon1 in polygon2
  const intersection = turf.intersect(tpolygon1, tpolygon2);
  return (intersection != null) ? intersection.geometry.coordinates[0] : [];
}

export function pointInPolygon(point, polygon) {
  const [tpolygon] = createTurfPolygons([polygon]);
  const tpoint = turf.point([point.lat, point.lng]);
  return turf.booleanPointInPolygon(tpoint, tpolygon);
}

