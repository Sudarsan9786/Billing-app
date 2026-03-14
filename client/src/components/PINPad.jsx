import React from 'react';

const PINPad = ({ onDigit, onBackspace, onClear }) => {
  const digits = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [null, 0, 'backspace']
  ];

  return (
    <div className="grid grid-cols-3 gap-4 p-4 justify-items-center">
      {digits.map((row, rowIndex) =>
        row.map((digit, colIndex) => {
          if (digit === null) {
            return <div key={`${rowIndex}-${colIndex}`}></div>;
          }

          if (digit === 'backspace') {
            return (
              <button
                key="backspace"
                onClick={onBackspace}
                className="h-16 w-16 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm hover:shadow-md hover:border-primary/30 active:scale-[0.96] active:bg-primary/5 active:border-primary transition-all duration-150 p-4"
              >
                <span className="material-symbols-outlined text-slate-700 text-2xl">backspace</span>
              </button>
            );
          }

          return (
            <button
              key={digit}
              onClick={() => onDigit(digit)}
              className="h-16 w-16 rounded-full bg-white border-2 border-slate-200 text-3xl font-bold text-slate-800 shadow-sm hover:shadow-md hover:border-primary/30 active:scale-[0.96] active:bg-primary/5 active:border-primary transition-all duration-150 select-none touch-manipulation flex items-center justify-center p-4"
            >
              {digit}
            </button>
          );
        })
      )}
    </div>
  );
};

export default PINPad;

