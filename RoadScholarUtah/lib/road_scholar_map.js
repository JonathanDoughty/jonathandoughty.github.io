// Road Scholar trip marker display
// Copyright (c) 2024, JonathanDoughty
// See LICENCE

var scholarMap = L.map('map-id');
var markerData = waypoints_Utah2024_05; // from Utah204505.js

// Base Maps
// Selected from https://leaflet-extras.github.io/leaflet-providers/preview/index.html

var provider = L.tileLayer.provider;
var baseLayers = {
    'CartoDB': provider('CartoDB.Voyager'),
    'OpenStreetMap': provider('OpenStreetMap.Mapnik'),
    'Esri Topo': provider('Esri.WorldTopoMap'),
    'Esri Imagery': provider('Esri.WorldImagery'),
    'USGS Imagery Topo': provider('USGS.USImageryTopo'),
    'USGS Topo': provider('USGS.USTopo'),
};
var defaultBaseLayer = 'USGS Topo';


function popupContent(props) {
  var popupText = `<p><strong>${props.name}</strong>`;
  if (props.undefined) {        // doesn't seem to be anything else useful
    popupText += `<br/>${props.undefined},`;
  } else {
    popupText += '<br/>';
  }
  popupText += '</p>';
  return popupText;
}

function onEachKMLFeature(feature, layer) {
  if (feature.properties) {
    layer.bindPopup(popupContent(feature.properties));
  }
}

function addMarkersToMap(map, markers) {

  // Arrange that markers in the approximately same location will get clustered
  var clusters = L.markerClusterGroup();

  // ... and add markers for each feature
  var markerLayer = L.geoJSON(markers, {
    onEachFeature: onEachKMLFeature
  });

  // Cluster the markers
  markerLayer.addTo(clusters);

  // Add the clusters to the map
  map.addLayer(clusters);

  // And fit the map to the markers' extent
  map.fitBounds(markerLayer.getBounds())
}

function composeMap(map, baseMaps, defaultBaseLayer, markers) {

  L.control.layers(baseMaps).addTo(map);
  baseMaps[defaultBaseLayer].addTo(map);

  addMarkersToMap(map, markers);

  // Add a reset control
  var center = map.getCenter();
  var initialZoom = map.getZoom();
  var resetButton = L.easyButton({
    id: 'reset',
    //leafletClasses: false,
    states:[
      {
        stateName: 'reset-zoom',
        // SVG adapted from https://www.svgrepo.com/svg/373103/refresh
        // Note -10 viewbox
        icon: '<svg fill="#000000" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="22px" height="22px" viewBox="0 -10 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path d="M84.539,21.586c-0.007-0.562-0.321-1.083-0.825-1.337c-0.503-0.258-1.107-0.212-1.568,0.115l-5.944,4.261l-0.468,0.337 c-6.405-6.392-15.196-10.389-24.937-10.389c-19.535,0-35.427,15.894-35.427,35.428s15.893,35.428,35.427,35.428	c11.782,0,22.764-5.838,29.374-15.618c0.263-0.392,0.362-0.867,0.272-1.328c-0.09-0.461-0.357-0.871-0.747-1.134l-8.863-6.151	c-0.87-0.576-2.043-0.355-2.628,0.512c-3.918,5.792-10.41,9.25-17.375,9.25c-11.558,0-20.962-9.402-20.962-20.957	s9.404-20.957,20.962-20.957c4.878,0,9.352,1.696,12.914,4.5l-1.001,0.72l-5.948,4.26c-0.455,0.328-0.696,0.89-0.611,1.448	c0.081,0.558,0.47,1.028,1.008,1.208l25.446,8.669c0.461,0.161,0.966,0.083,1.368-0.203c0.399-0.29,0.629-0.747,0.627-1.231	L84.539,21.586z"/>',
        title: 'Reset to initial view',
        onClick: function(){
          if (map.getZoom() != initialZoom) {
            map.setView(center, initialZoom);
          }
        }
      }
    ]
  });

  map.on('zoomend',function(e){
	  var currZoom = e.target.getZoom();
    if(currZoom == initialZoom) {
      resetButton.disable();
    } else {
      resetButton.enable();
    }
  });

  var extraControls = L.easyBar([resetButton]);
  extraControls.addTo(map);
  resetButton.disable();

  // Every map wants a scale bar, no?
  L.control.scale({position: 'bottomright'}).addTo(map);
}

composeMap(scholarMap, baseLayers, defaultBaseLayer, markerData);
