const User = require("../models/User");

const Appointment = require("../models/Appointment");

const EmergencyLog = require("../models/EmergencyLog");

const HealthRecord = require("../models/HealthRecord");

const {

  calculateOverallRisk,

  generateRecommendations

} = require("../services/analyticsService");



const getDashboardData = async (req, res) => {

  try {

    const userId = req.params.userId;



    const user = await User.findById(userId);



    const latestHealthRecord = await HealthRecord
      .findOne({ userId })
      .sort({ createdAt: -1 });



    const appointments = await Appointment.find({
      userId
    });



    const emergencies = await EmergencyLog.find({
      userId
    });



    let diabetesRisk = "LOW";

    let hypertensionRisk = "LOW";



    if (latestHealthRecord) {

      diabetesRisk =
        latestHealthRecord.diabetesRisk;

      hypertensionRisk =
        latestHealthRecord.hypertensionRisk;

    }



    const overallRisk = calculateOverallRisk(

      diabetesRisk,

      hypertensionRisk

    );



    const recommendations = generateRecommendations(

      diabetesRisk,

      hypertensionRisk

    );



    res.status(200).json({

      success: true,

      dashboard: {

        profile: {

          name: user?.name,

          phone: user?.phone,

          language: user?.language

        },



        healthSummary: {

          diabetesRisk,

          hypertensionRisk,

          overallRisk

        },



        appointments: {

          total: appointments.length,

          upcoming: appointments.filter(
            a => a.status === "Scheduled"
          ).length

        },



        emergencies: {

          total: emergencies.length,

          pending: emergencies.filter(
            e => e.status === "Pending"
          ).length

        },



        recommendations,



        latestHealthRecord

      }

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

module.exports = {
  getDashboardData
};