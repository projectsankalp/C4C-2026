function generateFollowUpDate(riskLevel) {
  const today = new Date();
  const days = riskLevel === 'HIGH' ? 7 : riskLevel === 'MEDIUM' ? 30 : 180;
  today.setDate(today.getDate() + days);
  return today;
}

module.exports = generateFollowUpDate;
