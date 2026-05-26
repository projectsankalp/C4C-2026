const HealthRecord = require("../models/HealthRecord");



const saveHealthRecord = async (req, res) => {

  try {

    const {
      userId,
      answers
    } = req.body;



    const diabetesScore = calculateDiabetesRisk(answers);

    const hypertensionScore = calculateHypertensionRisk(answers);



    const record = await HealthRecord.create({

      userId,

      diabetesRisk: diabetesScore,

      hypertensionRisk: hypertensionScore,

      answers

    });



    res.status(201).json({

      success: true,

      record

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const getUserHealthRecords = async (req, res) => {

  try {

    const records = await HealthRecord.find({
      userId: req.params.userId
    }).sort({ createdAt: -1 });



    res.status(200).json({

      success: true,

      records

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const calculateDiabetesRisk = (answers) => {

  let score = 0;

  if (answers.frequentUrination) score += 2;

  if (answers.excessiveThirst) score += 2;

  if (answers.fatigue) score += 1;

  if (answers.blurredVision) score += 1;

  if (answers.weightLoss) score += 2;

  if (answers.slowHealing) score += 2;

  if (answers.familyHistory) score += 2;

  if (answers.physicalActivity === "Low") score += 2;



  if (score >= 10) return "HIGH";

  if (score >= 5) return "MEDIUM";

  return "LOW";

};



const calculateHypertensionRisk = (answers) => {

  let score = 0;

  if (answers.headaches) score += 2;

  if (answers.dizziness) score += 2;

  if (answers.chestPain) score += 3;

  if (answers.irregularHeartbeat) score += 2;

  if (answers.breathingDifficulty) score += 3;

  if (answers.smoking) score += 2;

  if (answers.alcohol) score += 1;

  if (answers.saltIntake === "High") score += 3;

  if (answers.stressLevel === "High") score += 2;



  if (score >= 12) return "HIGH";

  if (score >= 6) return "MEDIUM";

  return "LOW";

};



module.exports = {

  saveHealthRecord,

  getUserHealthRecords

};