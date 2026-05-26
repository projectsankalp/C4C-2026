import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Custom dark mode tooltip to match the PieChart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 text-white px-3 py-2.5 rounded-xl shadow-xl border border-slate-700/50">
        <p className="text-slate-400 text-xs font-bold mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
          <span className="text-sm font-extrabold">{payload[0].value} Screenings</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function WeeklyLineChart({ data = [] }) {
  // Format data for the chart
  const formatted = data.map(d => ({ date: d._id, count: d.count }));
  const isEmpty = formatted.length === 0;

  return (
    <div className="w-full h-full flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
          📈 Weekly Trend
        </h3>
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-[220px] relative w-full">
        {isEmpty ? (
          // Empty State
          <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[1.25rem] bg-slate-50/50">
            <span className="text-slate-400 font-bold text-sm">No recent screenings</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formatted} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              
              {/* Gradient Definition */}
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>

              {/* Soft horizontal grid lines only */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} 
                dy={10}
              />
              
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                allowDecimals={false}
              />
              
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '4 4' }} 
              />
              
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorCount)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb', shadow: '0 0 10px rgba(37,99,235,0.5)' }}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}