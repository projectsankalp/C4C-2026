const axios = require("axios");



const triggerVoiceAgent = async (

  assistantId,
  phoneNumber

) => {

  try {

    const response = await axios.post(

      "https://api.vapi.ai/call",

      {

        assistantId,

        phoneNumberId:
          process.env.VAPI_PHONE_NUMBER_ID,

        customer: {

          number: phoneNumber

        }

      },

      {

        headers: {

          Authorization:
            `Bearer ${process.env.VAPI_API_KEY}`,

          "Content-Type":
            "application/json"

        }

      }

    );



    return response.data;

  } catch (error) {

    console.log(

      "VAPI ERROR:",

      error.response?.data ||

      error.message

    );



    throw new Error(
      "Vapi call failed"
    );

  }

};

module.exports = {
  triggerVoiceAgent
};