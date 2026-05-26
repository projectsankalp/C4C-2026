'use client';

import { useState } from 'react';

// Mock data for our MVP
const students = [
  { id: 'ANON_8841', name: 'Student 8841 (Class 9)' },
  { id: 'ANON_8842', name: 'Student 8842 (Class 9)' },
  { id: 'ANON_8843', name: 'Student 8843 (Class 10)' },
];

export default function SchoolDashboard() {
  const [absences, setAbsences] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleAbsence = (id: string) => {
    setAbsences((prev) =>
      prev.includes(id) ? prev.filter((studentId) => studentId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Call our new backend API!
    const response = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ absentStudents: absences }),
    });

    const data = await response.json();
    console.log("Server Response:", data);

    setSubmitted(true);
    
    // Reset after 4 seconds
    setTimeout(() => {
      setSubmitted(false);
      setAbsences([]);
    }, 4000);
  };
  return (
    <main className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">Weekly Attendance Log</h1>
          <p className="text-gray-500 mt-2">Govt. High School, Ganjam | Week 42</p>
        </div>

        {submitted ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">Attendance logged securely.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="font-semibold mb-4 text-gray-700">Select students absent for 2+ days this week:</p>
            
            <div className="space-y-3 mb-8">
              {students.map((student) => (
                <label 
                  key={student.id} 
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    absences.includes(student.id) ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    checked={absences.includes(student.id)}
                    onChange={() => toggleAbsence(student.id)}
                  />
                  <span className="ml-3 font-medium">{student.name}</span>
                </label>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Submit Weekly Log
            </button>
          </form>
        )}
      </div>
    </main>
  );
}