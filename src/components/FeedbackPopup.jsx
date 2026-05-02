import React from 'react';

function FeedbackPopup({ feedback }) {
  return (
    <div 
      className={`absolute top-48 z-50 left-[calc(50%-28rem)] flex items-center justify-center transition-all duration-500 ease-in-out transform 
        ${feedback.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
    >
      <div 
        className={`bg-[#0f172a]/90 backdrop-blur-xl border-l-4 p-6 rounded-r-2xl shadow-2xl pointer-events-auto 
          ${feedback.borderColor}`}
      >
        <p className={`font-black tracking-tighter text-3xl italic drop-shadow-lg uppercase ${feedback.textColor}`}>
          {feedback.text}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-white font-mono font-bold text-2xl">+{feedback.points}</span>
          <span className="text-slate-500 font-black text-xs uppercase tracking-widest">pts</span>
        </div>
      </div>
    </div>
  );
}

export default FeedbackPopup;