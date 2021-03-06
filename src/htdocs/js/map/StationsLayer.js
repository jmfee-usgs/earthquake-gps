/* global L, NETWORK, MOUNT_PATH */
'use strict';


var Icon = require('map/Icon'),
    Util = require('util/Util');

require('leaflet.label');


var _DEFAULTS,
    _LAYERNAMES,
    _MARKER_DEFAULTS,
    _SHAPES;

_MARKER_DEFAULTS = {
  alt: 'GPS station'
};
_DEFAULTS = {
  data: {},
  markerOptions: _MARKER_DEFAULTS
};
_LAYERNAMES = {
  blue: 'Past 3 days',
  yellow: '4&ndash;7 days ago',
  orange: '8&ndash;14 days ago',
  red: 'Over 14 days ago'
};
_SHAPES = {
  campaign: 'triangle',
  continuous: 'square'
};


/**
 * Factory for Stations overlay
 *
 * @param options {Object}
 *     {
 *       data: {String} Geojson data
 *       markerOptions: {Object} L.Marker options
 *     }
 *
 * @return {L.FeatureGroup}
 *     {
 *       count: {Object}
 *       layers: {Object}
 *       name: {Object}
 *       getBounds: {Function}
 *       openPopup: {Function}
 *     }
 */
var StationsLayer = function (options) {
  var _this,
      _initialize,

      _bounds,
      _icons,
      _markerOptions,
      _points,

      _getColor,
      _initLayers,
      _onEachFeature,
      _pointToLayer;


  _this = L.featureGroup();

  _initialize = function (options) {
    options = Util.extend({}, _DEFAULTS, options);
    _markerOptions = Util.extend({}, _MARKER_DEFAULTS, options.markerOptions);

    _bounds = new L.LatLngBounds();
    _icons = {};
    _points = {};

    _initLayers();

    L.geoJson(options.data, {
      onEachFeature: _onEachFeature,
      pointToLayer: _pointToLayer
    });
  };


  /**
   * Create a layerGroup for each group of stations (classed by age)
   * (also set up a count to keep track of how many stations are in each group)
   */
  _initLayers = function () {
    _this.count = {};
    _this.layers = {};
    _this.names = _LAYERNAMES;
    Object.keys(_LAYERNAMES).forEach(function (key) {
      _this.count[key] = 0;
      _this.layers[key] = L.layerGroup();
      _this.addLayer(_this.layers[key]); // add to featureGroup
    });
  };

  /**
   * Get icon color
   *
   * @param days {Integer}
   *     days since station last updated
   *
   * @return color {String}
   */
  _getColor = function (days) {
    var color = 'red'; //default

    if (days > 14) {
      color = 'red';
    } else if (days > 7) {
      color = 'orange';
    } else if (days > 3) {
      color = 'yellow';
    } else if (days >= 0) {
      color = 'blue';
    }

    return color;
  };

  /**
   * Leaflet GeoJSON option: called on each created feature layer. Useful for
   * attaching events and popups to features.
   *
   * @param feature {Object}
   * @param layer (L.Layer)
   */
  _onEachFeature = function (feature, layer) {
    var data,
        label,
        popup,
        popupTemplate,
        station;

    station = feature.properties.station;
    data = {
      baseUri: MOUNT_PATH + '/' + NETWORK + '/' + station,
      imgSrc: MOUNT_PATH + '/data/networks/' + NETWORK + '/' + station +
        '/nafixed/' + station + '.png',
      lat: Math.round(feature.geometry.coordinates[1] * 1000) / 1000,
      lon: Math.round(feature.geometry.coordinates[0] * 1000) / 1000,
      network: NETWORK,
      station: station.toUpperCase()
    };
    popupTemplate = '<div class="popup station">' +
        '<h2>Station {station}</h2>' +
        '<span>({lat}, {lon})</span>' +
        '<ul class="no-style pipelist">' +
          '<li><a href="{baseUri}/">Station Details</a></li>' +
          '<li><a href="{baseUri}/logs/">Field Logs</a></li>' +
          '<li><a href="{baseUri}/photos/">Photos</a></p></li>' +
        '</ul>' +
        '<a href="{baseUri}/"><img src="{imgSrc}" alt="plot" /></a>' +
      '</div>';
    popup = L.Util.template(popupTemplate, data);
    label = station.toUpperCase();

    layer.bindPopup(popup, {
      minWidth: 250
    }).bindLabel(label, {
      pane: 'popupPane'
    });

    // Store point so its popup can be accessed by openPopup()
    _points[data.station] = layer;
  };

  /**
   * Leaflet GeoJSON option: used for creating layers for GeoJSON points
   *
   * @param feature {Object}
   * @param latlng {L.LatLng}
   *
   * @return marker {L.Marker}
   */
  _pointToLayer = function (feature, latlng) {
    var color,
        key,
        marker,
        shape;

    color = _getColor(feature.properties.days);
    shape = _SHAPES[feature.properties.type];
    key = shape + '+' + color;

    _markerOptions.icon = Icon.getIcon(key);
    marker = L.marker(latlng, _markerOptions);

    // Group stations in separate layers by type
    _this.layers[color].addLayer(marker);
    _this.count[color] ++;

    _bounds.extend(latlng);

    return marker;
  };


  /**
   * Get bounds for station layers
   *
   * @return {L.LatLngBounds}
   */
  _this.getBounds = function () {
    return _bounds;
  };

  /**
   * Open popup for a given station
   *
   * @param station {String}
   */
  _this.openPopup = function (station) {
    _points[station].openPopup();
  };


  _initialize(options);
  options = null;
  return _this;
};


L.stationsLayer = StationsLayer;

module.exports = StationsLayer;
