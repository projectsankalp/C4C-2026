const express = require("express");

const router = express.Router();

const {

  getProfile,

  updateProfile,

  changeLanguage,

  getSettings,

  triggerTestCall

} = require("../controllers/profileController");



router.get("/:userId", getProfile);

router.put("/update/:userId", updateProfile);

router.put("/language/:userId", changeLanguage);

router.get("/settings/:userId", getSettings);

router.post("/test-call/:userId", triggerTestCall);



module.exports = router;