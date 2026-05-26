const getLanguages = async (
  req,
  res
) => {

  try {

    const languages = [

      "English",

      "Hindi",

      "Kannada"

    ];



    res.status(200).json({

      success: true,

      languages

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

module.exports = {
  getLanguages
};