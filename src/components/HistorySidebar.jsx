import React from 'react';

function HistorySidebar({ history }) {
  // If there's no history yet, we can return null or a placeholder
  if (history.length === 0) return null;

  return (
    <div className="hidden xl:flex flex-col gap-3 absolute left-[calc(50%+18rem)] top-24 w-60">
      <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-2 border-b border-slate-800 pb-2">
        History
      </p>
      <div className="flex flex-col gap-3">
        {history.map((item, index) => (
          <div 
            key={index} 
            className={`flex items-center gap-4 p-3 rounded-2xl border transition-all duration-300 ${
              item.isPerfect 
                ? 'border-cyan-500/50 bg-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
                : item.isCorrect 
                  ? 'border-green-500/30 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                  : 'border-slate-800 bg-slate-900/50 opacity-40'
            }`}
          >
            <img 
              src={item.sprite} 
              className={`w-14 h-14 object-contain ${item.isPerfect ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''}`} 
              alt={item.name} 
              style={{ imageRendering: 'pixelated' }} 
            />
            <div className="flex flex-col">
              <span className={`text-[11px] font-black uppercase tracking-tight truncate w-28 ${item.isPerfect ? 'text-cyan-300' : 'text-white'}`}>
                {item.name}
              </span>
              {item.streak > 1 && item.isCorrect && (
                <div className="flex items-center gap-1 mt-1">
                  <span className={`${item.isPerfect ? 'text-cyan-400' : 'text-green-400'} text-[10px] font-black italic`}>
                    {item.streak}x STREAK
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HistorySidebar;