/*************************
 *
 * this module contains geometric functions to manipulate polygons and points
 *
 *************************/

import * as gutils from './geometry';
import * as turf from '@turf/turf';
import * as d3 from 'd3-voronoi';


/*************************
 *
 * VORONOI
 *
 *************************/

export function voronoi(points) {
  const voronoiLayout = d3.voronoi();
  const positions = points.map(point => [point.lat, point.lng]);
  const voronoiDiagram = voronoiLayout(positions);
  const polygons = voronoiDiagram.polygons().map(polygon => polygon.filter(point => point !== null));
  polygons.forEach(gutils.polygonClose);
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

