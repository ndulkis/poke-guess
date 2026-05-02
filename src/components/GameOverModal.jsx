import React from 'react';
import { getRank } from '../utils/scoring'; // Make sure this path is correct!

function GameOverModal({ 
  score, 
  solvedCount, 
  allSolved, 
  stats, 
  handlePlayAgain, 
  handleShare, 
  copied 
}) {
  const rank = getRank(score);

  return (
    <div className="w-full max-w-md bg-[#0f172a]/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center flex flex-col items-center gap-6 mt-10">
      <p className="text-slate-500 uppercase tracking-[0.25em] text-xs font-black">Time's Up</p>
      
      {/* Rank Display */}
      <div className={`border-2 ${rank.color} ${rank.bg} rounded-2xl px-5 py-2`}>
        <span className={`font-black text-lg ${rank.text}`}>{rank.title}</span>
      </div>

      {/* Speed Stats Row */}
      <div className="grid grid-cols-4 gap-2 w-full">
        <div className="flex flex-col p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
          <span className="text-cyan-400 font-black text-lg">{stats.perfect}</span>
          <span className="text-[8px] text-cyan-400/60 uppercase font-black">Perf</span>
        </div>
        <div className="flex flex-col p-2 bg-green-500/10 border border-green-500/20 rounded-xl">
          <span className="text-green-400 font-black text-lg">{stats.great}</span>
          <span className="text-[8px] text-green-400/60 uppercase font-black">Great</span>
        </div>
        <div className="flex flex-col p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <span className="text-yellow-400 font-black text-lg">{stats.good}</span>
          <span className="text-[8px] text-yellow-400/60 uppercase font-black">Good</span>
        </div>
        <div className="flex flex-col p-2 bg-slate-800/50 border border-slate-700 rounded-xl">
          <span className="text-slate-400 font-black text-lg">{stats.okay}</span>
          <span className="text-[8px] text-slate-500 uppercase font-black">Okay</span>
        </div>
      </div>

      {/* Pokémon Showcase */}
      <div className="w-full bg-black/30 rounded-2xl p-4 border border-slate-800/50">
        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-3 text-left">Session Collection</p>
        <div className="flex flex-wrap justify-center gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
          {[...allSolved]
            .sort((a, b) => (b.isPerfect === a.isPerfect ? 0 : b.isPerfect ? 1 : -1))
            .map((poke, i) => (
              <div 
                key={i} 
                className={`p-1 rounded-lg border ${
                  poke.isPerfect ? 'border-cyan-500/50 bg-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.2)]' : 'border-slate-800 bg-slate-900/40'
                }`}
              >
                <img 
                  src={poke.sprite} 
                  className={`w-10 h-10 object-contain ${poke.isPerfect ? 'drop-shadow-[0_0_5px_white]' : ''}`}
                  alt={poke.name}
                />
              </div>
            ))}
        </div>
      </div>

      {/* Score Totals */}
      <div className="flex justify-between w-full px-2 border-t border-slate-800 pt-6">
        <div className="text-left">
          <p className="text-4xl font-black font-mono tracking-tighter text-white">{score}</p>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest">Total Score</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black font-mono tracking-tighter text-white">{solvedCount}</p>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest">Caught</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 w-full mt-2">
        <button onClick={handleShare} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all uppercase tracking-widest text-xs">
          {copied ? 'Copied!' : 'Share Result'}
        </button>
        <button onClick={handlePlayAgain} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-xl shadow-lg shadow-red-900/40 transition-all uppercase tracking-widest text-xs">
          Play Again
        </button>
      </div>
    </div>
  );
}

export default GameOverModal;