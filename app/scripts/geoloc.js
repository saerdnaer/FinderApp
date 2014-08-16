/**
 * A module for working with the geolocation
 */
var geoloc = (function () {
  'use strict';
  
  // Semi-axes of WGS-84 geoidal reference
  var wgs84_a = 6378137.0,
      wgs84_b = 6356752.3;

  function degToRad(deg) {
    return deg * (Math.PI/180);
  }

  function radToDeg(rad) {
    return rad * (180/Math.PI);
  }

  //Earth radius at a given latitude, according to the WGS-84 ellipsoid [m]
  //http://en.wikipedia.org/wiki/Earth_radius
  function wgs84EarthRadius(lat){

    var an = wgs84_a*wgs84_a * Math.cos(lat);
    var bn = wgs84_b*wgs84_b * Math.sin(lat);
    var ad = wgs84_a * Math.cos(lat);
    var bd = wgs84_b * Math.sin(lat);
    return Math.sqrt((an*an + bn*bn)/(ad*ad + bd*bd));
  }

  function getDistanceBetween(coords1, coords2) {
    var earthRad = 6371,
        lat1 = degToRad(coords1.latitude),
        lon1 = degToRad(coords1.longitude),
        lat2 = degToRad(coords2.latitude),
        lon2 = degToRad(coords2.longitude);

    var dist = Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)) * earthRad;

    return dist;
  }

  function getBoundingBoxFor(coords, distance) {

    var lat = degToRad(coords.latitude),
        lon = degToRad(coords.longitude);

    // Radius of Earth at given latitude
    var radius = wgs84EarthRadius(lat);
    // Radius of the parallel at given latitude
    var pradius = radius*Math.cos(lat);
    var result = {};

    result.latMin = radToDeg(lat - distance/radius);
    result.latMax = radToDeg(lat + distance/radius);
    result.lonMin = radToDeg(lon - distance/pradius);
    result.lonMax = radToDeg(lon + distance/pradius);

    return result;
  }

  return {
    getDistanceBetween: getDistanceBetween,
    getBoundingBoxFor: getBoundingBoxFor
  };
})();
