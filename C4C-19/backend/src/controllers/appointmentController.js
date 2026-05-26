const Appointment = require("../models/Appointment");



const bookAppointment = async (req, res) => {

  try {

    const appointment = await Appointment.create(req.body);

    res.status(201).json({

      success: true,

      message: "Appointment booked successfully",

      appointment

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const getAppointments = async (req, res) => {

  try {

    const appointments = await Appointment.find({
      userId: req.params.userId
    }).sort({ createdAt: -1 });



    res.status(200).json({

      success: true,

      appointments

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const cancelAppointment = async (req, res) => {

  try {

    const appointment = await Appointment.findByIdAndUpdate(

      req.params.id,

      {
        status: "Cancelled"
      },

      {
        new: true
      }

    );



    res.status(200).json({

      success: true,

      message: "Appointment cancelled",

      appointment

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const completeAppointment = async (req, res) => {

  try {

    const appointment = await Appointment.findByIdAndUpdate(

      req.params.id,

      {
        status: "Completed"
      },

      {
        new: true
      }

    );



    res.status(200).json({

      success: true,

      message: "Appointment completed",

      appointment

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



module.exports = {

  bookAppointment,

  getAppointments,

  cancelAppointment,

  completeAppointment

};