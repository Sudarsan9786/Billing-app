import React from 'react';

const PINPad = ({ onDigit, onBackspace, onClear }) => {
  const digits = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [null, 0, 'backspace']
  ];

  return (
    <div className="grid grid-cols-3 gap-3 p-4">
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
                className="h-14 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-slate-700">backspace</span>
              </button>
            );
          }

          return (
            <button
              key={digit}
              onClick={() => onDigit(digit)}
              className="h-14 rounded-xl bg-white border-2 border-slate-200 text-2xl font-bold text-slate-900 active:scale-95 transition-transform hover:border-primary/50"
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

