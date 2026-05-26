const getHealthTips = async (
  req,
  res
) => {

  try {

    const tips = [

      {
        title: "Reduce Salt Intake",
        category: "BP"
      },

      {
        title: "Walk Daily",
        category: "Fitness"
      },

      {
        title: "Drink More Water",
        category: "General"
      },

      {
        title: "Monitor Blood Sugar",
        category: "Diabetes"
      }

    ];



    res.status(200).json({

      success: true,

      tips

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

module.exports = {
  getHealthTips
};