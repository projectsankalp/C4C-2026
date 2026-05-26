const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());

/* CONNECT FRONTEND */
app.use(express.static(path.join(__dirname, "../frontend")));

/* HOME PAGE */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dashboard.html"));
});

/* =====================================
   VEHICLE POLLUTION SIMULATION
===================================== */

function generateVehiclePollution() {

    return {

        vehicleId: "KA-01-AB-1234",

        co2: (Math.random() * 400 + 200).toFixed(2), // ppm

        co: (Math.random() * 50 + 10).toFixed(2), // ppm

        nox: (Math.random() * 100 + 20).toFixed(2), // ppm

        pm25: (Math.random() * 150 + 10).toFixed(2), // µg/m³

        speed: Math.floor(Math.random() * 80), // km/h

        engineLoad: Math.floor(Math.random() * 100), // %

        timestamp: new Date()
    };
}

/* =====================================
   API ENDPOINT
===================================== */

app.get("/api/vehicle-pollution", (req, res) => {

    const pollutionData = generateVehiclePollution();

    res.json(pollutionData);
});

/* =====================================
   LIVE DATA SIMULATION
===================================== */

setInterval(() => {

    const data = generateVehiclePollution();

    console.log("🚗 Vehicle Data:", data);

}, 5000);

/* =====================================
   SERVER
===================================== */

app.listen(5000, () => {

    console.log("✅ Server running on port 5000");

});