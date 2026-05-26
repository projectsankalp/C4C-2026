const express = require("express");

const router = express.Router();

const {

  createNotification,

  getNotifications,

  markAsRead,

  sendMedicineReminder,

  sendAppointmentReminder

} = require("../controllers/notificationController");



router.post("/create", createNotification);

router.get("/:userId", getNotifications);

router.put("/read/:id", markAsRead);

router.post(
  "/medicine-reminder/:userId",
  sendMedicineReminder
);

router.post(
  "/appointment-reminder/:userId",
  sendAppointmentReminder
);

module.exports = router;