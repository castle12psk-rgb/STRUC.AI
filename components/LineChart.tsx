import React from 'react';

interface Point {
  label: string;
  value: number;
}

interface LineChartProps {
  data: Point[];
  width?: number;
  height?: number;
  threshold?: number;
  eventIndex?: number;
  unit: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 380,
  height = 200,
  threshold,
  eventIndex,
  unit,
}) => {
  if (data.length < 2) {
    return <div className="flex items-center justify-center" style={{ width, height }}><p className="text-sm text-slate-500">데이터 부족</p></div>;
  }

  const padding = { top: 20, right: 40, bottom: 30, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map(p => p.value);
  const dataMax = Math.max(...values);
  const dataMin = Math.min(...values);

  const yMax = threshold ? Math.max(dataMax, threshold) * 1.15 : dataMax * 1.15;
  const yMin = Math.min(dataMin > 0 ? dataMin * 0.85 : dataMin * 1.15, 0);
  const yRange = yMax - yMin === 0 ? 1 : yMax - yMin;

  const getX = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;
  const getY = (value: number) => padding.top + chartHeight - ((value - yMin) / yRange) * chartHeight;

  const path = data.map((point, i) => {
    const command = i === 0 ? 'M' : 'L';
    return `${command} ${getX(i)} ${getY(point.value)}`;
  }).join(' ');
  
  const yAxisTicks = Array.from({length: 4}, (_, i) => yMin + (yRange / 3) * i);

  return (
    <svg width={width} height={height}>
      {/* Axes */}
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="currentColor" className="text-slate-700" strokeWidth="1" />
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="currentColor" className="text-slate-700" strokeWidth="1" />

      {/* Y-axis labels */}
      {yAxisTicks.map((tick, i) => (
        <g key={i}>
          <text x={padding.left - 8} y={getY(tick)} dy="0.32em" textAnchor="end" className="text-xs fill-current text-slate-400">{tick.toFixed(2)}</text>
          <line x1={padding.left} y1={getY(tick)} x2={width - padding.right} y2={getY(tick)} className="text-slate-800" strokeDasharray="2,2" />
        </g>
      ))}
      <text x={padding.left} y={padding.top - 8} className="text-xs fill-current text-slate-400">{unit}</text>

      {/* Threshold line */}
      {threshold !== undefined && getY(threshold) > padding.top && (
        <g>
          <line x1={padding.left} y1={getY(threshold)} x2={width - padding.right} y2={getY(threshold)} className="text-orange-500" strokeWidth="1.5" strokeDasharray="4,4" />
          <text x={width - padding.right + 4} y={getY(threshold)} dy="0.32em" className="text-xs fill-current text-orange-400 font-semibold">임계값</text>
        </g>
      )}

      {/* Data line */}
      <path d={path} fill="none" className="text-indigo-400" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      
      {/* Event point */}
      {eventIndex !== undefined && data[eventIndex] && (
        <g>
          <circle cx={getX(eventIndex)} cy={getY(data[eventIndex].value)} r="6" className="fill-slate-800 stroke-2 stroke-red-500" />
          <circle cx={getX(eventIndex)} cy={getY(data[eventIndex].value)} r="3" className="fill-red-500" />
        </g>
      )}
    </svg>
  );
};
