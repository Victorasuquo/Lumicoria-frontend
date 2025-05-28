import React from 'react';

interface BarChartProps {
  data: number[];
  labels?: string[];
  height?: string;
  width?: string;
  title?: string;
  colors?: string[];
  yAxis?: boolean;
  xAxis?: boolean;
}

interface LineChartProps {
  data: number[];
  labels?: string[];
  height?: string;
  width?: string;
  title?: string;
  color?: string;
  yAxis?: boolean;
  xAxis?: boolean;
}

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  labels = [],
  height = '100%',
  width = '100%',
  title = '',
  colors = ['#7C3AED'], // Default purple color
  yAxis = true,
  xAxis = true
}) => {
  // Find max value to calculate bar heights
  const maxValue = Math.max(...data);
  
  return (
    <div style={{ height, width }} className="relative">
      {title && <h4 className="text-sm font-medium mb-2">{title}</h4>}
      <div className="flex items-end h-full space-x-2 relative">
        {/* Y-axis values */}
        {yAxis && (
          <div className="absolute left-0 inset-y-0 w-10 flex flex-col justify-between text-xs text-gray-500">
            <span>{maxValue}</span>
            <span>{Math.round(maxValue / 2)}</span>
            <span>0</span>
          </div>
        )}
        
        {/* Charts */}
        <div className={`flex items-end h-full space-x-2 ${yAxis ? 'ml-10' : ''}`}>
          {data.map((value, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                style={{ 
                  height: `${(value / maxValue) * 100}%`,
                  backgroundColor: colors[index % colors.length],
                  minWidth: '1.5rem'
                }} 
                className="rounded-t-sm w-full"
              />
              {xAxis && labels[index] && (
                <span className="text-xs mt-1 text-gray-500">{labels[index]}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const LineChart: React.FC<LineChartProps> = ({
  data,
  labels = [],
  height = '100%',
  width = '100%',
  title = '',
  color = '#7C3AED', // Default purple color
  yAxis = true,
  xAxis = true
}) => {
  // Find max value to calculate point positions
  const maxValue = Math.max(...data);
  
  // Calculate points for SVG polyline
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value / maxValue) * 100);
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div style={{ height, width }} className="relative">
      {title && <h4 className="text-sm font-medium mb-2">{title}</h4>}
      
      <div className={`h-full w-full ${yAxis ? 'ml-10' : ''}`}>
        {/* Y-axis values */}
        {yAxis && (
          <div className="absolute left-0 inset-y-0 w-10 flex flex-col justify-between text-xs text-gray-500">
            <span>{maxValue}</span>
            <span>{Math.round(maxValue / 2)}</span>
            <span>0</span>
          </div>
        )}
        
        <svg className="h-full w-full overflow-visible" preserveAspectRatio="none">
          {/* Line chart */}
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Data points */}
          {data.map((value, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((value / maxValue) * 100);
            
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill="white"
                stroke={color}
                strokeWidth="2"
              />
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        {xAxis && labels.length > 0 && (
          <div className="flex justify-between mt-2">
            {labels.map((label, index) => (
              <span key={index} className="text-xs text-gray-500">{label}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 100,
  strokeWidth = 10,
  color = '#7C3AED',
  label
}) => {
  // Calculate the circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb" // Light gray color
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      {label && (
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-2xl font-bold">{value}%</span>
          {label && <span className="text-xs text-gray-500">{label}</span>}
        </div>
      )}
    </div>
  );
};