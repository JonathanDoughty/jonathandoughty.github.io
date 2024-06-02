// Road Scholar trip marker display
// Copyright (c) 2024, JonathanDoughty
// See LICENCE

var scholarMap = L.map('map-id');
var reset;

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

L.control.layers(baseLayers).addTo(scholarMap);
baseLayers['USGS Topo'].addTo(scholarMap);

function colorBy(feature) {
    // Not currently used; intended to color markers by some characteristic
    const reg = /\..*/;
    var year = feature.properties.Id.replace(reg, '');
    const colors = ["#3a8059", "#85bf9b", "#abdebc", "#dae1da", "#d1d0e7", "#aeb0d3", "#8a8fbf", "#434e96"];
    switch (year) {
    case '1991': case '1992': case '1993': case '1994':
        return {color: colors[0]};
    case '1995': case '1996': case '1997': case '1998': case '1999':
        return {color: colors[1]};
    case '2000': case '2001': case '2002': case '2003': case '2004':
        return {color: colors[2]};
    case '2005': case '2006': case '2007': case '2008': case '2009':
        return {color: colors[3]};
    case '2010': case '2011': case '2012': case '2013': case '2014':
        return {color: colors[4]};
    case '2015': case '2016': case '2017': case '2018': case '2019':
        return {color: colors[5]};
    case '2020': case '2021': case '2022': case '2023': case '2024':
        return {color: colors[6]};
    case '2025': case '2026': case '2027': case '2028': case '2029': default:
        return {color: colors[7]};
  }
}

function popupContent(props) {
  var popupText = `<p><strong>${props.name}</strong>`;
  if (props.undefined) {        // doesn't seem to be anything else useful
    popupText += `<br/>${props.undefined},`;
  } else {
    popupText += '<br/>';
  }
  return popupText;
}

function onEachKMLFeature(feature, layer) {
  //feature.color = colorBy(feature);
  if (feature.properties) {
    layer.bindPopup(popupContent(feature.properties));
  }
}

function composeMap() {
    // Arrange that markers in the approximately same location will get clustered
    var clusters = L.markerClusterGroup();

    // ... and add markers for what remains
    markerLayer = L.geoJSON(waypoints, {
        onEachFeature: onEachKMLFeature
    });

    // Cluster the markers
    markerLayer.addTo(clusters);

    // Add the clusters to the map
    scholarMap.addLayer(clusters);

    // And fit the map to the markers' extent
    scholarMap.fitBounds(markerLayer.getBounds())

    reset = {
        zoom: scholarMap.getZoom(),
        center: scholarMap.getCenter(),
    }

    // Every map wants a scale bar, no?
    L.control.scale().addTo(scholarMap);
}

composeMap();
