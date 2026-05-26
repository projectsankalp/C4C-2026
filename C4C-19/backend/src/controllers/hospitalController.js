const Hospital = require("../models/Hospital");



const addHospital = async (req, res) => {

  try {

    const hospital = await Hospital.create(req.body);

    res.status(201).json({

      success: true,

      hospital

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const getAllHospitals = async (req, res) => {

  try {

    const hospitals = await Hospital.find();

    res.status(200).json({

      success: true,

      hospitals

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const getGovernmentHospitals = async (req, res) => {

  try {

    const hospitals = await Hospital.find({
      type: "government"
    });

    res.status(200).json({

      success: true,

      hospitals

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const getPrivateHospitals = async (req, res) => {

  try {

    const hospitals = await Hospital.find({
      type: "private"
    });

    res.status(200).json({

      success: true,

      hospitals

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const getTestingCenters = async (req, res) => {

  try {

    const hospitals = await Hospital.find({
      type: "testing"
    });

    res.status(200).json({

      success: true,

      hospitals

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const getNearestPHC = async (req, res) => {

  try {

    const hospital = await Hospital.findOne({
      type: "government"
    });

    res.status(200).json({

      success: true,

      hospital

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



module.exports = {

  addHospital,

  getAllHospitals,

  getGovernmentHospitals,

  getPrivateHospitals,

  getTestingCenters,

  getNearestPHC

};