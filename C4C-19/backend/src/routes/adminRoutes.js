const express = require("express");

const router = express.Router();

const {

  adminLogin,

  createAdmin,

  addDoctor,

  getDoctors,

  getAdminDashboard

} = require("../controllers/adminController");



router.post("/create", createAdmin);

router.post("/login", adminLogin);

router.post("/doctor/add", addDoctor);

router.get("/doctors", getDoctors);

router.get("/dashboard", getAdminDashboard);

module.exports = router;