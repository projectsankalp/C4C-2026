import { useEffect, useState } from "react";
import axios from "axios";

import { motion } from "framer-motion";

import {
  Droplets,
  CloudRain,
  Thermometer,
  AlertTriangle,
  TrendingUp,
  Cpu,
  Clock,
  Waves,
  Globe,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  RadialBarChart,
  RadialBar,
} from "recharts";

import "./App.css";

const chartData = [
  { name: "00:00", stress: 45, trend: 40 },
  { name: "04:00", stress: 52, trend: 45 },
  { name: "08:00", stress: 61, trend: 55 },
  { name: "12:00", stress: 75, trend: 68 },
  { name: "16:00", stress: 82, trend: 75 },
  { name: "20:00", stress: 78, trend: 72 },
  { name: "23:59", stress: 85, trend: 80 },
];

const riskData = [
  { name: "Stress", value: 85, fill: "#c084fc" },
];

const MetricCard = ({
  title,
  value,
  unit,
  icon: Icon,
  color,
  trend,
}) => {

  const colorMap = {
    rose: "text-rose-400 bg-rose-500/10",
    blue: "text-blue-400 bg-blue-500/10",
    sky: "text-sky-400 bg-sky-500/10",
    purple: "text-purple-400 bg-purple-500/10",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex justify-between items-center mb-4">

        <div
          className={`p-3 rounded-xl ${colorMap[color]}`}
        >
          <Icon size={24} />
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-400">
          <TrendingUp
            size={12}
            className={
              trend === "up"
                ? "text-rose-400"
                : "text-emerald-400"
            }
          />
          {trend === "up" ? "+12%" : "-5%"}
        </div>
      </div>

      <h3 className="text-slate-400 text-sm mb-2">
        {title}
      </h3>

      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold text-white">
          {value}
        </span>

        <span className="text-slate-500 mb-1">
          {unit}
        </span>
      </div>
    </motion.div>
  );
};

function App() {

  const [time, setTime] = useState(
    new Date().toLocaleTimeString()
  );

  const [data, setData] = useState({
    weather: {
      temperature: 34,
      humidity: 68,
      rainfall: 12,
    },
    prediction: 85,
    risk: "HIGH",
  });

  useEffect(() => {

    const timer = setInterval(() => {

      setTime(
        new Date().toLocaleTimeString()
      );

    }, 1000);

    return () => clearInterval(timer);

  }, []);

  useEffect(() => {

    const fetchData = async () => {

      try {

        const response = await axios.get(
          "http://127.0.0.1:8000/api/v1/ai/predict",
          {
            params: {
              city: "Bangalore",
              district: "Bangalore",
              state: "Karnataka",
            },
          }
        );

        setData(response.data);

      } catch (err) {

        console.log(err);
      }
    };

    fetchData();

  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-white p-8">

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-12">

          <div>

            <div className="flex items-center gap-2 mb-4 text-blue-400">
              <Cpu size={18} />
              <span className="uppercase text-sm font-bold">
                AI Core Active
              </span>
            </div>

            <h1 className="text-6xl font-bold mb-3">
              JalRakshak AI
            </h1>

            <p className="text-slate-400">
              Real-time Groundwater Intelligence &
              Risk Analysis Platform
            </p>

          </div>

          <div className="glass rounded-2xl p-5">

            <div className="flex items-center gap-2 text-emerald-400 mb-2">

              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />

              LIVE MONITORING

            </div>

            <div className="flex items-center gap-2 text-xl">

              <Clock size={18} />

              {time}

            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid md:grid-cols-4 gap-5 mb-10">

          <MetricCard
            title="Temperature"
            value={data.weather.temperature}
            unit="°C"
            icon={Thermometer}
            color="rose"
            trend="up"
          />

          <MetricCard
            title="Humidity"
            value={data.weather.humidity}
            unit="%"
            icon={Droplets}
            color="blue"
            trend="down"
          />

          <MetricCard
            title="Rainfall"
            value={data.weather.rainfall}
            unit="mm"
            icon={CloudRain}
            color="sky"
            trend="down"
          />

          <MetricCard
            title="Risk Level"
            value={data.risk}
            unit=""
            icon={AlertTriangle}
            color="purple"
            trend="up"
          />
        </div>

        {/* AI Insight */}
        <div className="glass-dark rounded-3xl p-8 mb-10">

          <div className="flex items-center gap-3 mb-6">

            <Cpu className="text-purple-400" />

            <h2 className="text-2xl font-bold">
              AI Environmental Insight
            </h2>

          </div>

          <p className="text-2xl text-slate-300 leading-relaxed">
            Groundwater stress is increasing in
            Mysore district due to declining
            rainfall and elevated temperatures.
            Water conservation measures are
            recommended.
          </p>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-8">

          <div className="glass rounded-3xl p-8 lg:col-span-2">

            <h2 className="text-2xl font-bold mb-8">
              Risk Visualization
            </h2>

            <div className="h-[300px]">

              <ResponsiveContainer width="100%" height="100%">

                <AreaChart data={chartData}>

                  <defs>

                    <linearGradient
                      id="stress"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="5%"
                        stopColor="#c084fc"
                        stopOpacity={0.4}
                      />

                      <stop
                        offset="95%"
                        stopColor="#c084fc"
                        stopOpacity={0}
                      />

                    </linearGradient>

                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#ffffff10"
                  />

                  <XAxis dataKey="name" stroke="#64748b" />

                  <YAxis stroke="#64748b" />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="stress"
                    stroke="#c084fc"
                    fill="url(#stress)"
                    strokeWidth={3}
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>
          </div>

          {/* Gauge */}
          <div className="glass rounded-3xl p-8">

            <div className="flex items-center gap-2 mb-6">

              <Waves className="text-blue-400" />

              <h2 className="text-xl font-bold">
                Risk Probability
              </h2>

            </div>

            <div className="h-[250px] relative">

              <ResponsiveContainer width="100%" height="100%">

                <RadialBarChart
                  innerRadius="60%"
                  outerRadius="100%"
                  data={riskData}
                  startAngle={180}
                  endAngle={0}
                >

                  <RadialBar
                    dataKey="value"
                    cornerRadius={20}
                  />

                </RadialBarChart>

              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center">

                <div className="text-5xl font-bold">
                  {data.prediction}%
                </div>

                <div className="text-rose-400 font-bold">
                  CRITICAL
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;