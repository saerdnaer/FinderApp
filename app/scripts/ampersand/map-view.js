'use strict';

var L = require('leaflet');
L.Icon.Default.imagePath = '/images/leaflet';
var AmpersandView = require('ampersand-view');
var template = require('./templates/map');
var apikey = 'a5fdf236c7fb42d794a43e94be030fb2';
var DeactivatedIcon = L.Icon.Default.extend({
  options: {
    iconUrl: '/images/leaflet/marker-icon_deact.png',
    iconRetinaUrl: '/images/leaflet/marker-icon-2x_deact.png'
  }
});

module.exports = AmpersandView.extend({
  autoRender: true,
  template: template,

  initialize: function() {
    this.listenTo(this.collection, 'sync', this.addMarkers);
    this.listenTo(this.collection, 'change:selectedNode', this.showSelected);
    this.listenTo(app.user, 'change:position', this.setUserPosition);
    this.deactivatedIcon = new DeactivatedIcon();
  },

  render: function() {
    this.renderWithTemplate();
  },

  renderMap: function() {
    this.map = L.map(this.queryByHook('map'), {zoomControl: false});
    new L.Control.Zoom({position: 'bottomright'}).addTo(this.map);
    var tp;

    if (L.Browser.retina) {
      tp = 'lr';
    }
    else {
      tp = 'ls';
    }

    L.tileLayer('http://tiles.lyrk.org/' + tp + '/{z}/{x}/{y}?apikey=' + apikey,
     {
       attribution: '| Data: ' +
                    '<a href="http://www.overpass-api.de/">OverpassAPI</a>' +
                    ' OpenStreetMap | <a href="http://geodienste.lyrk.de/" ' +
                    'target="_blank">Tiles by Lyrk</a> | <a href="http://' +
                    'geodienste.lyrk.de/copyright">Lizenzinformationen</a>' +
                    '</div>',
       maxZoom: 18
     }).addTo(this.map);

    this.map.on('locationfound', this.setUserPosition, this);
    this.map.locate({setView: true, maxZoom: 16});
  },

  addMarkers: function(e) {
    if (this.markers) {
      this.map.removeLayer(this.markers);
    }

    this.markers = new L.FeatureGroup();
    this.map.addLayer(this.markers);

    this.collection.each(function(mapNode, index) {
      if (this.collection.selectedNode) {
        if (mapNode === this.collection.selectedNode) {
          this.addMarker(mapNode);
        } else {
          this.addMarker(mapNode, {deactivated: true});
        }
      } else {
        this.addMarker(mapNode);
      }

    }, this);
  },

  addMarker: function(mapNode, markerOptions)  {
    var options = markerOptions || {};
    var marker;
    var coords = mapNode.toCoords();

    if (options.deactivated === true) {
      marker = L.marker([coords.lat, coords.lon], {icon: this.deactivatedIcon});
    } else {
      marker = L.marker([coords.lat, coords.lon]);
    }

    marker.addTo(this.markers);

    marker.on('click', function() {
      app.user.targetId = mapNode.osmId;
    });

    if (options.popupText) {
      marker.bindPopup(options.popupText);
    }
  },

  setUserPosition: function() {
    if (app.user.position) {
      var coords = app.user.position.coords;

      // For now update accuracy but do not reset view
      // this.map.setView([coords.latitude, coords.longitude]);

      var rad = coords.accuracy / 2;

      if (this.posMarker) {
        this.map.removeLayer(this.posMarker);
      }

      this.posMarker = new L.Circle([coords.latitude, coords.longitude], rad);
      this.map.addLayer(this.posMarker);
    }
  },

  showDetails: function() {
    this.el.classList.add('map-card--full');
    this.map.invalidateSize(true);
  },

  showSelected: function() {
    var paddingTop = 155;
    var paddingBottom = 10;

    this.addMarkers();
    var selectedNode = this.collection.selectedNode;

    var mapBounds = new L.LatLngBounds([[selectedNode.lat, selectedNode.lon],
      [app.user.position.coords.latitude, app.user.position.coords.longitude]]);

    this.map.fitBounds(mapBounds, {
      animate: true,
      paddingTopLeft: [0, paddingTop],
      paddingBottomRight: [0, paddingBottom],
    });
  }
});
