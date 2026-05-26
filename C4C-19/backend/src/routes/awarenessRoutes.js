const express = require("express");

const router = express.Router();

const {

  getHealthTips

} = require("../controllers/awarenessController");



router.get("/tips", getHealthTips);

module.exports = router;