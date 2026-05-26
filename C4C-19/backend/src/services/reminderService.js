const sendReminder = async (

  phone,
  title

) => {

  try {

    console.log(
      `Reminder sent to ${phone}: ${title}`
    );

    return {

      success: true,

      message: "Reminder sent successfully"

    };

  } catch (error) {

    throw new Error(error.message);

  }

};

module.exports = {
  sendReminder
};