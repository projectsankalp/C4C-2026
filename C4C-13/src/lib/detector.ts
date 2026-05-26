/**
 * Analyzes an array of absence dates to detect a recurring 24-35 day cycle.
 * Returns true if a cyclical pattern is detected, triggering an Early Warning.
 */
export function detectCycle(absenceDates: string[]): boolean {
  // We need at least 3 absences to confidently establish a recurring pattern.
  if (absenceDates.length < 3) {
    return false; 
  }

  // Step 1: Convert date strings to timestamps and sort them chronologically
  const sortedDates = absenceDates
    .map(date => new Date(date).getTime())
    .sort((a, b) => a - b);

  let cycleMatches = 0;

  // Step 2: Calculate the gap (in days) between consecutive absences
  for (let i = 1; i < sortedDates.length; i++) {
    const gapInMilliseconds = sortedDates[i] - sortedDates[i - 1];
    const gapInDays = gapInMilliseconds / (1000 * 60 * 60 * 24);

    // Step 3: Check if the gap falls within a typical biological window (24 to 35 days)
    if (gapInDays >= 24 && gapInDays <= 35) {
      cycleMatches++;
    }
  }

  // Step 4: If we have at least 2 consecutive cycles that match the window, flag it!
  return cycleMatches >= 2;
}

// ==========================================
// 🧪 QUICK TEST FOR YOU TO SEE HOW IT WORKS
// ==========================================
// const studentA_Dates = ["2026-01-01", "2026-01-29", "2026-02-27"]; // 28-day gap -> Returns TRUE
// const studentB_Dates = ["2026-01-01", "2026-01-03", "2026-01-05"]; // 2-day gap (Fever) -> Returns FALSE