const express = require("express");

const router = express.Router();

const {

  addHospital,

  getAllHospitals,

  getGovernmentHospitals,

  getPrivateHospitals,

  getTestingCenters,

  getNearestPHC

} = require("../controllers/hospitalController");



router.post("/add", addHospital);

router.get("/all", getAllHospitals);

router.get("/government", getGovernmentHospitals);

router.get("/private", getPrivateHospitals);

router.get("/testing", getTestingCenters);

router.get("/nearest-phc", getNearestPHC);



module.exports = router;