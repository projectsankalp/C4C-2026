export function riskColor(level) {
  if (level === 'HIGH') return 'text-red-600 bg-red-50 border-red-200';
  if (level === 'MEDIUM') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-green-600 bg-green-50 border-green-200';
}

export function riskBg(level) {
  if (level === 'HIGH') return 'bg-red-600';
  if (level === 'MEDIUM') return 'bg-yellow-500';
  return 'bg-green-600';
}

export function riskEmoji(level) {
  if (level === 'HIGH') return '🔴';
  if (level === 'MEDIUM') return '🟡';
  return '🟢';
}
