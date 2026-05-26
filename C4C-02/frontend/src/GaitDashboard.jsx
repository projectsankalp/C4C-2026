import { useEffect, useState } from "react";

export default function GaitAIDashboard() {

  // -----------------------------------
  // STATE
  // -----------------------------------

  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);


  // -----------------------------------
  // FETCH BACKEND DATA
  // -----------------------------------

  useEffect(() => {

    fetch("http://127.0.0.1:5000/api/report")

      .then((response) => {

        if (!response.ok) {

          throw new Error(
            "Failed to fetch backend report."
          );
        }

        return response.json();
      })

      .then((data) => {

        setReport(data);

        setLoading(false);
      })

      .catch((err) => {

        setError(err.message);

        setLoading(false);
      });

  }, []);


  // -----------------------------------
  // STATUS COLORS
  // -----------------------------------

  const getStatusStyle = (status) => {

    if (status === "within_normal") {

      return (
        "bg-green-100 text-green-700 border-green-300"
      );
    }

    if (status === "below_normal") {

      return (
        "bg-yellow-100 text-yellow-700 border-yellow-300"
      );
    }

    return (
      "bg-red-100 text-red-700 border-red-300"
    );
  };


  // -----------------------------------
  // LOADING SCREEN
  // -----------------------------------

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-slate-100">

        <div className="text-3xl font-semibold text-slate-700">

          Loading Biomechanical Report...

        </div>

      </div>
    );
  }


  // -----------------------------------
  // ERROR SCREEN
  // -----------------------------------

  if (error || report?.error) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">

        <div className="bg-white rounded-3xl shadow-lg p-10 max-w-2xl w-full">

          <h1 className="text-4xl font-bold text-red-600 mb-6">

            Backend Error

          </h1>

          <p className="text-lg text-slate-700">

            {error || report.error}

          </p>

        </div>

      </div>
    );
  }


  // -----------------------------------
  // MAIN DASHBOARD
  // -----------------------------------

  return (

    <div className="min-h-screen bg-slate-100 p-6">

      <div className="max-w-7xl mx-auto">


        {/* HEADER */}

        <div className="mb-10">

          <h1 className="text-5xl font-bold text-slate-800">

            Gait AI Dashboard

          </h1>

          <p className="text-slate-600 mt-3 text-xl">

            Real-Time Computational Biomechanics Platform

          </p>

        </div>


        {/* SUMMARY */}

        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 border border-slate-200">

          <h2 className="text-3xl font-semibold mb-5 text-slate-800">

            Session Summary

          </h2>

          <p className="text-slate-700 text-lg leading-relaxed">

            {report.summary}

          </p>

        </div>


        {/* METRIC GRID */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">


          {/* CADENCE */}

          <div className="bg-white rounded-3xl shadow-lg p-6 border border-slate-200">

            <div className="flex justify-between items-center mb-4">

              <h3 className="text-xl font-semibold text-slate-800">

                Cadence

              </h3>

              <span
                className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusStyle(
                  report.cadence_status
                )}`}
              >

                {report.cadence_status}

              </span>

            </div>

            <div className="text-5xl font-bold text-slate-900 mb-2">

              {report.mean_cadence}

            </div>

            <p className="text-slate-500">

              steps/minute

            </p>

          </div>


          {/* KNEE ROM */}

          <div className="bg-white rounded-3xl shadow-lg p-6 border border-slate-200">

            <div className="flex justify-between items-center mb-4">

              <h3 className="text-xl font-semibold text-slate-800">

                Knee ROM

              </h3>

              <span
                className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusStyle(
                  report.knee_rom_status
                )}`}
              >

                {report.knee_rom_status}

              </span>

            </div>

            <div className="text-5xl font-bold text-slate-900 mb-2">

              {report.knee_rom}

            </div>

            <p className="text-slate-500">

              degrees

            </p>

          </div>


          {/* GAIT VARIABILITY */}

          <div className="bg-white rounded-3xl shadow-lg p-6 border border-slate-200">

            <div className="flex justify-between items-center mb-4">

              <h3 className="text-xl font-semibold text-slate-800">

                Gait Variability

              </h3>

              <span
                className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusStyle(
                  report.gait_interval_cv_status
                )}`}
              >

                {report.gait_interval_cv_status}

              </span>

            </div>

            <div className="text-5xl font-bold text-slate-900 mb-2">

              {report.gait_interval_cv}

            </div>

            <p className="text-slate-500">

              coefficient of variation (%)

            </p>

          </div>


          {/* WALKING SPEED */}

          <div className="bg-white rounded-3xl shadow-lg p-6 border border-slate-200">

            <div className="flex justify-between items-center mb-4">

              <h3 className="text-xl font-semibold text-slate-800">

                Walking Speed

              </h3>

              <span
                className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusStyle(
                  report.walking_speed_status
                )}`}
              >

                {report.walking_speed_status}

              </span>

            </div>

            <div className="text-5xl font-bold text-slate-900 mb-2">

              {report.walking_speed}

            </div>

            <p className="text-slate-500">

              meters/second

            </p>

          </div>

        </div>


        {/* EXTRA METRICS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">


          {/* VALID FRAMES */}

          <div className="bg-white rounded-3xl shadow-lg p-6 border border-slate-200">

            <h3 className="text-lg font-semibold text-slate-700 mb-3">

              Valid Frames

            </h3>

            <div className="text-4xl font-bold text-slate-900">

              {report.valid_frames}

            </div>

          </div>


          {/* CONFIDENCE */}

          <div className="bg-white rounded-3xl shadow-lg p-6 border border-slate-200">

            <h3 className="text-lg font-semibold text-slate-700 mb-3">

              Mean Confidence

            </h3>

            <div className="text-4xl font-bold text-slate-900">

              {report.mean_confidence}

            </div>

          </div>


          {/* WALK STATUS */}

          <div className="bg-white rounded-3xl shadow-lg p-6 border border-slate-200">

            <h3 className="text-lg font-semibold text-slate-700 mb-3">

              Mobility Status

            </h3>

            <div className="text-2xl font-bold text-slate-900">

              {report.walking_speed_status}

            </div>

          </div>

        </div>


        {/* TECHNICAL REPORT */}

        <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-200 mb-10">

          <h2 className="text-3xl font-semibold mb-6 text-slate-800">

            Technical Gait Analysis Report

          </h2>

          <div className="bg-slate-100 rounded-2xl p-6 max-h-[700px] overflow-y-auto">

            <pre className="whitespace-pre-wrap text-slate-700 text-base leading-relaxed font-sans">

              {report.technical_summary}

            </pre>

          </div>

        </div>


        {/* FOOTER */}

        <div className="text-center text-slate-500 text-sm pb-6">

          Gait AI — Vision-Based Computational Biomechanics Framework

        </div>

      </div>

    </div>
  );
}