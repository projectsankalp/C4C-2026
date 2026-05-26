const sendEmergencyAlert = async (

  patientName,
  emergencyType

) => {

  try {

    console.log(
      `Emergency Alert: ${patientName} - ${emergencyType}`
    );

    return {

      success: true,

      message: "Emergency alert sent"

    };

  } catch (error) {

    throw new Error(error.message);

  }

};

module.exports = {
  sendEmergencyAlert
};