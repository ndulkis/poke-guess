import React from 'react';

function GuessInput({ guess, setGuess, targetName, handleGuess, getLetterStyle }) {
  return (
    <div className="w-full">
      {/* 
        We use an ID so the "Submit" button in PokemonStage.jsx 
        can trigger this form from outside the div 
      */}
      <form id="guess-form" onSubmit={handleGuess} className="flex flex-col items-center">
        
        {/* Letter Boxes Container */}
        <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 mb-2">
          {targetName.split('').map((_, index) => {
            const char = guess[index] || '';
            return (
              <div 
                key={index} 
                className={`w-7 h-9 md:w-10 md:h-12 border-2 rounded-lg flex items-center justify-center text-lg md:text-2xl font-black uppercase transition-all duration-300 ${getLetterStyle(char, index, targetName)}`}
              >
                {char}
              </div>
            );
          })}
        </div>

        {/* 
          The Real Input (Invisible) 
          Mobile users will trigger this when they tap the Pokemon Stage
        */}
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value.slice(0, targetName.length))}
          className="fixed opacity-0 pointer-events-none"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
      </form>
    </div>
  );
}

export default GuessInput;