import { NextResponse } from 'next/server';
// Import the brain!
import { detectCycle } from '../../../lib/detector';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { absentStudents } = body;

    console.log("Backend received absences for:", absentStudents);

    // ==========================================
    // HACKATHON DEMO MAGIC:
    // In a real app, we would fetch the student's past 3 months of history from MongoDB here.
    // For the demo, we will pretend student 'ANON_8841' already has a history of cyclic absences.
    // ==========================================
    
    let alertsTriggered = 0;

    for (const studentId of absentStudents) {
      // Simulate historical data from the database
      let historicalAbsences = [];
      
      if (studentId === 'ANON_8841') {
        // This student missed school 28 days ago, and 56 days ago.
        // Adding today's absence will trigger the 28-day cycle alert!
        const today = new Date().toISOString().split('T')[0];
        historicalAbsences = ["2026-03-31", "2026-04-28", today]; 
      } else {
        // Normal student, random absences
        historicalAbsences = ["2026-05-10"]; 
      }

      // Run our time-series algorithm!
      const isAtRisk = detectCycle(historicalAbsences);

      if (isAtRisk) {
        alertsTriggered++;
        // NOTE: Here is where we would normally write to the Alerts Database for the ASHA worker!
        console.log(`🚨 CRITICAL: Recurring cycle detected for ${studentId}. Dispatching ASHA alert.`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      alertsTriggered,
      message: alertsTriggered > 0 
        ? `Attendance logged. ${alertsTriggered} predictive alert(s) routed to ASHA.`
        : "Attendance logged normally. No anomalies detected."
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to process attendance' }, { status: 500 });
  }
}