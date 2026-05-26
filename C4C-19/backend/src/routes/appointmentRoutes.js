const express = require("express");

const router = express.Router();

const {

  bookAppointment,

  getAppointments,

  cancelAppointment,

  completeAppointment

} = require("../controllers/appointmentController");



router.post("/book", bookAppointment);

router.get("/history/:userId", getAppointments);

router.put("/cancel/:id", cancelAppointment);

router.put("/complete/:id", completeAppointment);



module.exports = router;