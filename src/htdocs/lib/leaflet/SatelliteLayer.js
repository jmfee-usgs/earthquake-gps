'use strict';

var L = require('leaflet'),
    Util = require('util/Util');

/**
 * Factory for Satellite base layer
 *
 * @param provider {String} default is 'esri'
 * @param options {Object}
 *        Leaflet tileLayer options
 *
 * @return {Object}
 *         Leaflet tileLayer
 */
var SatelliteLayer = function (provider, options) {
  var _providers,
      _url;

  _providers = {
    esri: {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, ' +
        'USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the ' +
        'GIS User Community',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    },
    mapquest: {
      attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> ' +
        '&mdash; Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of ' +
        'Agriculture, Farm Service Agency',
      subdomains: '1234',
      url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg'
    }
  };

  provider = provider || 'esri';
  options = Util.extend(_providers[provider], {
    detectRetina: false
  }, options);

  _url = _providers[provider].url;

  return L.tileLayer(_url, options);
};

L.satelliteLayer = SatelliteLayer;

module.exports = SatelliteLayer;
