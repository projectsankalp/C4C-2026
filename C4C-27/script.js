const BASE_URL = "http://localhost:5000";

/* =========================
   RANDOM GENERATORS
========================= */

function randomAQI() {
    return Math.floor(Math.random() * 250) + 50;
}

function randomPollutant(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

/* =========================
   LIVE CITY AQI
========================= */

async function updateLiveAQI() {

    const aqiEl =
        document.getElementById("aqi");

    const levelEl =
        document.getElementById("level");

    const circle =
        document.getElementById("aqiCircle");

    const msg =
        document.getElementById("msg");

    const co2 =
        document.getElementById("co2");

    const co =
        document.getElementById("co");

    const no2 =
        document.getElementById("no2");

    const so2 =
        document.getElementById("so2");

    if (!aqiEl || !levelEl || !circle)
        return;

    /* RANDOM AQI */

    const aqi =
        randomAQI();

    aqiEl.innerText = aqi;

    /* RANDOM POLLUTANTS */

    const co2Value =
        randomPollutant(300, 900);

    const coValue =
        randomPollutant(20, 120);

    const no2Value =
        randomPollutant(40, 180);

    const so2Value =
        randomPollutant(10, 100);

    if (co2)
        co2.innerText =
            co2Value + " ppm";

    if (co)
        co.innerText =
            coValue + " ppm";

    if (no2)
        no2.innerText =
            no2Value + " ppm";

    if (so2)
        so2.innerText =
            so2Value + " ppm";

    /* STATUS */

    let color = "green";

    let text = "SAFE";

    let message =
        "Air quality is healthy.";

    if (aqi > 100) {

        color = "yellow";

        text = "MODERATE";

        message =
            "Moderate pollution detected.";
    }

    if (aqi > 180) {

        color = "red";

        text = "CRITICAL";

        message =
            "Dangerous pollution level detected!";
    }

    circle.className =
        "aqi-circle " + color;

    levelEl.innerText = text;

    if (msg)
        msg.innerText = message;
}

/* =========================
   ALERT SYSTEM
========================= */

function checkAlert() {

    const title =
        document.getElementById("alertTitle");

    const msg =
        document.getElementById("alertMsg");

    const box =
        document.getElementById("alertBox");

    if (!title || !msg || !box)
        return;

    const alerts = [
        "SAFE",
        "WARNING",
        "CRITICAL"
    ];

    const random =
        Math.floor(Math.random() * 3);

    const alert =
        alerts[random];

    let color = "green";

    let text = "SAFE";

    let message =
        "City pollution is under control.";

    if (alert === "WARNING") {

        color = "yellow";

        text = "WARNING";

        message =
            "Vehicle emissions increasing.";
    }

    if (alert === "CRITICAL") {

        color = "red";

        text = "CRITICAL ALERT";

        message =
            "Immediate environmental action required!";
    }

    box.className =
        "alert-box " + color;

    title.innerText = text;

    msg.innerText = message;
}

/* =========================
   REPORT GRAPH
========================= */

function updateReportGraph() {

    if (!window.chart) return;

    pollutionData =
        pollutionData.map(value => {

            let random =
                Math.floor(Math.random() * 40) - 20;

            let updated =
                value + random;

            if (updated < 10)
                updated = 10;

            if (updated > 250)
                updated = 250;

            return updated;
        });

    chart.data.datasets[0].data =
        pollutionData;

    chart.update();
}

/* =========================
   AUTO UPDATE LOOP
========================= */

setInterval(() => {

    updateLiveAQI();

    checkAlert();

    updateReportGraph();

}, 2000);

/* INITIAL LOAD */

updateLiveAQI();

checkAlert();

updateReportGraph();