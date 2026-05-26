const Notification = require("../models/Notification");

const User = require("../models/User");

const {

  sendReminder

} = require("../services/reminderService");



const createNotification = async (req, res) => {

  try {

    const notification =
      await Notification.create(req.body);



    res.status(201).json({

      success: true,

      notification

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const getNotifications = async (req, res) => {

  try {

    const notifications =
      await Notification.find({
        userId: req.params.userId
      }).sort({ createdAt: -1 });



    res.status(200).json({

      success: true,

      notifications

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const markAsRead = async (req, res) => {

  try {

    const notification =
      await Notification.findByIdAndUpdate(

        req.params.id,

        {
          isRead: true
        },

        {
          new: true
        }

      );



    res.status(200).json({

      success: true,

      message: "Notification marked as read",

      notification

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const sendMedicineReminder = async (req, res) => {

  try {

    const user = await User.findById(
      req.params.userId
    );



    const reminder = await sendReminder(

      user.phone,

      "Medicine Reminder"

    );



    const notification =
      await Notification.create({

        userId: user._id,

        title: "Medicine Reminder",

        message:
          "Time to take your medicine",

        type: "Medicine"

      });



    res.status(200).json({

      success: true,

      reminder,

      notification

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const sendAppointmentReminder = async (req, res) => {

  try {

    const user = await User.findById(
      req.params.userId
    );



    const reminder = await sendReminder(

      user.phone,

      "Appointment Reminder"

    );



    const notification =
      await Notification.create({

        userId: user._id,

        title: "Appointment Reminder",

        message:
          "You have an upcoming appointment",

        type: "Appointment"

      });



    res.status(200).json({

      success: true,

      reminder,

      notification

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



module.exports = {

  createNotification,

  getNotifications,

  markAsRead,

  sendMedicineReminder,

  sendAppointmentReminder

};