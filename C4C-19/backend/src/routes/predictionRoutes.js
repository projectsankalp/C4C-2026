const express = require("express");

const router = express.Router();

const {

  saveHealthRecord,

  getUserHealthRecords

} = require("../controllers/predictionController");



router.post("/save", saveHealthRecord);

router.get("/history/:userId", getUserHealthRecords);



module.exports = router;