const client =
  require("../config/twilio");



const makeCall = async (
  phoneNumber
) => {

  try {

    const call =
      await client.calls.create({

        twiml: `

<Response>

<Say>

Welcome to Arogya AI Healthcare Assistant

</Say>

</Response>

`,

        from:
          process.env.TWILIO_PHONE_NUMBER,

        to: phoneNumber

      });



    return {

      success: true,

      sid: call.sid,

      status: call.status

    };

  } catch (error) {

    throw new Error(error.message);

  }

};

module.exports = {
  makeCall
};