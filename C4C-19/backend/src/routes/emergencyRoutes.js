const express = require("express");

const router = express.Router();

const {

  createEmergency,

  getEmergencyHistory,

  resolveEmergency

} = require("../controllers/emergencyController");



router.post("/create", createEmergency);

router.get("/history/:userId", getEmergencyHistory);

router.put("/resolve/:id", resolveEmergency);



module.exports = router;