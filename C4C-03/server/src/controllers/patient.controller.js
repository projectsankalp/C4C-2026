const Patient = require('../models/Patient.model');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/patients
const createPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.create({ ...req.body, ashaId: req.user.id });
  res.status(201).json(patient);
});

// GET /api/patients
const getPatients = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'asha') filter.ashaId = req.user.id;
  if (req.query.village) filter.village = new RegExp(req.query.village, 'i');
  if (req.query.search) filter.name = new RegExp(req.query.search, 'i');
  const patients = await Patient.find(filter).sort({ createdAt: -1 });
  res.json(patients);
});

// GET /api/patients/:id
const getPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json(patient);
});

module.exports = { createPatient, getPatients, getPatient };
