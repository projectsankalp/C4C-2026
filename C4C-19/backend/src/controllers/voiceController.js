const {

  triggerVoiceAgent

} = require("../services/vapiService");



const healthAssistant = async (
  req,
  res
) => {

  try {

    const { phoneNumber } = req.body;



    const agent =
      await triggerVoiceAgent(

        process.env
          .VAPI_ASSISTANT_APPOINTMENT_ID,

        phoneNumber

      );



    res.status(200).json({

      success: true,

      type: "Health Assistant",

      agent

    });

  } catch (error) {

    res.status(500).json({

      message: error.message

    });

  }

};



const emergencyAssistant = async (
  req,
  res
) => {

  try {

    const { phoneNumber } = req.body;



    const agent =
      await triggerVoiceAgent(

        process.env
          .VAPI_ASSISTANT_EMERGENCY_ID,

        phoneNumber

      );



    res.status(200).json({

      success: true,

      type: "Emergency Assistant",

      agent

    });

  } catch (error) {

    res.status(500).json({

      message: error.message

    });

  }

};



const schedulerAssistant = async (
  req,
  res
) => {

  try {

    const { phoneNumber } = req.body;



    const agent =
      await triggerVoiceAgent(

        process.env
          .VAPI_ASSISTANT_REMINDER_ID,

        phoneNumber

      );



    res.status(200).json({

      success: true,

      type: "Reminder Assistant",

      agent

    });

  } catch (error) {

    res.status(500).json({

      message: error.message

    });

  }

};



module.exports = {

  healthAssistant,

  emergencyAssistant,

  schedulerAssistant

};