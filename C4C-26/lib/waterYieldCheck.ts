export interface FarmProfile {
  cropType: string;
  landSize: number;
  irrigationFrequency: string;
  householdSize: number;
  dailyWaterUsage?: number; // litres, optional field
}

export interface WaterYieldWarning {
  hasAnomaly: boolean;
  warnings: string[];
}

export function checkWaterYieldAnomalies(profile: FarmProfile): WaterYieldWarning {
  const warnings: string[] = [];
  const crop = profile.cropType.toLowerCase();
  const freq = profile.irrigationFrequency.toLowerCase();

  // Rule 1: crop needs more frequent irrigation
  const dryIrrigation = freq === 'none' || freq === 'weekly' || freq === 'monthly' || freq === 'bi-weekly';
  const thirstyCrop = crop.includes('sugarcane') || crop.includes('rice') || crop.includes('cotton') || crop.includes('water-intensive');
  if (thirstyCrop && dryIrrigation) {
    warnings.push(
      "Sugarcane/Rice/Cotton requires daily or bi-daily irrigation. Your selected frequency appears insufficient for this crop — yields may be severely impacted."
    );
  }

  // Rule 2: Sugarcane water usage critically low
  if (
    crop.includes('sugarcane') &&
    profile.landSize > 50 &&
    profile.dailyWaterUsage !== undefined &&
    profile.dailyWaterUsage < profile.landSize * 800
  ) {
    warnings.push(
      `Your reported water usage (${profile.dailyWaterUsage}L/day) is critically low for ${profile.landSize} acres of sugarcane. Expected minimum: ${profile.landSize * 800}L/day. Please verify your extraction data.`
    );
  }

  // Rule 3: Land size high and monthly irrigation
  if (profile.landSize > 200 && freq === 'monthly') {
    warnings.push(
      `Monthly irrigation for ${profile.landSize} acres is agronomically unusual. Please verify your irrigation schedule.`
    );
  }

  // Rule 4: Household size high and usage critically low
  if (
    profile.householdSize > 15 &&
    profile.dailyWaterUsage !== undefined &&
    profile.dailyWaterUsage < profile.householdSize * 50
  ) {
    warnings.push(
      `Reported daily water usage seems very low for a ${profile.householdSize}-person household. Minimum recommended: ${profile.householdSize * 50}L/day.`
    );
  }

  return {
    hasAnomaly: warnings.length > 0,
    warnings,
  };
}
