import React from 'react';

function PokemonStage({ pokemon, children, feedback, history, nextPokemon, gameOver }) {
  // 1. Try to get the very last item in history (newest at index 0)
  const lastFromHistory = (history && history.length > 0) ? history[0] : null;
  
  // 2. SAFETY CHECK: Show current sprite if correct, otherwise last catch
  const displaySprite = (feedback.visible && feedback.text.toLowerCase().includes('correct'))
    ? pokemon?.sprite 
    : lastFromHistory?.sprite;
  
  return (
    <div className="w-full flex flex-col items-center">
      
      {/* MAIN GAME ROW */}
      <div className="flex flex-col gap-2 w-full max-w-sm items-center justify-center relative mb-10">

        {/* 1. POKEMON CARD */}
        <div
          onClick={() => document.querySelector('input')?.focus()}
          className="relative w-full max-w-[260px] md:max-w-none aspect-square bg-[#0f172a]/80 border border-slate-800 rounded-3xl flex items-center justify-center overflow-visible shadow-2xl cursor-pointer"
        >
          <img
            src={pokemon?.image}
            alt="Who's that Pokemon?"
            className="h-[65%] w-auto object-contain brightness-0 invert opacity-90 transition-all duration-500"
          />

          {/* 2. STATUS HUB PILL (Mobile Only) - Wrapped in !gameOver */}
          {!gameOver && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[95%] z-20 md:hidden flex">
              <div className={`
                relative h-12 w-full flex items-center px-2 rounded-2xl border backdrop-blur-xl transition-all duration-500
                ${feedback.visible 
                  ? `${feedback.borderColor} bg-slate-900/95 shadow-[0_0_20px_rgba(0,0,0,0.4)]` 
                  : 'border-slate-800 bg-slate-950/80 shadow-xl'}
              `}>
                {/* History Sprite Badge */}
                <div className="flex items-center justify-center pr-2 border-r border-slate-800/50 min-w-[45px]">
                  {displaySprite ? (
                    <img 
                      key={displaySprite} 
                      src={displaySprite} 
                      className="w-8 h-8 object-contain relative z-10 drop-shadow-md" 
                      alt="Latest catch"
                    />
                  ) : (
                    <span className="text-slate-700 font-black text-xs">?</span>
                  )}
                </div>

                {/* Feedback Points & Text */}
                <div className="flex-grow pl-3 flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${feedback.textColor}`}>
                    {feedback.visible ? feedback.text : 'Ready...'}
                  </span>
                  {feedback.visible && (
                    <span className="text-white font-mono font-bold text-[10px] bg-white/10 px-1.5 py-0.5 rounded">
                      +{feedback.points}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div> {/* END POKEMON CARD */}
      </div>

      {/* 3. GUESS INPUT AREA (Children) */}
      <div className="w-full flex justify-center py-2">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>

      {/* 4. SKIP BUTTON */}
      <button
        onClick={nextPokemon}
        className="mt-4 text-slate-700 hover:text-red-500 font-black uppercase text-[10px] tracking-widest transition-all"
      >
        Skip Pokémon
      </button>
    </div>
  );
}

export default PokemonStage;