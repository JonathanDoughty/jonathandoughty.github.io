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

var aboutText = `<div style="width:80vw height=90vh">
<p>
This map represents stopping points and significant features encountered during the
May 16 - 26 2024
<a href="https://www.roadscholar.org/find-an-adventure/2814/The-Best-of-Utah--s-Grand-Circle-of-Parks-and-Monuments" target="explainer">Road Scholar 2814 - The Best of Utah&rsquo;s Grand Circle of Parks and Monument</a>
trip visiting
<em>Snow Canyon State Park</em>,
<em>Zion National Park</em>,
<em>Bryce Canyon National Park</em>,
<em>Capitol Reef National Park</em>,
<em>Canyonlands National Park</em>,
<em>Arches National Park</em>,
<em>Monument Valley</em>,
<em>Colorado River</em>,
<em>Lake Powell</em>,
<em>Antelope Slot Canyon</em> and others.
</p>
<h2>Usage</h2>
<p>
The code arranges that the map will initially be zoomed to the geographic
extent of all the marker locations.
</p>
<p>
Markers that have not been clustered appear as blue bubbles - clicking one
of those will display a pop up of the marker&rsquo;s description. Markers that are in
close proximity to others will be clustered and colored to indicate the number
of markers at that location. Clicking on one of these will zoom the map to
enclose just those markers and expand the cluster into smaller clusters and
distinct markers.
</p>
<p>
Markers may have either the names of distinct features as provided by Open
Street Map or, in cases where I created a marker in the middle of nowhere,
whatever I managed to type to describe that location.
</p>
<p>
Select from a number of base maps using the layer chooser in the upper right corner.
</p>
<p>
Map Zoom levels can be manually controlled using the + and - controls in the upper left.
Clicking the reset button, enabled if you've changed things, will return the map to its
initial geographic extent and zoom level.
</p>
<h2>Credits / Nerdy Details</h2>
<p>
This map was made possible by the capabilities of several open-source projects:
</p>
<ul>
<li>
<a href="https://organicmaps.app/" target="explainer">Organic Maps</a> - a free mobile app
that provides offline map display and which I use to record "waypoints" wherever I stop on
a tour.
</li>
<li>
<a href="https://www.openstreetmap.org/about" target="explainer">Open Street Map data</a> -
which provides the known feature locations and descriptions that are
displayed and saved via Organic Maps.
</li>
<li>
<a href="https://leafletjs.com/" target="explainer">Leaflet</a> -
"an open-source JavaScript library for mobile-friendly interactive maps" - the fundamental
basis for this map&rsquo;s display.
</li>
<li>
The <a href="https://github.com/leaflet-extras/leaflet-providers" target="explainer"
>Leaflet-providers</a> extension for selected free base map tile providers - as shown in the
layer control on the upper right.
</li>
<li>
The <a href="https://github.com/Leaflet/Leaflet.markercluster" target="explainer"
>Marker Cluster</a>
Leaflet Plugin to aggregate markers that would appear too close to one another and
symbolize them as the numbered circles.
</li>
<li>
<a href="https://github.com/cliffcloud/Leaflet.EasyButton" target="explainer"
>EasyButton</a> a leaflet control to add buttons to provide the reset map and this popup display
capabilities.
</li>
<li>
<a href="https://pypi.org/project/kml2geojson/" target="explainer">kml2geojson</a>
- a Python library that I used to convert the
<a href="https://en.wikipedia.org/wiki/Keyhole_Markup_Language" target="explainer">KML</a>
format data that Organic Maps exports into the more browser / JavaScript friendly
<a href="https://en.wikipedia.org/wiki/GeoJSON" target="explainer">GeoJSON</a>
format that gets used as part of this Leaflet map display.
</li>
</ul>
<p>
That plus a bit of JavaScript coding to extract information from the marker
data and add those as pop up text descriptions for the markers as well as compose
the whole thing into a web accessible form and implement the extras.
</p>
</div>
</div>
`;

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

function addReset(map) {
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
                icon: '<svg fill="#000000" id="reset" width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 100 100" xml:space="preserve"><path d="M84.539,21.586c-0.007-0.562-0.321-1.083-0.825-1.337c-0.503-0.258-1.107-0.212-1.568,0.115l-5.944,4.261l-0.468,0.337 c-6.405-6.392-15.196-10.389-24.937-10.389c-19.535,0-35.427,15.894-35.427,35.428s15.893,35.428,35.427,35.428 c11.782,0,22.764-5.838,29.374-15.618c0.263-0.392,0.362-0.867,0.272-1.328c-0.09-0.461-0.357-0.871-0.747-1.134l-8.863-6.151 c-0.87-0.576-2.043-0.355-2.628,0.512c-3.918,5.792-10.41,9.25-17.375,9.25c-11.558,0-20.962-9.402-20.962-20.957 s9.404-20.957,20.962-20.957c4.878,0,9.352,1.696,12.914,4.5l-1.001,0.72l-5.948,4.26c-0.455,0.328-0.696,0.89-0.611,1.448 c0.081,0.558,0.47,1.028,1.008,1.208l25.446,8.669c0.461,0.161,0.966,0.083,1.368-0.203c0.399-0.29,0.629-0.747,0.627-1.231 L84.539,21.586z"/>',
                title: 'Reset to initial view',
                onClick: function(){
                    if (map.getZoom() != initialZoom) {
                        map.setView(center, initialZoom);
                    }
                }
            }
        ]
    });

    resetButton.addTo(map);
    resetButton.disable();
    map.on('zoomend',function(e) {
	var currZoom = e.target.getZoom();
        if(currZoom == initialZoom) {
            resetButton.disable();
        } else {
            resetButton.enable();
        }
    });
}

function addAbout(map) {
    var dimensions = sizes();

    var popup = L.popup({
        maxHeight: dimensions.windowHeight * .5,
        maxWidth: dimensions.windowWidth * .75,
        keepInView: true,
        autoPan: false
    }).setContent(aboutText);

    var aboutButton = L.easyButton({
        id: 'about',
        //leafletClasses: false,
        states:[
            {
                // SVG adapted from https://www.svgrepo.com/svg/470973/annotation-question
                icon: '<svg id="about" width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 8.50224C10.1762 8.00136 10.524 7.579 10.9817 7.30998C11.4395 7.04095 11.9777 6.9426 12.501 7.03237C13.0243 7.12213 13.499 7.39421 13.8409 7.80041C14.1829 8.20661 14.37 8.72072 14.3692 9.25168C14.3692 10.7506 12.1209 11.5 12.1209 11.5M12.1499 14.5H12.1599M9.9 19.2L11.36 21.1467C11.5771 21.4362 11.6857 21.5809 11.8188 21.6327C11.9353 21.678 12.0647 21.678 12.1812 21.6327C12.3143 21.5809 12.4229 21.4362 12.64 21.1467L14.1 19.2C14.3931 18.8091 14.5397 18.6137 14.7185 18.4645C14.9569 18.2656 15.2383 18.1248 15.5405 18.0535C15.7671 18 16.0114 18 16.5 18C17.8978 18 18.5967 18 19.1481 17.7716C19.8831 17.4672 20.4672 16.8831 20.7716 16.1481C21 15.5967 21 14.8978 21 13.5V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V13.5C3 14.8978 3 15.5967 3.22836 16.1481C3.53284 16.8831 4.11687 17.4672 4.85195 17.7716C5.40326 18 6.10218 18 7.5 18C7.98858 18 8.23287 18 8.45951 18.0535C8.76169 18.1248 9.04312 18.2656 9.2815 18.4645C9.46028 18.6137 9.60685 18.8091 9.9 19.2Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
                title: 'About this map',
                onClick: function() {
                    // Center the popup on the bottom half of the app: on small devices too
                    // close to the top and the close button will be occluded by the layer
                    // switcher. Too close to the bottom and the scale bar will cut off the
                    // last words.
                    var center = map.getCenter();
                    var latLngBnds = map.getBounds();
                    var latLong = L.latLng(latLngBnds.getSouth(), center.lng);
                    var point = map.latLngToLayerPoint(latLong);
                    var offset = dimensions.windowHeight * .075;
                    var popupPoint = L.point(point.x, point.y - offset);
                    var popupPosition = map.layerPointToLatLng(popupPoint);
                    popup.setLatLng(popupPosition).openOn(map);
                }
            }
        ]
    });
    aboutButton.addTo(map);
}

function sizes() {
    // https://stackoverflow.com/a/62278401
    const contentWidth = [...document.body.children].reduce(
        (a, el) => Math.max(a, el.getBoundingClientRect().right), 0)
          - document.body.getBoundingClientRect().x;

    return {
        windowWidth:  document.documentElement.clientWidth,
        windowHeight: document.documentElement.clientHeight,
        pageWidth:    Math.min(document.body.scrollWidth, contentWidth),
        pageHeight:   document.body.scrollHeight,
        screenWidth:  window.screen.width,
        screenHeight: window.screen.height,
        pageX:        document.body.getBoundingClientRect().x,
        pageY:        document.body.getBoundingClientRect().y,
        screenX:     -window.screenX,
        screenY:     -window.screenY - (window.outerHeight-window.innerHeight),
    }
}

function composeMap(map, baseMaps, defaultBaseLayer, markers) {

    L.control.layers(baseMaps).addTo(map);
    baseMaps[defaultBaseLayer].addTo(map);

    addMarkersToMap(map, markers);

    addReset(map);

    addAbout(map);

    // Every map wants a scale bar, no?
    L.control.scale({position: 'bottomright'}).addTo(map);
}

composeMap(scholarMap, baseLayers, defaultBaseLayer, markerData);
