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
  const startTimeRef = useRef(null); // To track exactly when the Pokemon appeared
  const [allSolved, setAllSolved] = useState([]); // Full list for the end screen
  const [stats, setStats] = useState({ perfect: 0, great: 0, good: 0, okay: 0 });
  const [pokemonQueue, setPokemonQueue] = useState([]);
  const QUEUE_SIZE = 5; // How many to keep "on deck"

  useEffect(() => {
    const startLoading = async () => {
      // 1. Get the first few ready
      const initialBatch = [];
      for(let i = 0; i < QUEUE_SIZE; i++) {
        const p = await getRandomPokemon(prngRef.current());
        initialBatch.push(p);
      }
      setPokemonQueue(initialBatch);
      
      // 2. Set the very first one to the screen
      setCurrentPokemon(initialBatch[0]);
      setPokemonQueue(prev => prev.slice(1));
      startTimeRef.current = Date.now();
      setLoading(false);
    };
    
    startLoading();
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
    startTimeRef.current = Date.now(); // Record the exact millisecond it appeared
    setLoading(false);
    setGuess('');
    setMissCount(0);
    setRevealedLetters([]);
  };

  const handleGuess = (e) => {
    e.preventDefault();
    const correctName = currentPokemon.name.toLowerCase();
    const currentGuess = guess.toLowerCase();

    // 1. Determine speed and "Perfect" status
    const timeTaken = (Date.now() - startTimeRef.current) / 1000;
    const isPerfect = currentGuess === correctName && timeTaken <= 2;

    if (currentGuess === correctName) {
      let speedText = '';
      let feedbackBorder = ''; 
      let feedbackText = '';
      let statKey = ''; // To track which stat to increment

      // Set the visual styles based on speed
      if (timeTaken <= 2) {
        speedText = "PERFECT!";
        statKey='perfect';
        feedbackBorder = 'border-cyan-400';
        feedbackText = 'text-cyan-400';
      } else if (timeTaken <= 4) {
        speedText = "GREAT!";
        statKey='great';
        feedbackBorder = 'border-green-400';
        feedbackText = 'text-green-400';
      } else if (timeTaken <= 10) {
        speedText = "GOOD!";
        statKey='good';
        feedbackBorder = 'border-yellow-400';
        feedbackText = 'text-yellow-400';
      } else {
        speedText = "OKAY";
        statKey='okay';
        feedbackBorder = 'border-slate-500';
        feedbackText = 'text-slate-500';
      }

      // Update stat count
      setStats(prev => ({ ...prev, [statKey]: prev[statKey] + 1 }));
      
      const basePoints = calculatePoints(missCount);
      // Logic for total points including speed bonus
      const speedBonus = isPerfect ? 500 : (timeTaken <= 4 ? 50 : (timeTaken <= 10 ? 25 : 0));
      const totalPoints = basePoints + speedBonus;

      // Update global game stats
      setScore(prev => prev + totalPoints);
      setSolvedCount(prev => prev + 1);
      
      // Update visual feedback popup
      setFeedback({ 
        text: speedText, 
        points: totalPoints, 
        visible: true, 
        borderColor: feedbackBorder, 
        textColor: feedbackText 
      });
      setTimeout(() => setFeedback(prev => ({ ...prev, visible: false })), 2000);

      
      // --- NEW: Update History for Correct Guess ---
      const newStreak = streak + 1;
      const historyItem = {
        name: currentPokemon.name,
        sprite: isPerfect ? currentPokemon.shinySprite : currentPokemon.pixelSprite,
        isCorrect: true,
        isPerfect: isPerfect,
        streak: newStreak
      };

      // History bar shows LAST 5 
      setHistory(prev => [historyItem, ...prev].slice(0, 7));
      // Full Collection (Everything for game over screen)
      setAllSolved(prev => [...prev, historyItem]);

      setStreak(newStreak);
      playCry(currentPokemon.cry, true);

      nextPokemon();

    } else {
      // --- Handle Incorrect Guess ---
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
      
      // Optional: If you want incorrect guesses to show in history, do it here. 
      // Otherwise, just leave the streak logic:
      setStreak(0);
      playCry(null, false);
    }

    // IMPORTANT: Remove the old "const result = ..." and "setHistory" that used to be here!
  };


  const handleTimeUp = () => {
    setGameOver(true);
    endGame(score, solvedCount);
  };

  const handlePlayAgain = async () => { //aysnc
    prngRef.current = createPRNG(getDailySeed());
    //Reset seed engine
    prngRef.current = createPRNG(getDailySeed());
    // Clear game state
    setScore(0);
    setSolvedCount(0);
    setTimeLeft(180);
    setGameOver(false);
    setCopied(false);
    setHistory([]);
    setAllSolved([]); // Important: Clear the collection
    setStats({ perfect: 0, great: 0, good: 0, okay: 0 }); // Important: Clear stats

    // Re-initialize the queue properly
    const initialBatch = [];
    for(let i = 0; i < QUEUE_SIZE; i++) {
      const p = await getRandomPokemon(prngRef.current());
      initialBatch.push(p);
    }
    setPokemonQueue(initialBatch.slice(1));
    setCurrentPokemon(initialBatch[0]);
    startTimeRef.current = Date.now();
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

  // In Game.jsx, update this state definition:
const [feedback, setFeedback] = useState({ 
    text: '', 
    points: 0, 
    visible: false,
    // ADD THESE:
    borderColor: 'border-yellow-400', // for the left border
    textColor: 'text-yellow-400'      // for the big text
  });

const refillQueue = async () => {
    setPokemonQueue(prev => {
      // If we already have enough, don't do anything
      if (prev.length >= QUEUE_SIZE) return prev;

      // We need to figure out how many to fetch
      const needed = QUEUE_SIZE - prev.length;
      
      // Fetch them in parallel for speed
      const fetchPromises = Array.from({ length: needed }).map(() => {
        const randomValue = prngRef.current();
        return getRandomPokemon(randomValue);
      });

      Promise.all(fetchPromises).then(newPokemon => {
        setPokemonQueue(current => [...current, ...newPokemon]);
      });

      return prev; 
    });
  };

const nextPokemon = () => {
    if (pokemonQueue.length === 0) return; 

    const next = pokemonQueue[0];
    // Reset state BEFORE setting the new pokemon to prevent "flicker"
    setGuess('');
    setMissCount(0);
    setRevealedLetters([]);
    
    setCurrentPokemon(next);
    setPokemonQueue(prev => prev.slice(1));
    refillQueue();

    startTimeRef.current = Date.now();
  };

if (loading) return <div className="text-white text-center mt-20">Loading Pokémon...</div>;

  // We wrap EVERYTHING in one Fragment so the Navbar is always at the top
  return (
    <div className="min-h-screen bg-[#05070a] flex flex-col relative overflow-x-hidden">
      <Navbar /> 

      <main className="flex-grow flex flex-col items-center py-8 px-4 font-sans text-white relative">
        {/* Invisible Preloader */}
        <div className="hidden">
          {pokemonQueue.map((p, i) => (
            <img key={i} src={p.image} />
          ))}
        </div>
         {/* NEW FEEDBACK POPUP: RE-STYLED AND RE-POSITIONED */}
        <div 
          className={`absolute top-48 z-50 left-[calc(50%-28rem)] flex items-center justify-center transition-all duration-500 ease-in-out transform 
            ${feedback.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
        >
          <div 
            className={`bg-[#0f172a]/90 backdrop-blur-xl border-l-4 p-6 rounded-r-2xl shadow-2xl pointer-events-auto 
              ${feedback.borderColor} /* New border color dynamic class */`}
          >
            <p 
              className={`font-black tracking-tighter text-3xl italic drop-shadow-lg uppercase 
                ${feedback.textColor} /* New text color dynamic class */`}
            >
              {feedback.text}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-white font-mono font-bold text-2xl">+{feedback.points}</span>
              <span className="text-slate-500 font-black text-xs uppercase tracking-widest">pts</span>
            </div>
          </div>
        </div>
        {gameOver ? (
          /* --- UPDATED GAME OVER SCREEN --- */
          <div className="w-full max-w-md bg-[#0f172a]/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center flex flex-col items-center gap-6 mt-10">
            <p className="text-slate-500 uppercase tracking-[0.25em] text-xs font-black">Time's Up</p>
            
            {(() => {
              const rank = getRank(score);
              return (
                <div className={`border-2 ${rank.color} ${rank.bg} rounded-2xl px-5 py-2`}>
                  <span className={`font-black text-lg ${rank.text}`}>{rank.title}</span>
                </div>
              );
            })()}

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

            {/* Pokémon Showcase (Sorted: Shinies First) */}
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

            <div className="flex justify-between w-full px-2 border-t border-slate-800 pt-6">
              <div className="text-left">
                <p className="text-4xl font-black font-mono tracking-tighter">{score}</p>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest">Total Score</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black font-mono tracking-tighter">{solvedCount}</p>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest">Caught</p>
              </div>
            </div>

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
            <div className="text-center mb-6">
              <div className="text-white text-5xl font-mono font-bold tracking-tighter mb-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                {formatTime(timeLeft)}
              </div>
              <div className="text-slate-500 uppercase tracking-[0.2em] text-xs font-black">
                Score: <span className="text-white">{score}</span>
              </div>
            </div>

            <div
              onClick={() => document.querySelector('input').focus()}
              className="w-full max-w-sm bg-[#0f172a]/80 border border-red-900/30 rounded-3xl p-6 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >

              <div className="relative aspect-square mb-8 flex items-center justify-center bg-black/40 rounded-2xl border border-slate-800 overflow-hidden">
                <img
                  src={currentPokemon?.image}
                  alt="Who's that Pokemon?"
                  className="h-4/5 w-auto object-contain brightness-0 invert opacity-90 transition-all duration-500"
                />
              </div>

              <form onSubmit={handleGuess} className="space-y-4">
                <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                  {currentPokemon?.name.split('').map((_, index) => {
                    const char = guess[index] || '';
                    return (
                      <div key={index} className={`w-8 h-10 border-2 rounded-lg flex items-center justify-center text-xl font-black uppercase transition-all duration-300 ${getLetterStyle(char, index, currentPokemon.name)}`}>
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

            <button onClick={nextPokemon} className="mt-8 text-slate-600 hover:text-red-500 font-bold uppercase tracking-widest text-xs transition-all">
              Skip Pokémon
            </button>
            {/* History Sidebar - Pushed further right */}
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
                        ? 'border-cyan-500/50 bg-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.3)]' // Blue for Perfect
                        : item.isCorrect 
                          ? 'border-green-500/30 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.1)]' // Normal Green
                          : 'border-slate-800 bg-slate-900/50 opacity-40' // Wrong
                    }`}
                  >
                  <img 
                    src={item.sprite} // This will be the Shiny sprite if item.isPerfect is true
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
          </>
        )}
      </main>
    </div>
  );
}

export default Game;