import React from 'react';

interface AnswerButtonProps {
  option: string;
  index: number;
  isSelected: boolean;
  isCorrect?: boolean;
  isRevealed?: boolean;
  onClick: (index: number) => void;
  disabled?: boolean;
}

const AnswerButton: React.FC<AnswerButtonProps> = ({
  option,
  index,
  isSelected,
  isCorrect = false,
  isRevealed = false,
  onClick,
  disabled = false,
}) => {
  const getButtonClasses = () => {
    let baseClasses = 'w-full p-4 text-left font-medium rounded-lg border-2 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg';
    
    if (disabled && !isRevealed) {
      return `${baseClasses} bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed`;
    }
    
    if (isRevealed) {
      if (isCorrect) {
        return `${baseClasses} bg-green-100 text-green-800 border-green-400 shadow-green-200`;
      } else if (isSelected) {
        return `${baseClasses} bg-red-100 text-red-800 border-red-400 shadow-red-200`;
      } else {
        return `${baseClasses} bg-gray-100 text-gray-600 border-gray-300`;
      }
    }
    
    if (isSelected) {
      return `${baseClasses} bg-primary-100 text-primary-800 border-primary-400 shadow-primary-200`;
    }
    
    return `${baseClasses} bg-white text-gray-800 border-gray-300 hover:border-primary-300 hover:bg-primary-50`;
  };

  const getOptionLabel = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D
  };

  return (
    <button
      className={getButtonClasses()}
      onClick={() => !disabled && onClick(index)}
      disabled={disabled && !isRevealed}
      aria-label={`Option ${getOptionLabel(index)}: ${option}`}
    >
      <div className="flex items-center space-x-3">
        <span className="flex-shrink-0 w-8 h-8 bg-current bg-opacity-20 rounded-full flex items-center justify-center text-sm font-bold">
          {getOptionLabel(index)}
        </span>
        <span className="flex-1">{option}</span>
        {isRevealed && isCorrect && (
          <span className="flex-shrink-0 text-green-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        )}
        {isRevealed && isSelected && !isCorrect && (
          <span className="flex-shrink-0 text-red-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </div>
    </button>
  );
};

export default AnswerButton;