const User = require("../models/User");

const {

  testAICall

} = require("../services/settingsService");



const getProfile = async (req, res) => {

  try {

    const user = await User.findById(
      req.params.userId
    );



    res.status(200).json({

      success: true,

      user

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const updateProfile = async (req, res) => {

  try {

    const user = await User.findByIdAndUpdate(

      req.params.userId,

      req.body,

      {
        new: true
      }

    );



    res.status(200).json({

      success: true,

      message: "Profile updated",

      user

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const changeLanguage = async (req, res) => {

  try {

    const { language } = req.body;



    const user = await User.findByIdAndUpdate(

      req.params.userId,

      {
        language
      },

      {
        new: true
      }

    );



    res.status(200).json({

      success: true,

      message: "Language updated",

      language: user.language

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const getSettings = async (req, res) => {

  try {

    const user = await User.findById(
      req.params.userId
    );



    res.status(200).json({

      success: true,

      settings: {

        language: user.language,

        internetStatus: user.internetStatus,

        syncStatus: user.syncStatus,

        notificationsEnabled:
          user.notificationsEnabled

      }

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const triggerTestCall = async (req, res) => {

  try {

    const user = await User.findById(
      req.params.userId
    );



    const result = await testAICall(
      user.phone
    );



    res.status(200).json({

      success: true,

      result

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



module.exports = {

  getProfile,

  updateProfile,

  changeLanguage,

  getSettings,

  triggerTestCall

};