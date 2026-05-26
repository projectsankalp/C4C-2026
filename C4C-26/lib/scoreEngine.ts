export interface UserProfile {
  householdSize: number;       // 1–20 people
  landAcres: number;           // 1–500 acres
  cropType: 'none' | 'drought-resistant' | 'moderate' | 'water-intensive';
  irrigationFrequency: 'none' | 'weekly' | 'bi-weekly' | 'daily' | 'flood';
  livestockCount: number;      // 0–500 head
}

export interface SustainabilityResult {
  score: number;               // 0–100
  riskLevel: 'Low' | 'Medium' | 'Critical';
  lifespanYears: number;       // Projected groundwater lifespan
  dailyUsageGallons: number;   // Estimated daily total usage
  monthlyUsageGallons: number;
  warningMessages: string[];   // 1–2 dynamic messages
  praiseMessages: string[];    // 1–2 dynamic messages
  usageBreakdown: {
    household: number;
    irrigation: number;
    livestock: number;
  };
}

export function calculateSustainability(profile: UserProfile): SustainabilityResult {
  const { householdSize, landAcres, cropType, irrigationFrequency, livestockCount } = profile;

  // 1. Base Score
  let score = 100;

  // 2. Household deduction
  score -= householdSize * 1.5;

  // 3. Crop penalty
  let cropPenalty = 0;
  switch (cropType) {
    case 'none':
      cropPenalty = 0;
      break;
    case 'drought-resistant':
      cropPenalty = 2;
      break;
    case 'moderate':
      cropPenalty = 10;
      break;
    case 'water-intensive':
      cropPenalty = 20;
      break;
  }
  score -= cropPenalty;

  // 4. Irrigation penalty
  let irrigationPenalty = 0;
  switch (irrigationFrequency) {
    case 'none':
      irrigationPenalty = 0;
      break;
    case 'weekly':
      irrigationPenalty = 5;
      break;
    case 'bi-weekly':
      irrigationPenalty = 8;
      break;
    case 'daily':
      irrigationPenalty = 18;
      break;
    case 'flood':
      irrigationPenalty = 28;
      break;
  }
  score -= irrigationPenalty;

  // 5. Livestock penalty
  const livestockPenalty = Math.min(livestockCount * 0.08, 25);
  score -= livestockPenalty;

  // 6. Land bonus
  const landBonus = Math.min(landAcres * 0.03, 8);
  score += landBonus;

  // 7. Clamp final score
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  // 8. Risk Level
  let riskLevel: 'Low' | 'Medium' | 'Critical' = 'Critical';
  if (finalScore >= 65) {
    riskLevel = 'Low';
  } else if (finalScore >= 35) {
    riskLevel = 'Medium';
  }

  // 9. Lifespan
  const lifespanYears = Math.round(finalScore * 0.45 + 5);

  // 10. Daily usage estimate (gallons)
  const householdDaily = householdSize * 80;

  let irrigationMultiplier = 0;
  switch (irrigationFrequency) {
    case 'none':
      irrigationMultiplier = 0;
      break;
    case 'weekly':
      irrigationMultiplier = 50;
      break;
    case 'bi-weekly':
      irrigationMultiplier = 80;
      break;
    case 'daily':
      irrigationMultiplier = 200;
      break;
    case 'flood':
      irrigationMultiplier = 600;
      break;
  }
  const irrigationDaily = Math.round(irrigationMultiplier * landAcres * 0.1);
  const livestockDaily = livestockCount * 30;
  const dailyUsageGallons = householdDaily + irrigationDaily + livestockDaily;
  const monthlyUsageGallons = dailyUsageGallons * 30;

  // 11. Dynamic warning / praise messages
  const warningMessages: string[] = [];
  const praiseMessages: string[] = [];

  // Warning generation (prioritized when score < 50, but can be added constructive feedback for others too)
  if (finalScore < 60) {
    if (irrigationFrequency === 'flood') {
      warningMessages.push(`Flood irrigation on your ${landAcres} acres is consuming ${irrigationDaily.toLocaleString()} gallons daily—3x more water than drip alternatives.`);
    } else if (irrigationFrequency === 'daily' && landAcres > 10) {
      warningMessages.push(`Daily irrigation scheduling on ${landAcres} acres is pulling ${irrigationDaily.toLocaleString()} gallons/day. Try moisture sensors to irrigate only when needed.`);
    }

    if (cropType === 'water-intensive') {
      warningMessages.push(`Water-intensive crops are draining local groundwater tables. Swapping even 20% to drought-resistant options saves up to 30,000 gallons monthly.`);
    } else if (livestockCount > 150) {
      warningMessages.push(`With ${livestockCount} head of livestock, you consume ${livestockDaily.toLocaleString()} gallons daily. Implement recycling of wash water to offset this.`);
    }

    if (warningMessages.length === 0) {
      warningMessages.push(`Your profile shows elevated local resource stress. Consider low-flow fixtures and optimized irrigation spacing.`);
    }
  } else {
    // Neutral warnings just in case
    if (cropType === 'water-intensive') {
      warningMessages.push(`Your high water-intensive crops limit further improvement in score despite other conservation measures.`);
    } else if (irrigationFrequency === 'daily') {
      warningMessages.push(`Irrigating daily keeps your scores out of the optimal zone. Try moving to bi-weekly cycles.`);
    } else {
      warningMessages.push(`Rainwater harvesting could further enhance aquifer recharge on your ${landAcres} acres.`);
    }
  }

  // Praise generation (prioritized when score >= 65)
  if (finalScore >= 65) {
    if (cropType === 'drought-resistant') {
      praiseMessages.push(`Your drought-resistant crops are saving an estimated 40,000 gallons/year compared to standard crops.`);
    } else if (cropType === 'none') {
      praiseMessages.push(`Operating with no active crops avoids high agricultural groundwater stress.`);
    }

    if (irrigationFrequency === 'none') {
      praiseMessages.push("Zero crop irrigation schedule preserves vital aquifer water tables from extraction.");
    } else if (irrigationFrequency === 'bi-weekly' || irrigationFrequency === 'weekly') {
      praiseMessages.push(`Efficient irrigation schedule (${irrigationFrequency}) is successfully keeping daily extraction under control.`);
    }

    if (landAcres > 80) {
      praiseMessages.push(`Your substantial acreage (${landAcres} acres) offers excellent natural soil filtration and rainwater recharge.`);
    }

    if (praiseMessages.length === 0) {
      praiseMessages.push(`Congratulations! Your sustainability practices keep you in the low-risk category.`);
    }
  } else {
    if (cropType === 'drought-resistant') {
      praiseMessages.push(`Choosing drought-resistant crops is an excellent decision that saves water.`);
    } else if (irrigationFrequency === 'none') {
      praiseMessages.push(`Excellent decision in avoiding active irrigation extraction.`);
    } else {
      praiseMessages.push(`Your land size of ${landAcres} acres naturally facilitates standard groundwater recharge.`);
    }
  }

  // Limit messages to 1 or 2 items
  const finalWarnings = warningMessages.slice(0, 2);
  const finalPraises = praiseMessages.slice(0, 2);

  return {
    score: finalScore,
    riskLevel,
    lifespanYears,
    dailyUsageGallons,
    monthlyUsageGallons,
    warningMessages: finalWarnings,
    praiseMessages: finalPraises,
    usageBreakdown: {
      household: householdDaily,
      irrigation: irrigationDaily,
      livestock: livestockDaily,
    },
  };
}
