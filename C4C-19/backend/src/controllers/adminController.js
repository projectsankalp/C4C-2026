const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");

const Doctor = require("../models/Doctor");

const User = require("../models/User");

const Appointment = require("../models/Appointment");

const EmergencyLog = require("../models/EmergencyLog");

const Hospital = require("../models/Hospital");



const adminLogin = async (req, res) => {

  try {

    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {

      return res.status(404).json({
        message: "Admin not found"
      });

    }

    const isMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isMatch) {

      return res.status(400).json({
        message: "Invalid credentials"
      });

    }

    const token = jwt.sign(

      {
        id: admin._id,
        role: admin.role
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "7d"
      }

    );

    res.status(200).json({

      success: true,

      token,

      admin

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const createAdmin = async (req, res) => {

  try {

    const {
      name,
      email,
      password
    } = req.body;

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const admin = await Admin.create({

      name,

      email,

      password: hashedPassword

    });

    res.status(201).json({

      success: true,

      admin

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const addDoctor = async (req, res) => {

  try {

    const doctor = await Doctor.create(
      req.body
    );

    res.status(201).json({

      success: true,

      doctor

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const getDoctors = async (req, res) => {

  try {

    const doctors = await Doctor.find();

    res.status(200).json({

      success: true,

      doctors

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const getAdminDashboard = async (
  req,
  res
) => {

  try {

    const totalUsers =
      await User.countDocuments();

    const totalDoctors =
      await Doctor.countDocuments();

    const totalAppointments =
      await Appointment.countDocuments();

    const totalEmergencies =
      await EmergencyLog.countDocuments();

    const totalHospitals =
      await Hospital.countDocuments();



    res.status(200).json({

      success: true,

      dashboard: {

        totalUsers,

        totalDoctors,

        totalAppointments,

        totalEmergencies,

        totalHospitals

      }

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



module.exports = {

  adminLogin,

  createAdmin,

  addDoctor,

  getDoctors,

  getAdminDashboard

};