import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// Polished Rose, Amber, Emerald hex codes to match your risk badges
const COLORS = ['#e11d48', '#f59e0b', '#10b981']; 

// Custom modern tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xl border border-slate-700/50">
        <span className="opacity-70 mr-2">{payload[0].name} Risk:</span>
        <span className="text-sm">{payload[0].value} Patients</span>
      </div>
    );
  }
  return null;
};

export default function RiskPieChart({ data }) {
  const chartData = [
    { name: 'High', value: data?.highRisk || 0 },
    { name: 'Medium', value: data?.mediumRisk || 0 },
    { name: 'Low', value: data?.lowRisk || 0 }
  ];

  // Check if we have data to display
  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);
  const isEmpty = total === 0;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
          📊 Risk Distribution
        </h3>
        {/* Total Badge */}
        {!isEmpty && (
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {total} Total
          </span>
        )}
      </div>

      <div className="flex-1 min-h-[220px] relative">
        {isEmpty ? (
          // Empty State Donut
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center">
              <span className="text-slate-400 font-bold text-sm">No Data</span>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={chartData} 
                cx="50%" 
                cy="50%" 
                innerRadius={65} 
                outerRadius={85} 
                paddingAngle={4}
                dataKey="value" 
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index]} 
                    className="hover:opacity-80 transition-opacity duration-300 outline-none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Custom HTML Legend for better styling control */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 pt-4 border-t border-slate-100/60">
        {chartData.map((entry, i) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span 
              className={`w-3 h-3 rounded-full ${isEmpty ? 'bg-slate-200' : ''}`} 
              style={{ backgroundColor: !isEmpty ? COLORS[i] : undefined }}
            />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}