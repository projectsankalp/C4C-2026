const express = require("express");

const router = express.Router();

const {

  healthAssistant,

  emergencyAssistant,

  schedulerAssistant

} = require("../controllers/voiceController");



router.post("/assistant", healthAssistant);

router.post("/emergency", emergencyAssistant);

router.post("/scheduler", schedulerAssistant);



module.exports = router;