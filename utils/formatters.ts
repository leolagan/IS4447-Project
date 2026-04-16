export function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatUnit(unit: string, metricType: string): string {
  return metricType === 'boolean' ? 'Done / Not Done' : unit;
}

export function formatValue(value: number, unit: string, metricType: string): string {
  if (value === 0) return '0';
  if (unit === 'hrs/mins') return formatMinutes(Math.round(value));
  if (metricType === 'boolean') return `${value}×`;
  return `${value} ${unit}`;
}
