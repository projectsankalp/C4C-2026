const EmergencyLog = require("../models/EmergencyLog");

const Hospital = require("../models/Hospital");

const {

  sendEmergencyAlert

} = require("../services/notificationService");



const createEmergency = async (req, res) => {

  try {

    const emergency = await EmergencyLog.create(req.body);



    const nearestPHC = await Hospital.findOne({
      type: "government"
    });



    const alert = await sendEmergencyAlert(

      emergency.patientName,

      emergency.emergencyType

    );



    res.status(201).json({

      success: true,

      emergency,

      nearestPHC,

      alert

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const getEmergencyHistory = async (req, res) => {

  try {

    const history = await EmergencyLog.find({
      userId: req.params.userId
    }).sort({ createdAt: -1 });



    res.status(200).json({

      success: true,

      history

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const resolveEmergency = async (req, res) => {

  try {

    const emergency = await EmergencyLog.findByIdAndUpdate(

      req.params.id,

      {
        status: "Resolved"
      },

      {
        new: true
      }

    );



    res.status(200).json({

      success: true,

      message: "Emergency resolved",

      emergency

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



module.exports = {

  createEmergency,

  getEmergencyHistory,

  resolveEmergency

};