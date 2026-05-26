const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, "public");
const USER_AGENT = "GreenPath/1.0 local Node.js app";
const APP_VERSION = "green-path-v14";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const homePage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Green Path</title>
    <link rel="stylesheet" href="/styles.css?v=${APP_VERSION}" />
    <link rel="manifest" href="/manifest.json" />
  </head>
  <body>
    <main class="page-shell">
      <section class="home-panel" aria-labelledby="page-title">
        <div class="top-bar">
          <span class="brand-mark" aria-hidden="true"></span>
          <label class="language-control" for="languageSelect">
            <span data-i18n="languageLabel">Language</span>
            <select id="languageSelect" aria-label="Choose language">
              <option value="en">English</option>
              <option value="kn">ಕನ್ನಡ</option>
              <option value="hi">हिन्दी</option>
            </select>
          </label>
        </div>

        <header class="hero-copy">
          <h1 id="page-title" data-i18n="title">Welcome to Green Path</h1>
        </header>

        <form class="route-form" id="routeForm">
          <div class="form-fields">
            <section class="form-section">
              <div class="field-row">
                <label class="field-label" for="regionInput" data-i18n="regionLabel">Enter your region</label>
                <div class="input-action">
                  <input id="regionInput" name="region" autocomplete="address-level2" />
                  <button class="text-button" type="button" id="getLocationBtn" data-i18n="getButton">Get</button>
                </div>
                <button class="circle-talk-button" type="button" data-talk="region" data-i18n-aria="regionTalkLabel" aria-label="Talk back region"></button>
              </div>
              <p class="helper-text" id="locationStatus" data-i18n="locationHint">
                Use Get to detect the exact location of this device.
              </p>
            </section>

            <section class="form-section">
              <div class="field-row">
                <label class="field-label" for="destinationSelect" data-i18n="destinationLabel">
                  Tell me where you want to go
                </label>
                <select id="destinationSelect" name="destination">
                  <option value="" data-i18n="destinationPlaceholder">Select a destination</option>
                </select>
                <button class="circle-talk-button" type="button" data-talk="destination" data-i18n-aria="destinationTalkLabel" aria-label="Talk back destination"></button>
              </div>
              <p class="helper-text" id="destinationStatus" data-i18n="destinationHint">
                Rural areas for the selected region will load here.
              </p>
            </section>

            <section class="submit-row">
              <button class="submit-button" type="submit" data-i18n="submitButton">Submit</button>
              <button class="circle-talk-button small-circle" type="button" data-talk="submit" data-i18n-aria="submitTalkLabel" aria-label="Talk back submit"></button>
            </section>
          </div>
        </form>

        <section class="result-strip" id="routeResult" aria-live="polite"></section>
      </section>

      <section class="decision-panel is-hidden" id="decisionPage" aria-label="Green Path decision dashboard">
        <div class="decision-content">
          <div class="decision-language-row">
            <label class="language-control decision-language-control" for="decisionLanguageSelect">
              <span data-i18n="languageLabel">Language</span>
              <select id="decisionLanguageSelect" aria-label="Choose language">
                <option value="en">English</option>
                <option value="kn">ಕನ್ನಡ</option>
                <option value="hi">हिन्दी</option>
              </select>
            </label>
          </div>

          <div class="live-alert-banner" id="liveAlertBanner">
            <div>
              <strong data-i18n="liveAlertLabel">LIVE ALERT:</strong>
              <span id="liveAlertText">Moderate PM2.5 detected near selected region. Sensitive groups should reduce outdoor exposure.</span>
            </div>
            <button type="button" id="closeLiveAlert" aria-label="Close live alert">×</button>
          </div>

          <div class="decision-copy">
            <div class="decision-group">
              <p class="decision-label">🌐 <span data-i18n="regionSelectedLabel">Region Selected:</span></p>
              <p class="decision-value" id="summaryRegion">-</p>
            </div>

            <div class="decision-group">
              <p class="decision-label">📍 <span data-i18n="destinationSummaryLabel">Destination:</span></p>
              <p class="decision-value" id="summaryDestination">-</p>
            </div>

            <article class="aqi-card" id="aqiCard">
              <h3>🚦 <span data-i18n="aqiCardTitle">AIR QUALITY STATUS CARD</span></h3>
              <p data-i18n="largeColorCard">Large color card:</p>
              <ul>
                <li><span data-i18n="aqiLabel">AQI:</span> <strong id="summaryAqi">Loading...</strong></li>
                <li><span data-i18n="statusLabel">Status:</span> <strong id="summaryStatus">Loading...</strong></li>
                <li><span data-i18n="mainPollutantLabel">Main Pollutant:</span> <strong id="summaryPollutant">PM2.5</strong></li>
                <li><span data-i18n="causePredictionLabel">Cause Prediction:</span>
                  <ul>
                    <li id="summaryCauseOne">Checking local air quality...</li>
                    <li id="summaryCauseTwo">Checking route context...</li>
                    <li id="summaryCauseThree">Checking weather influence...</li>
                  </ul>
                </li>
              </ul>
              <div class="awaaz-report-panel" aria-label="Report environmental issue through Awaaz">
                <p data-i18n="awaazReportDescription">
                  Help improve your community by reporting pollution, unsafe roads, smoke, garbage burning, or environmental hazards.
                </p>
                <a
                  class="awaaz-report-button"
                  id="awaazReportButton"
                  href="https://team-26-1.onrender.com/?issue=air-pollution"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-i18n="awaazReportButton"
                >
                  Report Pollution via Awaaz
                </a>
              </div>
            </article>

            <article class="dashboard-mini-card safety-card">
              <h3>🟡 <span data-i18n="communitySafetyTitle">COMMUNITY SAFETY STATUS</span></h3>
              <div class="mini-row">
                <span data-i18n="villageSafetyIndexLabel">Village Air Safety Index:</span>
                <strong id="safetyIndex">--/100</strong>
              </div>
              <div class="mini-row">
                <span data-i18n="riskLevelLabel">Risk Level:</span>
                <strong class="risk-pill" id="riskLevel">MODERATE</strong>
              </div>
            </article>

            <article class="dashboard-mini-card sensor-card">
              <h3>📡 <span data-i18n="sensorStatusTitle">SENSOR STATUS</span></h3>
              <div class="sensor-row"><span class="sensor-dot"></span><span data-i18n="schoolSensorLabel">School Sensor:</span><strong data-i18n="activeLabel">ACTIVE</strong></div>
              <div class="sensor-row"><span class="sensor-dot"></span><span data-i18n="marketSensorLabel">Market Sensor:</span><strong data-i18n="activeLabel">ACTIVE</strong></div>
              <div class="sensor-row"><span class="sensor-dot"></span><span data-i18n="farmSensorLabel">Farm Sensor:</span><strong data-i18n="activeLabel">ACTIVE</strong></div>
              <p class="mini-muted"><span data-i18n="lastUpdatedLabel">Last Updated:</span> <span id="sensorUpdated">2 mins ago</span></p>
            </article>

            <article class="dashboard-mini-card health-card">
              <h3>🩺 <span data-i18n="healthAdviceTitle">HEALTH ADVICE</span></h3>
              <ul>
                <li id="healthAdviceOne">Outdoor activity is safe currently</li>
                <li id="healthAdviceTwo">Children can travel safely</li>
                <li id="healthAdviceThree">Masks not required currently</li>
              </ul>
            </article>
          </div>

          <div class="decision-actions">
            <div class="map-preview" id="mapPreview">
              <span data-i18n="mapPlaceholder">MAP OF SELECTED REGION</span>
            </div>
            <article class="community-alert-card">
              <h3>🚨 <span data-i18n="communityAlertsTitle">COMMUNITY ALERTS</span></h3>
              <ul>
                <li><span class="severity low"></span><span data-i18n="cropBurningRiskLabel">Crop burning risk:</span> <strong id="cropRisk">LOW</strong></li>
                <li><span class="severity low"></span><span data-i18n="aqiStableLabel">AQI stable currently</span></li>
                <li><span class="severity normal"></span><span data-i18n="trafficPollutionLabel">Traffic pollution:</span> <strong id="trafficRisk">NORMAL</strong></li>
                <li><span class="severity low"></span><span data-i18n="safeOutdoorLabel">Safe outdoor activity till 5 PM</span></li>
              </ul>
            </article>
            <button class="route-action" type="button" id="sustainableRouteButton" data-i18n="sustainableRouteButton">
              CLICK HERE TO GET THE SUSTAINABLE ROUTE
            </button>
            <button class="back-action" type="button" id="backHomeButton" data-i18n="backButton">Back</button>
          </div>

          <article class="connectivity-card">
            <h3>📶 <span data-i18n="lowConnectivityTitle">LOW CONNECTIVITY MODE ENABLED</span></h3>
            <p><span data-i18n="lastSyncedLabel">Last synced</span> <span id="lastSynced">10 mins ago</span></p>
            <p data-i18n="smsAlertsLabel">SMS alerts available</p>
          </article>
        </div>
      </section>
    </main>

    <script src="/script.js?v=${APP_VERSION}"></script>
    <script>
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js?v=${APP_VERSION}").catch(() => {});
      }
    </script>
  </body>
</html>`;

const fallbackRuralAreas = {
  mangaluru: [
    "Adyar", "Adyapadi", "Adduru", "Arkula", "Bajpe", "Bala", "Bantwal", "Belthangady",
    "Boliyar", "Bondel", "Derlakatte", "Farangipete", "Ganjimutt", "Gurupura", "Harekala",
    "Jeppinamogaru", "Kallapu", "Kavoor", "Kinnigoli", "Konaje", "Kotekar", "Kuloor",
    "Moodabidri", "Mulki", "Neermarga", "Panemangalore", "Permude", "Surathkal",
    "Thokkottu", "Ullal", "Vamanjoor"
  ],
  someshwara: [
    "Someshwara", "Ullal", "Kotekar", "Talapadi", "Thokkottu", "Derlakatte", "Konaje",
    "Harekala", "Manjanadi", "Natekal", "Asaigoli", "Beeri", "Kinya", "Pavuru",
    "Mudipu", "Boliyar", "Adyar", "Jeppinamogaru", "Farangipete", "Bantwal"
  ],
  ullal: [
    "Someshwara", "Ullal", "Kotekar", "Talapadi", "Thokkottu", "Derlakatte", "Konaje",
    "Harekala", "Manjanadi", "Natekal", "Asaigoli", "Beeri", "Kinya", "Pavuru",
    "Mudipu", "Boliyar", "Adyar", "Jeppinamogaru", "Farangipete", "Bantwal"
  ],
  "dakshina kannada": [
    "Someshwara", "Ullal", "Kotekar", "Talapadi", "Thokkottu", "Derlakatte", "Konaje",
    "Harekala", "Manjanadi", "Natekal", "Asaigoli", "Bantwal", "Belthangady",
    "Moodabidri", "Mulki", "Kinnigoli", "Surathkal", "Adyar", "Gurupura"
  ],
  bengaluru: [
    "Anekal", "Attibele", "Bagalur", "Bannerghatta", "Bidadi", "Chandapura", "Devanahalli",
    "Doddaballapura", "Hesaraghatta", "Hoskote", "Jigani", "Kanakapura", "Nelamangala",
    "Sarjapura", "Tavarekere", "Yelahanka"
  ],
  mysuru: [
    "Belavadi", "Bogadi", "Hootagalli", "Jayapura", "Kadakola", "Nanjangud",
    "Srirangapatna", "T. Narasipura", "Varuna", "Yelwala"
  ],
  default: [
    "Village Center", "Gram Panchayat Office", "Primary Health Centre", "Government School",
    "Bus Stand", "Railway Station", "Main Market", "Post Office", "Police Station"
  ]
};

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  response.end(JSON.stringify(payload));
}

function offlineAirQuality() {
  return {
    aqi: "N/A",
    status: "OFFLINE ESTIMATE",
    pollutant: "PM2.5",
    causes: ["Traffic smoke", "Local burning", "Dry weather"]
  };
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 25000);
  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
      ...(options.headers || {})
    }
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) throw new Error(`Request failed with ${response.status}`);
  return response.json();
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Timed out")), timeoutMs))
  ]);
}

async function geocodeRegion(region) {
  if (!navigatorOnline()) return null;
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", region);

  const data = await fetchJson(url);
  if (!data.length) return null;

  return {
    label: data[0].display_name || region,
    latitude: Number(data[0].lat),
    longitude: Number(data[0].lon),
    osmType: data[0].osm_type,
    osmId: Number(data[0].osm_id),
    boundingBox: (data[0].boundingbox || []).map(Number)
  };
}

async function reverseGeocode(latitude, longitude) {
  if (!navigatorOnline()) {
    throw new Error("Network unavailable for exact place lookup.");
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", latitude);
  url.searchParams.set("lon", longitude);

  try {
    const data = await fetchJson(url);
    const address = data.address || {};
    const preciseLabel =
      address.suburb ||
      address.neighbourhood ||
      address.village ||
      address.hamlet;
    if (preciseLabel) return { label: preciseLabel };

    const broadLabel =
      address.city ||
      address.town ||
      address.county ||
      data.display_name;
    const cloudLabel = await bigDataCloudReverse(latitude, longitude);
    if (cloudLabel) return { label: cloudLabel };
    const nearbyLabel = await nearestPlaceName(latitude, longitude);
    if (!looksLikeCoordinates(nearbyLabel)) return { label: nearbyLabel };
    if (broadLabel) return { label: broadLabel };
  } catch (error) {
    // Fall through to nearby named places when reverse geocoding is unavailable.
  }

  const cloudLabel = await bigDataCloudReverse(latitude, longitude);
  if (cloudLabel) return { label: cloudLabel };

  return { label: await nearestPlaceName(latitude, longitude) };
}

async function bigDataCloudReverse(latitude, longitude) {
  const url = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);
  url.searchParams.set("localityLanguage", "en");

  try {
    const data = await fetchJson(url, { timeoutMs: 8000 });
    return data.locality || data.city || data.principalSubdivision || "";
  } catch (error) {
    return "";
  }
}

async function ipLocation() {
  if (!navigatorOnline()) {
    throw new Error("Network unavailable for IP location.");
  }

  try {
    const data = await fetchJson("https://ipapi.co/json/", { timeoutMs: 8000 });
    const location = {
      label: data.city || data.region || data.country_name || "",
      latitude: Number(data.latitude),
      longitude: Number(data.longitude)
    };
    if (location.label) return location;
    throw new Error("IP API did not return a named place.");
  } catch (error) {
    try {
      const data = await fetchJson("https://ipwho.is/", { timeoutMs: 8000 });
      const location = {
        label: data.city || data.region || data.country || "",
        latitude: Number(data.latitude),
        longitude: Number(data.longitude)
      };
      if (location.label) return location;
    } catch (secondError) {
      // Try one more public IP location service before giving up.
    }

    const data = await fetchJson("https://geolocation-db.com/json/", { timeoutMs: 8000 });
    const location = {
      label: data.city || data.state || data.country_name || "",
      latitude: Number(data.latitude),
      longitude: Number(data.longitude)
    };
    if (location.label) return location;
    throw new Error("Exact place name could not be found from IP.");
  }
}

function aqiStatus(aqi) {
  if (aqi <= 50) return "GOOD";
  if (aqi <= 100) return "MODERATE";
  if (aqi <= 150) return "UNHEALTHY FOR SENSITIVE GROUPS";
  if (aqi <= 200) return "UNHEALTHY";
  if (aqi <= 300) return "VERY UNHEALTHY";
  return "HAZARDOUS";
}

async function airQuality(latitude, longitude) {
  if (!navigatorOnline()) return offlineAirQuality();

  const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);
  url.searchParams.set("hourly", "us_aqi,pm2_5");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "1");

  const data = await fetchJson(url, { timeoutMs: 10000 });
  const aqiValues = data.hourly && data.hourly.us_aqi ? data.hourly.us_aqi.filter(Number.isFinite) : [];
  const pmValues = data.hourly && data.hourly.pm2_5 ? data.hourly.pm2_5.filter(Number.isFinite) : [];
  const aqi = aqiValues.length ? Math.round(aqiValues[0]) : 0;
  const pm25 = pmValues.length ? pmValues[0].toFixed(1) : "N/A";

  return {
    aqi,
    status: aqiStatus(aqi),
    pollutant: `PM2.5 (${pm25} µg/m³)`,
    causes: aqi > 150
      ? ["Traffic smoke", "Crop residue or local burning", "Dry weather"]
      : aqi > 100
        ? ["Traffic smoke", "Road dust", "Local burning"]
        : ["Lower pollution risk", "Normal traffic activity", "Weather currently supportive"]
  };
}

function overpassAreaId(match) {
  if (!match || !match.osmType || !match.osmId) return null;
  if (match.osmType === "relation") return 3600000000 + match.osmId;
  if (match.osmType === "way") return 2400000000 + match.osmId;
  return null;
}

function radiusFromBoundingBox(match) {
  const box = match && match.boundingBox;
  if (!box || box.length !== 4 || box.some(Number.isNaN)) return 35000;
  const [south, north, west, east] = box;
  const latMeters = Math.abs(north - south) * 111000;
  const lonMeters = Math.abs(east - west) * 111000;
  return Math.min(Math.max(Math.ceil(Math.max(latMeters, lonMeters) / 2), 15000), 80000);
}

async function overpass(query) {
  if (!navigatorOnline()) {
    return { elements: [] };
  }

  return fetchJson("https://overpass-api.de/api/interpreter", {
    method: "POST",
    timeoutMs: 12000,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
    body: query
  });
}

function looksLikeCoordinates(value) {
  return /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(String(value || "").trim());
}

function navigatorOnline() {
  return true;
}

async function nearestPlaceName(latitude, longitude) {
  const query = `
    [out:json][timeout:15];
    (
      node["name"]["place"~"^(village|hamlet|town|city|locality|suburb|neighbourhood)$"](around:15000,${latitude},${longitude});
      way["name"]["place"~"^(village|hamlet|town|city|locality|suburb|neighbourhood)$"](around:15000,${latitude},${longitude});
    );
    out center tags 20;
  `;

  try {
    const data = await overpass(query);
    const namedPlace = data.elements.find((item) => item.tags && item.tags.name);
    if (namedPlace) return namedPlace.tags.name;
  } catch (error) {
    // Coordinates are the final fallback if public map services are unavailable.
  }

  return `${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}`;
}

async function ruralAreasByArea(areaId) {
  const query = `
    [out:json][timeout:30];
    area(${areaId})->.searchArea;
    (
      node["name"]["place"~"^(village|hamlet|town|locality|suburb|neighbourhood|isolated_dwelling)$"](area.searchArea);
      way["name"]["place"~"^(village|hamlet|town|locality|suburb|neighbourhood)$"](area.searchArea);
      relation["name"]["place"~"^(village|hamlet|town|locality|suburb|neighbourhood)$"](area.searchArea);
    );
    out tags 1000;
  `;
  const data = await overpass(query);
  return data.elements.map((item) => item.tags && item.tags.name).filter(Boolean);
}

async function ruralAreasByRadius(latitude, longitude, radius) {
  const query = `
    [out:json][timeout:30];
    (
      node["name"]["place"~"^(village|hamlet|town|locality|suburb|neighbourhood|isolated_dwelling)$"](around:${radius},${latitude},${longitude});
      way["name"]["place"~"^(village|hamlet|town|locality|suburb|neighbourhood)$"](around:${radius},${latitude},${longitude});
      relation["name"]["place"~"^(village|hamlet|town|locality|suburb|neighbourhood)$"](around:${radius},${latitude},${longitude});
    );
    out tags 1000;
  `;
  const data = await overpass(query);
  return data.elements.map((item) => item.tags && item.tags.name).filter(Boolean);
}

function fallbackFor(region) {
  const normalized = String(region || "").toLowerCase();
  const key = Object.keys(fallbackRuralAreas).find((name) => normalized.includes(name));
  return fallbackRuralAreas[key || "default"];
}

async function handlePlaces(url, response) {
  const region = url.searchParams.get("region") || "";
  let latitude = Number(url.searchParams.get("lat"));
  let longitude = Number(url.searchParams.get("lon"));
  let label = region;
  let match = null;

  if (region && !looksLikeCoordinates(region)) {
    match = await geocodeRegion(region);
    if (match) {
      label = match.label;
      latitude = latitude || match.latitude;
      longitude = longitude || match.longitude;
    }
  }

  if ((!label || looksLikeCoordinates(label)) && latitude && longitude) {
    label = await nearestPlaceName(latitude, longitude);
  }

  let places = [];
  const areaId = overpassAreaId(match);
  if (areaId) {
    try {
      places = await withTimeout(ruralAreasByArea(areaId), 13000);
    } catch (error) {
      places = [];
    }
  }

  if (!places.length && latitude && longitude) {
    try {
      places = await withTimeout(ruralAreasByRadius(latitude, longitude, radiusFromBoundingBox(match)), 13000);
    } catch (error) {
      places = [];
    }
  }

  const merged = [...new Set([...places, ...fallbackFor(region), ...fallbackFor(label)])].sort((a, b) => a.localeCompare(b));
  sendJson(response, 200, {
    region: label,
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
    places: merged
  });
}

async function handleApi(request, response, url) {
  try {
    if (url.pathname === "/api/reverse-geocode") {
      const latitude = url.searchParams.get("lat");
      const longitude = url.searchParams.get("lon");
      if (!latitude || !longitude) {
        sendJson(response, 400, { error: "Latitude and longitude are required." });
        return;
      }
      sendJson(response, 200, await reverseGeocode(latitude, longitude));
      return;
    }

    if (url.pathname === "/api/nearest-place") {
      const latitude = url.searchParams.get("lat");
      const longitude = url.searchParams.get("lon");
      if (!latitude || !longitude) {
        sendJson(response, 400, { error: "Latitude and longitude are required." });
        return;
      }
      const nearbyLabel = await nearestPlaceName(latitude, longitude);
      if (!looksLikeCoordinates(nearbyLabel)) {
        sendJson(response, 200, { label: nearbyLabel });
        return;
      }
      sendJson(response, 200, { label: await bigDataCloudReverse(latitude, longitude) || nearbyLabel });
      return;
    }

    if (url.pathname === "/api/ip-location") {
      sendJson(response, 200, await ipLocation());
      return;
    }

    if (url.pathname === "/api/air-quality") {
      const latitude = url.searchParams.get("lat");
      const longitude = url.searchParams.get("lon");
      if (!latitude || !longitude) {
        sendJson(response, 400, { error: "Latitude and longitude are required." });
        return;
      }
      sendJson(response, 200, await airQuality(latitude, longitude));
      return;
    }

    if (url.pathname === "/api/places") {
      await handlePlaces(url, response);
      return;
    }

    sendJson(response, 404, { error: "API route not found." });
  } catch (error) {
    if (url.pathname === "/api/air-quality") {
      sendJson(response, 200, offlineAirQuality());
      return;
    }

    sendJson(response, 200, {
      error: error.message,
      region: url.searchParams.get("region") || "",
      places: fallbackFor(url.searchParams.get("region"))
    });
  }
}

function serveStatic(request, response) {
  const requestPath = decodeURIComponent(request.url.split("?")[0]);
  if (requestPath === "/" || requestPath === "/index.html") {
    response.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store"
    });
    response.end(homePage);
    return;
  }

  const fileName = requestPath.replace(/^\/+/, "");
  const filePath = path.resolve(PUBLIC_DIR, fileName);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(content);
  });
}

http
  .createServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      });
      response.end();
      return;
    }

    if (url.pathname.startsWith("/api/")) {
      handleApi(request, response, url);
      return;
    }
    serveStatic(request, response);
  })
  .listen(PORT, () => {
    console.log(`Green Path is running at http://localhost:${PORT}`);
  });
