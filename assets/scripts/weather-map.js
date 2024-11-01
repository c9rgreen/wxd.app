// Initialize map centered on North America
const map = L.map("map").setView([40, -100], 5);

// Add OpenStreetMap base layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let rainviewer = {
  layer: null,
  animationPosition: 0,
  colorScheme: 1,
  timestamps: [],
  currentTimestamp: 0,
};

async function getRadarData() {
  try {
    const response = await fetch(
      "https://api.rainviewer.com/public/weather-maps.json"
    );
    const data = await response.json();
    rainviewer.timestamps = data.radar.past;
    return data;
  } catch (error) {
    console.error("Error fetching radar data:", error);
  }
}

function addLayer(timestamp) {
  if (rainviewer.layer) {
    map.removeLayer(rainviewer.layer);
  }

  rainviewer.layer = L.tileLayer(
    `https://tilecache.rainviewer.com/v2/radar/${timestamp.time}/256/{z}/{x}/{y}/2/1_1.png`,
    {
      tileSize: 256,
      opacity: 0.6,
      attribution: '<a href="https://rainviewer.com">RainViewer</a>',
    }
  ).addTo(map);
}

async function initialize() {
  const data = await getRadarData();
  if (data) {
    // Get the most recent timestamp
    const mostRecent = data.radar.past[data.radar.past.length - 1];
    addLayer(mostRecent);
  }
}

// Initialize the weather layer
initialize();

// Add layer controls
const baseMaps = {
  OpenStreetMap: L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  ),
};

// Add scale control
L.control.scale().addTo(map);

// Custom icon for weather offices
const pinIcon = L.divIcon({
  className: "emoji-marker",
  html: `<div style="font-size: 30px; ">📍</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

// Adds markers for weather office locations
function addLocationMarkers(locationsData) {
  // Add markers for each location
  locationsData.forEach((location) => {
    L.marker([location.latitude, location.longitude], {
      icon: pinIcon,
      title: location.code, // Adds a tooltip on hover
    }).addTo(map).bindPopup(`
                <a href="/office/${location.code}/">
                <b>${location.code}</b><br>
                ${location.city}, ${location.state}<br>
                </a>
                ${location.formattedAddress}<br>
            `);
  });
}

// Get weather office locations:
fetch("/assets/data/offices.json")
  .then((response) => {
    // Check if the response is OK (status in the range 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(addLocationMarkers)
  .catch((error) => {
    console.log(error);
  });
