import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Custom dark mode tooltip to match the other charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 text-white px-3 py-2.5 rounded-xl shadow-xl border border-slate-700/50">
        <p className="text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <span 
                className="w-2.5 h-2.5 rounded-full shadow-sm" 
                style={{ backgroundColor: entry.color }}
              ></span>
              <span className="text-sm font-extrabold text-slate-100">
                {entry.value} <span className="font-medium text-slate-400 ml-1">{entry.name}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function VillageBarChart({ data = [] }) {
  // Format data for the top 5 villages
  const top5 = data.slice(0, 5).map(d => ({ 
    village: d._id || 'Unknown', 
    high: d.high || 0, 
    total: d.total || 0 
  }));

  const isEmpty = top5.length === 0;

  return (
    <div className="w-full h-full flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
          🗺️ Village Risk
        </h3>
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-[220px] relative w-full">
        {isEmpty ? (
          // Empty State
          <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[1.25rem] bg-slate-50/50">
            <span className="text-slate-400 font-bold text-sm">No village data</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top5} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              
              {/* Soft horizontal grid lines only */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              
              <XAxis 
                dataKey="village" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} 
                dy={10}
              />
              
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                allowDecimals={false}
              />
              
              {/* Soft cursor highlight on hover */}
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: '#f8fafc' }} 
              />
              
              {/* Bars with rounded top corners */}
              <Bar 
                dataKey="total" 
                name="Total" 
                fill="#cbd5e1" 
                radius={[6, 6, 0, 0]} 
                maxBarSize={32}
              />
              <Bar 
                dataKey="high" 
                name="High Risk" 
                fill="#e11d48" 
                radius={[6, 6, 0, 0]} 
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Custom HTML Legend */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 pt-4 border-t border-slate-100/60">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-300" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Total
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.4)]" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            High Risk
          </span>
        </div>
      </div>

    </div>
  );
}