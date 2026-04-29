import React, { useState, useEffect } from 'react';
import { getRandomPokemon } from '../services/pokeapi';
import { calculatePoints, getTimePenalty, getRank } from '../utils/scoring';
import { formatShareText } from '../utils/shareFormatter';
import { useGame } from '../context/GameContext';
import Navbar from '../components/Navbar';
import { getDailySeed, createPRNG } from '../services/seedEngine';
import { useRef } from 'react';


function Game() {
  const prngRef = useRef(createPRNG(getDailySeed()));
  const { endGame } = useGame();

  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(180);
  const [missCount, setMissCount] = useState(0);
  const [revealedLetters, setRevealedLetters] = useState([]);
  const [solvedCount, setSolvedCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]); // Array of { name, image, typeColor, isCorrect }
  const [streak, setStreak] = useState(0); // For that multiplier vibe

  useEffect(() => {
    loadNewPokemon();
  }, []);

  useEffect(() => {
    if (gameOver) return;
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      handleTimeUp();
    }
  }, [timeLeft, gameOver]);

  const loadNewPokemon = async () => {
    setLoading(true);

    // Use the seeded random number instead of Math.random()
    const randomValue = prngRef.current(); 
    const pokemon = await getRandomPokemon(randomValue); 

    setCurrentPokemon(pokemon);
    setLoading(false);
    setGuess('');
    setMissCount(0);
    setRevealedLetters([]);
  };

  const handleGuess = (e) => {
    e.preventDefault();
    const correctName = currentPokemon.name.toLowerCase();
    const currentGuess = guess.toLowerCase();

    if (currentGuess === correctName) {
      const points = calculatePoints(missCount);
      setScore(prev => prev + points);
      setSolvedCount(prev => prev + 1);
      loadNewPokemon();
    } else {
      const newMissCount = missCount + 1;
      setMissCount(newMissCount);

      const newRevealed = [...revealedLetters];
      for (let i = 0; i < correctName.length; i++) {
        if (currentGuess[i] === correctName[i]) {
          newRevealed[i] = correctName[i];
        }
      }
      setRevealedLetters(newRevealed);

      const penalty = getTimePenalty(newMissCount);
      if (penalty > 0) setTimeLeft(prev => Math.max(0, prev - penalty));

      const nextPlaceholder = correctName.split('').map((_, i) => newRevealed[i] || '').join('');
      setGuess(nextPlaceholder);
    }

    const result = {
      name: currentPokemon.name,
      sprite: currentPokemon.pixelSprite, 
      isCorrect: currentGuess === correctName,
      streak: currentGuess === correctName ? streak + 1 : 0
    };

    setHistory(prev => [result, ...prev].slice(0, 5)); // Keep last 5
    if (result.isCorrect) {
      setStreak(prev => prev + 1);
      playCry(currentPokemon.cry, true);
    } else {
      setStreak(0);
      playCry(null, false);
    }
  };

  

  const handleTimeUp = () => {
    setGameOver(true);
    endGame(score, solvedCount);
  };

  const handlePlayAgain = () => {
    setScore(0);
    setSolvedCount(0);
    setTimeLeft(180);
    setGameOver(false);
    setCopied(false);
    loadNewPokemon();
  };

  const handleShare = () => {
    const rank = getRank(score);
    navigator.clipboard.writeText(formatShareText(score, rank.title, solvedCount));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLetterStyle = (char, index, targetName) => {
    if (!char) return 'border-slate-800 bg-black text-white';
    const upperTarget = targetName.toUpperCase();
    const upperChar = char.toUpperCase();
    if (upperTarget[index] === upperChar) {
      return 'border-green-500 bg-green-500/20 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]';
    }
    if (upperTarget.includes(upperChar)) {
      return 'border-yellow-500 bg-yellow-500/20 text-yellow-500';
    }
    return 'border-slate-700 bg-slate-900 text-slate-500';
  };

const playCry = (url, isCorrect) => {
    // If it's a wrong answer, we use the local poison sound
    const audio = new Audio(isCorrect ? url : '/sounds/poison.mp3');
    
    // 0.03 is the "Goldilocks" volume: audible but not annoying.
    audio.volume = 0.03; 
    
    // Standard error handling in case the browser blocks it
    audio.play().catch(e => console.log("Audio play prevented:", e));
  };

if (loading) return <div className="text-white text-center mt-20">Loading Pokémon...</div>;

  // We wrap EVERYTHING in one Fragment so the Navbar is always at the top
  return (
    <div className="min-h-screen bg-[#05070a] flex flex-col">
      <Navbar /> 

      <main className="flex-grow flex flex-col items-center py-12 px-4 font-sans text-white">
        
        {gameOver ? (
          /* --- GAME OVER SCREEN --- */
          <div className="w-full max-w-sm bg-[#0f172a]/80 border border-slate-800 rounded-3xl p-10 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center flex flex-col items-center gap-6 mt-10">
            <p className="text-slate-500 uppercase tracking-[0.25em] text-xs font-black">Time's Up</p>
            
            {/* Using the rank variable which we need to define here */}
            {(() => {
              const rank = getRank(score);
              return (
                <div className={`border-2 ${rank.color} ${rank.bg} rounded-2xl px-5 py-2`}>
                  <span className={`font-black text-lg ${rank.text}`}>{rank.title}</span>
                </div>
              );
            })()}

            <div>
              <p className="text-6xl font-black font-mono tracking-tighter">{score}</p>
              <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">points</p>
            </div>

            <p className="text-slate-400 text-sm">
              <span className="text-white font-bold">{solvedCount}</span> Pokémon solved
            </p>

            <div className="flex flex-col gap-3 w-full mt-2">
              <button onClick={handleShare} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all uppercase tracking-widest text-xs">
                {copied ? 'Copied!' : 'Share Result'}
              </button>
              <button onClick={handlePlayAgain} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-xl shadow-lg shadow-red-900/40 transition-all uppercase tracking-widest text-xs">
                Play Again
              </button>
            </div>
          </div>
        ) : (
          /* --- ACTIVE GAME SCREEN --- */
          <>
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
              className="w-full max-w-md bg-[#0f172a]/80 border border-red-900/30 rounded-3xl p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="relative aspect-square mb-8 flex items-center justify-center bg-black/40 rounded-2xl border border-slate-800 overflow-hidden">
                <img
                  src={currentPokemon?.image}
                  alt="Who's that Pokemon?"
                  className="w-4/5 h-4/5 object-contain brightness-0 invert opacity-90 transition-all duration-500"
                />
              </div>

              <form onSubmit={handleGuess} className="space-y-6">
                <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                  {currentPokemon?.name.split('').map((_, index) => {
                    const char = guess[index] || '';
                    return (
                      <div key={index} className={`w-10 h-12 border-2 rounded-lg flex items-center justify-center text-xl font-black uppercase transition-all duration-300 ${getLetterStyle(char, index, currentPokemon.name)}`}>
                        {char}
                      </div>
                    );
                  })}
                </div>
        
                <input
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value.slice(0, currentPokemon.name.length))}
                  className="fixed opacity-0 pointer-events-none"
                  autoFocus
                />

                <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl shadow-lg shadow-red-900/40 transition-all uppercase tracking-[0.15em] text-sm">
                  Submit
                </button>
              </form>
            </div>

            <button onClick={loadNewPokemon} className="mt-8 text-slate-600 hover:text-red-500 font-bold uppercase tracking-widest text-xs transition-all">
              Skip Pokémon
            </button>
            {/* History Sidebar */}
            <div className="hidden lg:flex flex-col gap-2 absolute right-10 top-24 w-48">
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">History</p>
              {history.map((item, index) => (
                <div 
                  key={index} 
                  className={`flex items-center gap-3 p-2 rounded-xl border ${item.isCorrect ? 'border-green-500/30 bg-green-500/10' : 'border-slate-800 bg-slate-900/50 opacity-50'}`}
                >
                  <img src={item.sprite} 
                      className="w-10 h-10 object-contain" 
                      alt={item.name} />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase truncate w-24">{item.name}</span>
                    {item.streak > 1 && item.isCorrect && (
                      <span className="text-green-400 text-[10px] font-black">x{item.streak}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Game;