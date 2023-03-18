
// Create a Leaflet map object
var map = L.map('map', {
    center: [36, -94],
    zoom: 4,
});

// Create a tile layer object
var tiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 19
});

// Add the tile layer to the map object
tiles.addTo(map);

// Get references to HTML elements for displaying statistics
var statsList = document.getElementById("stats");
var statsHeader = document.getElementById("stats-header")
var statsSvg;

// Define common styles for GeoJSON layers
var commonStyles = {
    weight: 1,
    stroke: 1,
    fillOpacity: .8
}

// Define an object of layer information for each energy source
var layerInfo = {
    "Hydro": { color: '#1f78b4' },
    "Wind": { color: '#6baed6' },
    "Solar": { color: '#fd8d3c' },
    "Pumped Storage": { color: '#4daf4a' },
    "Geothermal": { color: '#8c6bb1' },
    "Biomass": { color: '#bd9e39' },
    "Wood": { color: '#a1d99b' },
    "Coal": { color: '#bdbdbd' },
    "Natural Gas": { color: '#e6550d' },
    "Petroleum": { color: '#de2d26' },
    "Nuclear": { color: '#6a3d9a' },
    "Other Fossil Gasses": { color: '#fdae6b' },
    "Other": { color: '#636363' }
};

// Create an empty object to store GeoJSON layers for each energy source
var geoJsonLayers = {};

// Iterate through each energy source in the layerInfo object and create a GeoJSON layer for each one
for (var layer in layerInfo) {
    geoJsonLayers[layer] = L.geoJson(plants, {
        pointToLayer: function (feature, latlng) {
            // Create a circular marker for each feature (of each layer) with the common styles
            return L.circleMarker(latlng, commonStyles);
        },
        filter: function (feature) {
            // Filter out features that do not have the current for loop's iteration energy source in their fuel sources
            if (feature.properties.fuel_source[layer]) {
                return feature;
            }
        },
        style: function (feature) {
            // Set the style for each feature based on the current energy source's color and the feature's fuel source value for that energy source
            return {
                color: layerInfo[layer].color,
                fillColor: layerInfo[layer].color,
                radius: getRadius(feature.properties.fuel_source[layer])
            }
        },
        onEachFeature: function (feature, layer) {
            // Initialize tooltips for each feature
            content = initTooltips(feature, layer);
            layer.bindTooltip(content);

        }
    }).addTo(map);

}

// Create an empty dictionary to store key-value pairs for Leaflet's layer control
var sourcesLayers = {};

// Iterate through each energy source in the layerInfo object and add a key-value pair to the sourcesLayers object
for (var key in layerInfo) {
    // The key is an HTML string with the energy source name colored with the corresponding color, and the value is the corresponding GeoJSON layer from the geoJsonLayers object
    sourcesLayers[`<span style='color:${layerInfo[key].color}'><b>${key}</b></span>`] = geoJsonLayers[key];
}

// Add a layer control to the map object with the sourcesLayers object as the overlay layers
var layerControl = L.control.layers(null, sourcesLayers, { collapsed: true }).addTo(map);


// <input type="checkbox" id="layer1" name="Layer1" oninput="toggleLayer(this)"><label for="layer1"> LAYER 1 </label>

// function toggleLayer(element) {
//   if (element.checked) {
//     if (!map.hasLayer(OpenRailwayMap)) map.addLayer(OpenRailwayMap);
//     }
//   else {
//     if (map.hasLayer(OpenRailwayMap)) map.removeLayer(OpenRailwayMap);
//   }
// }
// document.getElementById('layer1').checked = map.hasLayer(OpenRailwayMap);

// Uncheck the checkbox for an unchecked layer

// for (var i = 0; i < layerControl._layers, i++) {
//         layerControl._layers[0][L.stamp(geoJsonLayers[key])].layer._input.checked = false;    
// }

// Add an event listener to the map that triggers when the map is clicked
map.on('click', function (e) {
    var stats = {}; // Create object to sum MW values
    var statsContent = ''; // Assign variable to hold popup content
    var total = 0; // Assign variable to hold count of total MW in area of interest
    var proxPlants = []; //Create array to hold latlng coordinates of all plants in the area of interest

    // Set the center of the radiusCircle to the current click point and add it to the map
    radiusCircle.setLatLng(e.latlng)
        .addTo(map);

    // Loop through each energy source in the layerInfo object
    for (var gsLayer in layerInfo) {
        // Loop through each layer in the corresponding geoJsonLayers object
        geoJsonLayers[gsLayer].eachLayer(function (layer) {
            // Calculate the distance between the current layer and the click point, in kilometers
            var distance = e.latlng.distanceTo(layer.getLatLng()) / 1000;


            // If the distance is greater than 500 km, hide the layer
            if (distance > 500) {
                layer.setStyle({
                    stroke: false,
                    fill: false
                });
            } else {
                // Otherwise, add the layer's coordinates to the proxPlants array and show the layer
                proxPlants.push(layer.getLatLng());
                layer.setStyle({
                    stroke: true,
                    fill: true
                });

                // Generate content for the tooltip popup
                content = initTooltips(layer.feature, layer);

                // Add additional content to the tooltip popup
                content += `${Math.ceil(distance)} km from the click point.<br>`

                // Set the tooltip content for the layer to the generated content   
                layer.setTooltipContent(content);

                // Get the properties for each geojson feature
                var props = layer.feature.properties;

                // Loop through all fuel sources for the current layer and update the stats object with their output values
                for (var source in props.fuel_source) {
                    total += props.fuel_source[source]
                    if (stats[source]) {
                        stats[source].output += props.fuel_source[source];
                    } else {
                        stats[source] = {
                            output: props.fuel_source[source],
                            color: layerInfo[source].color
                        }
                    }
                }
                // Add a "Total" key-value pair to the stats object
                stats["Total"] = Math.ceil(total);
            }
        });
    }

    // Create array to hold objects to generate piechart svg
    var svgData = [];

    // Loop through each energy source in the stats object and generate content for the stats section
    for (var stat in stats) {
        // Make sure not to include the "Total" key
        if (stat != "Total") {
            statsContent += `<b style='color:${stats[stat].color}'>${stat}:</b><br> 
      ${Math.ceil(stats[stat].output).toLocaleString()} MW<br>
      <b>(${(Math.ceil((stats[stat].output / stats.Total) * 100)).toLocaleString()}%)</b> <br><br>`;

            // Populate svgData array with objects to generate piechart svg
            // Add an object to the svgData array for each fuel source in the stats object
            svgData.push(
                {
                    label: stat,
                    value: stats[stat].output,
                    color: stats[stat].color
                }
            )
        }
    }

    // Add a piechart svg to the stats section for the plants within the radius
    statsSvg = document.getElementById('stats-svg');
    statsSvg.innerHTML = createPieChart(svgData).outerHTML;


    // Add the "Total" line to the stats section
    statsContent += `<b>TOTAL: </b> ${stats.Total.toLocaleString()} MW`

    // Set the stats section content to the generated content
    // Add stats for plants in radius, to the stats section 
    statsList.innerHTML = statsContent;

    //Update stats header with coords of click
    // Update the stats header with the latitude and longitude of the click point
    statsHeader.innerHTML = `<span>Within 500km of Latitude: ${Math.ceil(e.latlng.lat)} and Longitude: ${Math.ceil(e.latlng.lng)}`;

    // Fly to bounds defined by coords of plants in radius  
    map.flyToBounds(proxPlants);
});

// Create a circle with a 500 km radius, initially centered at [0, 0], with yellow outline
var radiusCircle = L.circle([0, 0], 500000, {
    fillColor: 'white',
    fillOpacity: .1,
    color: 'yellow',
    opacity: .3,
    stroke: false,
    weight: 3,
    interactive: false // This allows users to click through the circle
});

// Reset Layers

// Get the reset button element and add a click event listener
const resetButton = document.getElementById('reset');

L.DomEvent.on(resetButton, 'click', function (ev) {
    // Stops the click event from propogating to the reset button's parent element (the map).
    L.DomEvent.stopPropagation(ev);

    // Loop through each layer and reset the styles and tooltips
    for (var gsLayer in layerInfo) {
        geoJsonLayers[gsLayer].eachLayer(function (layer) {

            // displays all features
            layer.setStyle({
                stroke: true,
                fill: true
            });

            // resets tooltips
            content = initTooltips(layer.feature, layer);
            layer.bindTooltip(content);

        });
    }

    // Remove the radius circle and reset the stats section content
    radiusCircle.removeFrom(map);

    statsHeader.innerHTML = `Click Any Location on the Map to Discover Energy Source Statistics`;

    statsSvg.innerHTML = '';
    stats.innerHTML = '';
    statsList.innerHTML = '';

    // Set the map view to the default location and zoom level
    map.setView([36, -94], 4);

}); // End reset layers

// Function to calculate the radius of a circle based on a given value
function getRadius(val) {
    var radius = Math.sqrt(val / Math.PI);
    // Adjusts for map values and returns radius
    return radius * .8;
}

// Function to initialize tooltips for a given feature and layer
function initTooltips(feature, layer) {
    // Get the properties for each geojson feature
    var props = layer.feature.properties;

    // Assign powr plant name and energy output to content variable. 
    var content = `<h3>${props.plant_name}</h3>`;

    for (var type in props.fuel_source) {
        content += `<span style='color:${layerInfo[type].color}'>${type}:</span> 
                                  ${props.fuel_source[type].toLocaleString()} MW<br>`;
    }

    // Some plants have more than one fuel source
    // If so...
    if (Object.keys(props.fuel_source).length > 1) {
        // Find the most dominant... 
        var compare = 0
        var dominant = ''
        for (var type in props.fuel_source) {

            if (props.fuel_source[type] > compare) {
                compare = props.fuel_source[type]
                dominant = type;
            }
        }
        // And add it to the popup
        content += `Primarily a ${dominant} plant.</span><br>`;
    }


    return content;
} // end initTooltips