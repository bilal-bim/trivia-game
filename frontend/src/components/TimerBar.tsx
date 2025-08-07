import React, { useEffect, useState } from 'react';

interface TimerBarProps {
  timeLeft: number;
  totalTime: number;
  isActive?: boolean;
}

const TimerBar: React.FC<TimerBarProps> = ({ timeLeft, totalTime, isActive = true }) => {
  const [displayTime, setDisplayTime] = useState(timeLeft);

  useEffect(() => {
    setDisplayTime(timeLeft);
  }, [timeLeft]);

  const percentage = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
  
  const getColorClasses = () => {
    if (percentage > 60) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const getTextColorClasses = () => {
    if (percentage > 60) return 'text-green-700';
    if (percentage > 30) return 'text-yellow-700';
    return 'text-red-700';
  };

  const formatTime = (seconds: number) => {
    return `${Math.max(0, seconds)}s`;
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">Time Remaining</span>
        <span className={`text-lg font-bold ${getTextColorClasses()}`}>
          {formatTime(displayTime)}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${getColorClasses()} ${
            isActive ? 'animate-pulse-slow' : ''
          }`}
          style={{ width: `${Math.max(0, percentage)}%` }}
        />
      </div>
      
      {timeLeft <= 5 && timeLeft > 0 && isActive && (
        <div className="text-center mt-2">
          <span className="text-red-600 font-bold text-xl animate-bounce">
            {timeLeft}
          </span>
        </div>
      )}
    </div>
  );
};

export default TimerBar;