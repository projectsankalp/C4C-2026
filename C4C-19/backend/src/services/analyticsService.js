const calculateOverallRisk = (

  diabetesRisk,
  hypertensionRisk

) => {

  if (
    diabetesRisk === "HIGH" ||
    hypertensionRisk === "HIGH"
  ) {
    return "HIGH";
  }

  if (
    diabetesRisk === "MEDIUM" ||
    hypertensionRisk === "MEDIUM"
  ) {
    return "MEDIUM";
  }

  return "LOW";
};



const generateRecommendations = (

  diabetesRisk,
  hypertensionRisk

) => {

  const recommendations = [];



  if (diabetesRisk === "HIGH") {

    recommendations.push(
      "Reduce sugar intake"
    );

    recommendations.push(
      "Walk daily for 30 minutes"
    );

  }



  if (hypertensionRisk === "HIGH") {

    recommendations.push(
      "Reduce salt intake"
    );

    recommendations.push(
      "Monitor BP regularly"
    );

  }



  if (
    diabetesRisk === "LOW" &&
    hypertensionRisk === "LOW"
  ) {

    recommendations.push(
      "Maintain healthy lifestyle"
    );

  }



  return recommendations;
};



module.exports = {

  calculateOverallRisk,

  generateRecommendations

};