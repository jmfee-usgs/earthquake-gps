'use strict';

var L = require('leaflet'),
    Util = require('util/Util');

require('leaflet-ajax');

var EarthquakesLayer = function (url, options) {
  var _colors,
      _pointToLayer,
      _onEachFeature;

  _colors = {
    pasthour: '#f00',
    pastday: '#f90',
    pastweek: '#ff0',
    pastmonth: '#ffb'
  };

  options = Util.extend({
    weight: 1,
    opacity: 0.9,
    fillOpacity: 0.9,
    color: '#000'
  }, options);

  _pointToLayer = function (feature, latlng) {
    var fillColor,
        props,
        radius;

    props = feature.properties;
    fillColor = _colors[props.age];
    radius = 3 * parseInt(Math.pow(10, (0.11 * props.mag)), 10);

    options.fillColor = fillColor;
    options.radius = radius;

    return L.circleMarker(latlng, options);
  };

  _onEachFeature = function (feature, layer) {
    var html,
        link,
        props;

    props = feature.properties;
    link = 'http://earthquake.usgs.gov/earthquakes/eventpage/' + feature.id;
    html = '<div class="popup eq">' +
        '<h1>M' + props.mag + ', ' + props.place + '</h1>' +
        '<time>' + props.datetime + '</time>' +
        '<p><a href="' + link + '" target="_blank">Details</a> &raquo;</p>' +
      '</div>';

    layer.bindPopup(html, {maxWidth: '265'});
  };

  return L.geoJson.ajax(url, {
    pointToLayer: _pointToLayer,
    onEachFeature: _onEachFeature
  });

};

L.earthquakesLayer = EarthquakesLayer;

module.exports = EarthquakesLayer;
