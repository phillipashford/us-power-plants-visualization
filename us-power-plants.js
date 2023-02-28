		// map options
		var options = {
			center: [38, -95],
			zoom: 4
		}

		// create a Leaflet map in our division container with id of 'map'
		var map = L.map('map', options);


		var Esri_WorldGrayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
			maxZoom: 16
		}).addTo(map);



		////////////////////////////////////////////////////////
		//Code I used to identify all of the unique key names in the fuel_source objects across the geoJSON
		// var plantsFeatures = plants.features;

		// var fuelSourceKeys = plantsFeatures.reduce(function (keys, feature) {
		// 	for (var key in feature.properties.fuel_source) {
		// 		if (keys.indexOf(key) === -1) {
		// 			keys.push(key);
		// 		}
		// 	}
		// 	return keys;
		// }, []);

		// console.log(fuelSourceKeys);
		// Console output //
		// Array(13) [ "Hydro", "Coal", "Natural Gas", "Petroleum", "Nuclear", "Wind", "Pumped Storage", "Solar", "Geothermal", "Biomass", … ]

		var renewables = ["Hydro", "Wind", "Pumped Storage", "Solar", "Geothermal", "Biomass", "Wood"];

		var nonRenewables = ["Coal", "Natural Gas", "Petroleum", "Nuclear", "Other Fossil Gasses"];

		// I did not visualize the generic 'other' category
		var other = ["Other"];
		////////////////////////////////////////////////////////

		// Define a GeoJSON layer for renewable plants
		var renewablePlants = L.geoJson(plants, {

			// Filter the features to show only those with renewable fuel sources
			filter: function (feature) {
				for (var key in feature.properties.fuel_source) {

					// Determine the fuel source with the highest value for this feature
					var highestValue = 0;
					var highestKey = '';

					if (feature.properties.fuel_source[key] > highestValue) {
						highestValue = feature.properties.fuel_source[key];
						highestKey = key;
					}

					// Check if the highest value fuel source is in the renewables array
					if (renewables.indexOf(key) !== -1 && highestKey == [key]) {
						return feature;
					} else { }
				}

			},

			// Add popup and interaction functionality for each feature
			onEachFeature: function (feature, layer) {

				// Highlight the feature on mouseover
				layer.on('mouseover', function () {
					layer.setStyle({
						fillColor: 'rgb(234, 227, 173)'
					});
				}),

					// Reset the style on mouseout
					layer.on('mouseout', function () {
						layer.setStyle({
							fillColor: 'green'
						});
					});

				// Create a popup with information about the feature
				var popup = `<p><b>${layer.feature.properties.plant_name}</b><br>
	${(Math.ceil(layer.feature.properties.capacity_mw).toLocaleString())} MW<br>`;

				for (var key in feature.properties.fuel_source) {
					popup += `<b>${key}</b>: ${Math.ceil(feature.properties.fuel_source[key]).toLocaleString()} MW<br>`;
				};

				popup += `</p>`;

				layer.bindPopup(popup).openPopup();
			},

			// Define the style for the features
			style: function (feature) {
				return {
					color: 'green',
					weight: 1,
					fillColor: 'green',
					fillOpacity: .6,
					radius: getRadius(feature.properties.capacity_mw)
				}
			},

			// Define the point-to-layer conversion function
			pointToLayer: function (feature, latlng) {
				return L.circleMarker(latlng);
			},

		}).addTo(map);

		// Create a GeoJSON layer for non-renewable plants using L.geoJson
		var nonRenewablePlants = L.geoJson(plants, {
			// Filter the features to show only those with non-renewable fuel sources
			filter: function (feature) {
				for (var key in feature.properties.fuel_source) {
					var highestValue = 0;
					var highestKey = '';
					// Find the highest value and its corresponding key in the fuel source object
					if (feature.properties.fuel_source[key] > highestValue) {
						highestValue = feature.properties.fuel_source[key];
						highestKey = key;
					}
					// Check if the key is in the nonRenewables array and matches the highestKey
					if (nonRenewables.indexOf(key) !== -1 && highestKey == [key]) {
						return feature;
					} else { }
				}
			},
			// Define what happens when a feature is clicked on
			onEachFeature: function (feature, layer) {
				// Change marker color on mouseover and mouseout
				layer.on('mouseover', function () {
					layer.setStyle({
						fillColor: 'rgb(234, 227, 173)'
					});
				}),
					layer.on('mouseout', function () {
						layer.setStyle({
							fillColor: 'brown'
						});
					});
				// Create a popup for each feature with capacity and fuel source information
				var popup = `<p><b>${layer.feature.properties.plant_name}</b><br>
        ${(Math.ceil(layer.feature.properties.capacity_mw).toLocaleString())} MW<br>`;
				for (var key in feature.properties.fuel_source) {
					popup += `<b>${key}</b>: ${Math.ceil(feature.properties.fuel_source[key]).toLocaleString()} MW<br>`;
				};
				popup += `</p>`;
				layer.bindPopup(popup).openPopup();
			},
			// Define style for each feature
			style: function (feature) {
				return {
					color: 'brown',
					weight: 1,
					fillColor: 'brown',
					fillOpacity: .6,
					radius: getRadius(feature.properties.capacity_mw)
				}
			},
			// Define the point-to-layer conversion function
			pointToLayer: function (feature, latlng) {
				return L.circleMarker(latlng);
			},
		});


		// Calculates radius as a ratio of energy output based on area, adjusted for values in data set, and returns radius
		function getRadius(area) {
			var radius = Math.sqrt(area / Math.PI);
			return radius * .6;
		}

		const renewablesButton = document.getElementById('renewables-button');
		const nonRenewablesButton = document.getElementById('non-renewables-button');

		renewablesButton.addEventListener('click', function () {
			// Check if the layer is currently on the map
			if (map.hasLayer(renewablePlants)) {
				// If it is, remove it from the map
				map.removeLayer(renewablePlants);
			} else {
				// If it's not, add it to the map
				renewablePlants.addTo(map);
			}
		});

		nonRenewablesButton.addEventListener('click', function () {
			// Check if the layer is currently on the map
			if (map.hasLayer(nonRenewablePlants)) {
				// If it is, remove it from the map
				map.removeLayer(nonRenewablePlants);
			} else {
				// If it's not, add it to the map
				nonRenewablePlants.addTo(map);
			}
		});