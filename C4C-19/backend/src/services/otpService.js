const client =
  require("../config/twilio");

const sendOTP = async (
  phone,
  otp
) => {
  try {
    // If we're forcing mock mode or Twilio keys are dummy ones, skip calling API directly to avoid delay
    if (process.env.MOCK_OTP === "true" || process.env.TWILIO_ACCOUNT_SID.includes("dummy")) {
      console.log(`[MOCK OTP MODE] Generating verification code for dev testing:`);
      console.log(`-----------------------------------------------`);
      console.log(`Phone Number: ${phone}`);
      console.log(`Verification Code (OTP): ${otp}`);
      console.log(`-----------------------------------------------`);
      return true;
    }

    await client.messages.create({
      body:
        `Your Arogya AI OTP is ${otp}`,
      from:
        process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    console.log(
      `OTP sent to ${phone}`
    );

    return true;

  } catch (error) {
    console.log("Twilio OTP send failed, falling back to console log for testing:");
    console.log(`-----------------------------------------------`);
    console.log(`Phone Number: ${phone}`);
    console.log(`Verification Code (OTP): ${otp}`);
    console.log(`Error Reason: ${error.message}`);
    console.log(`-----------------------------------------------`);
    return true;
  }
};

module.exports = sendOTP;