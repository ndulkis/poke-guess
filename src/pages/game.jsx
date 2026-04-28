import React, { useState, useEffect } from 'react';
import { getRandomPokemon } from '../services/pokeapi';

function Game() {
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(180); 
  
  // MISSING STATE ADDED HERE:
  const [missCount, setMissCount] = useState(0);
  const [revealedLetters, setRevealedLetters] = useState([]);

  useEffect(() => {
    loadNewPokemon();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      handleTimeUp();
    }
  }, [timeLeft]);

  const loadNewPokemon = async () => {
    setLoading(true);
    const pokemon = await getRandomPokemon();
    setCurrentPokemon(pokemon);
    setLoading(false);
    setGuess('');
    setMissCount(0); // Reset misses for the new Pokemon
    setRevealedLetters([]); // Clear the Wordle persistence
  };

  // MISSING SCORING LOGIC ADDED HERE :
  const calculatePoints = (misses) => {
    if (misses === 0) return 100;
    if (misses === 1) return 50;
    if (misses === 2) return 40;
    if (misses === 3) return 35;
    return 30; // 4+ misses
  };

  const applyPenalties = (misses) => {
    if (misses === 3 || misses === 4) setTimeLeft(prev => prev - 5);
    if (misses === 5) setTimeLeft(prev => prev - 10);
    if (misses >= 6) setTimeLeft(prev => prev - 15);
  };

  const handleGuess = (e) => {
    e.preventDefault();
    const correctName = currentPokemon.name.toLowerCase();
    const currentGuess = guess.toLowerCase();

    if (currentGuess === correctName) {
      const points = calculatePoints(missCount);
      setScore(prev => prev + points);
      loadNewPokemon();
    } else {
      const newMissCount = missCount + 1;
      setMissCount(newMissCount);

      // Wordle Logic: Compare and persist [cite: 10, 37]
      const newRevealed = [...revealedLetters];
      for (let i = 0; i < correctName.length; i++) {
        if (currentGuess[i] === correctName[i]) {
          newRevealed[i] = correctName[i];
        }
      }
      setRevealedLetters(newRevealed);
      applyPenalties(newMissCount);
      
      // Auto-populate the input with correct letters [cite: 38]
      const nextPlaceholder = correctName.split('').map((char, i) => newRevealed[i] || "").join("");
      setGuess(nextPlaceholder);
    }
  };

  const handleTimeUp = () => {
    alert(`Time's up! Final Score: ${score}`);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLetterStyle = (char, index, targetName) => {
    if (!char) return "border-slate-800 bg-black text-white"; 
    
    const upperTarget = targetName.toUpperCase();
    const upperChar = char.toUpperCase();

    // Green: Right letter, right spot
    if (upperTarget[index] === upperChar) {
      return "border-green-500 bg-green-500/20 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]";
    }
    // Yellow: Right letter, wrong spot
    if (upperTarget.includes(upperChar)) {
      return "border-yellow-500 bg-yellow-500/20 text-yellow-500";
    }
    // Gray: Wrong letter
    return "border-slate-700 bg-slate-900 text-slate-500";
  };

  useEffect(() => {
    if (guess.length === currentPokemon?.name.length) {
      // Optional: auto-submit when the last letter is typed
      // handleGuess(); 
    }
  }, [guess]);

  if (loading) return <div className="text-white text-center mt-20">Loading Pokémon...</div>;

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col items-center py-12 px-4 font-sans">
      <div className="text-center mb-8">
        <div className="text-white text-6xl font-mono font-bold tracking-tighter mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          {formatTime(timeLeft)}
        </div>
        <div className="text-slate-500 uppercase tracking-[0.2em] text-xs font-black">
          Score: <span className="text-white">{score}</span>
        </div>
      </div>

      <div
      onClick={() => document.querySelector('input').focus()} 
      className="w-full max-w-md bg-[#0f172a]/80 border border-red-900/30 rounded-3xl p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="relative aspect-square mb-8 flex items-center justify-center bg-black/40 rounded-2xl border border-slate-800 overflow-hidden">
          <img 
            src={currentPokemon?.image} 
            alt="Who's that Pokemon?" 
            className="w-4/5 h-4/5 object-contain brightness-0 invert opacity-90 transition-all duration-500"
          />
        </div>

        <form onSubmit={handleGuess} className="space-y-6">
          {/* The Wordle Grid */}
          <div className="flex flex-wrap justify-center gap-1.5 mb-6">
            {currentPokemon?.name.split('').map((_, index) => {
              const char = guess[index] || "";
              return (
                <div
                  key={index}
                  className={`w-10 h-12 border-2 rounded-lg flex items-center justify-center text-xl font-black uppercase transition-all duration-300 ${getLetterStyle(char, index, currentPokemon.name)}`}
                >
                  {char}
                </div>
              );
            })}
          </div>
          
          {/* Real input hidden from view, but captures typing */}
          <input 
            type="text" 
            value={guess}
            onChange={(e) => setGuess(e.target.value.slice(0, currentPokemon.name.length))}
            className="fixed inset-0 opacity-0 cursor-default"
            autoFocus
          />

          <button 
            type="submit"
            className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl shadow-lg shadow-red-900/40 transition-all uppercase tracking-[0.15em] text-sm"
          >
            Submit Guess
          </button>
        </form>      
      </div>

      <button 
        onClick={loadNewPokemon}
        className="mt-8 text-slate-600 hover:text-red-500 font-bold uppercase tracking-widest text-xs transition-all"
      >
        Skip Pokémon
      </button>
    </div>
  );
}

export default Game;