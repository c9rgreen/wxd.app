/**
 * Initialize OpenStreetMap base layer
 */
function initBase(map) {
	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map);
}

/**
 * Fetch a list of the available radar maps
 */
async function fetchAvailableRadarMaps(rainviewer) {
	try {
		const response = await fetch(
			"https://api.rainviewer.com/public/weather-maps.json",
		);

		const data = await response.json();

		rainviewer.timestamps = data.radar.past;

		return data;
	} catch (error) {
		console.error("Error fetching list of available data:", error);
	}
}

/**
 * Fetch radar data and add layer to map
 */
function addRadarLayer(timestamp, rainviewer, map) {
	if (rainviewer.layer) {
		map.removeLayer(rainviewer.layer);
	}

	rainviewer.layer = L.tileLayer(
		`https://tilecache.rainviewer.com/v2/radar/${timestamp.time}/256/{z}/{x}/{y}/2/1_1.png`,
		{
			tileSize: 256,
			opacity: 0.6,
			attribution: '<a href="https://rainviewer.com">RainViewer</a>',
		},
	).addTo(map);
}

/**
 * Initialize the radar layer
 */
async function initRadar(map) {
	const rainviewer = {
		layer: null,
		animationPosition: 0,
		colorScheme: 1,
		timestamps: [],
		currentTimestamp: 0,
	};

	try {
		const data = await fetchAvailableRadarMaps(rainviewer);
		// Get the most recent timestamp
		const mostRecent = data.radar.past[data.radar.past.length - 1];

		addRadarLayer(mostRecent, rainviewer, map);
	} catch (error) {
		console.error("Error fetching radar layer:", error);
	}
}

/**
 * Add a list of locations as markers to the map
 */
function addMarkers(locations, map) {
	const icon = L.divIcon({
		className: "emoji-marker",
		html: `<div style="font-size: 30px; ">📍</div>`,
		iconSize: [30, 30],
		iconAnchor: [15, 30],
	});

	locations.forEach((location) => {
		L.marker([location.latitude, location.longitude], {
			icon: icon,
			title: location.code,
		})
			.addTo(map)
			.bindPopup(`
              <a href="/office/${location.code}/">
              <b>${location.code}</b><br>
              ${location.city}, ${location.state}<br>
              </a>
              ${location.formattedAddress}<br>
          `);
	});
}

/**
 * Fetch marker data and add the markers to the maps
 */
async function initMarkers(map) {
	try {
		const response = await fetch("/assets/data/offices.json");
		const data = await response.json();

		addMarkers(data, map);
	} catch (error) {
		console.error("Error fetching markers:", error);
	}
}

// Load map only if an element with the id "map" exists
if (document.getElementById("map")) {
	// Initialize map centered on North America
	const map = L.map("map").setView([40, -100], 5);

	initBase(map);
	initRadar(map);
	initMarkers(map);
}
