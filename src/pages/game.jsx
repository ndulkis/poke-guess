import React, { useState, useEffect } from 'react';
import { getRandomPokemon } from '../services/pokeapi';
import { calculatePoints, getTimePenalty, getRank } from '../utils/scoring';
import { formatShareText } from '../utils/shareFormatter';
import { useGame } from '../context/GameContext';
import Navbar from '../components/Navbar';
import { getDailySeed, createPRNG } from '../services/seedEngine';
import { useRef } from 'react';
import HistorySidebar from '../components/HistorySidebar';
import GameOverModal from '../components/GameOverModal';
import GuessInput from '../components/GuessInput';
import PokemonStage from '../components/PokemonStage';
import FeedbackPopup from '../components/FeedbackPopup';

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
  const hasLoadedRef = useRef(false);
  
  useEffect(() => {
    if (hasLoadedRef.current) return;

  const startLoading = async () => {
    try {
      hasLoadedRef.current = true; // Mark as initialized
      const initialBatch = [];
      for(let i = 0; i < QUEUE_SIZE; i++) {
        const p = await getRandomPokemon(prngRef.current());
        initialBatch.push(p);
      }
      
      const firstPoke = initialBatch[0];
      setPokemonQueue(initialBatch.slice(1));
      setCurrentPokemon(firstPoke);
      
      // Delay the cry slightly to ensure the browser allows audio playback
      setTimeout(() => playCry(firstPoke.cry), 100);
      
      startTimeRef.current = Date.now();
      setLoading(false);
    } catch (error) {
      console.error("Initial load failed:", error);
    }
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
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
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

      // History bar shows LAST 7 mons 
      setHistory(prev => [historyItem, ...prev].slice(0, 7));
      // Full Collection (Everything for game over screen)
      setAllSolved(prev => [...prev, historyItem]);

      setStreak(newStreak);

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
      
      // Optional: If we  want incorrect guesses to show in history, do it here. 
      setStreak(0);
    }

    // IMPORTANT: Remove the old "const result = ..." and "setHistory" that used to be here!
  };


  const handleTimeUp = () => {
    setGameOver(true);
    endGame(score, solvedCount);
  };

  const handlePlayAgain = async () => {
    setLoading(true); // 1. Start the loading screen
    
    // 2. Reset seed engine
    prngRef.current = createPRNG(getDailySeed());
    
    // 3. Clear all game states
    setScore(0);
    setSolvedCount(0);
    setTimeLeft(180);
    setGameOver(false);
    setCopied(false);
    setHistory([]);
    setAllSolved([]);
    setStats({ perfect: 0, great: 0, good: 0, okay: 0 });
    setGuess('');
    setMissCount(0);
    setRevealedLetters([]);

    try {
      // 4. Re-initialize the queue properly
      const initialBatch = [];
      for(let i = 0; i < QUEUE_SIZE; i++) {
        const p = await getRandomPokemon(prngRef.current());
        initialBatch.push(p);
      }

      const firstPoke = initialBatch[0];
      setCurrentPokemon(firstPoke);
      setPokemonQueue(initialBatch.slice(1));

      playCry(firstPoke.cry);
      startTimeRef.current = Date.now();
      
      // 5. CRITICAL: Turn loading OFF so the game actually shows up!
      setLoading(false); 
    } catch (error) {
      console.error("Failed to restart game:", error);
      // Even if it fails, turn off loading so the user isn't stuck
      setLoading(false); 
    }
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

const playCry = (url) => {
    if (!url) return;
      const audio = new Audio(url);
      audio.volume = 0.03; 
      audio.play().catch(e => console.log("Audio play prevented:", e));
  };

  // In Game.jsx, update this state definition:
const [feedback, setFeedback] = useState({ 
    text: '', 
    points: 0, 
    visible: false,
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

  // Auto-submit effect: watches the 'guess' variable
  useEffect(() => {
    if (!currentPokemon || gameOver) return;

    const currentGuess = guess.toLowerCase().trim();
    const correctName = currentPokemon.name.toLowerCase();

    // If the guess matches the name perfectly, trigger the handleGuess logic
    if (currentGuess === correctName && currentGuess.length > 0) {
      // We pass 'null' because there's no "event" (e) like a button click
      handleGuess({ preventDefault: () => {} });
    }
  }, [guess, currentPokemon, gameOver]);

const nextPokemon = () => {
    if (pokemonQueue.length === 0) return; 

    const next = pokemonQueue[0];
    // Reset state BEFORE setting the new pokemon to prevent "flicker"
    setGuess('');
    setMissCount(0);
    setRevealedLetters([]);
    
    setCurrentPokemon(next);
    playCry(next.cry, true);
    setPokemonQueue(prev => prev.slice(1));
    refillQueue();

    startTimeRef.current = Date.now();
  };

if (loading) return <div className="text-white text-center mt-20">Loading Pokémon...</div>;

  // We wrap EVERYTHING in one Fragment so the Navbar is always at the top
return (
  <div className="min-h-screen bg-[#05070a] flex flex-col relative overflow-x-hidden">
    {/* 1. NAVBAR - Keep this outside the main tags so it's always there */}
    <Navbar /> 

    <main className="flex-grow flex flex-col items-start justify-start md:items-center md:justify-center py-0 md:py-8 px-4 font-sans text-white relative">      
      {/* 2. DESKTOP FEEDBACK - Hidden on mobile, shows at top on desktop */}
      <div className="origin-top-left scale-90 md:scale-100 w-full flex flex-col items-start md:items-center">        <FeedbackPopup feedback={feedback} />
      </div>

      {/* 3. CONDITIONAL LOGIC - This is where the swap happens */}
      {gameOver ? (
        /* GAME OVER SCREEN */
        <GameOverModal 
          score={score}
          solvedCount={solvedCount}
          allSolved={allSolved}
          stats={stats}
          handlePlayAgain={handlePlayAgain}
          handleShare={handleShare}
          copied={copied}
        />
      ) : (
        /* ACTIVE GAME SCREEN */
        <>
      {/* COMPACT HEADER (Mobile: Bar / Desktop: Centered) */}
      <div className="w-full max-w-sm mb-2 md:mb-4">
        
        {/* 1. MOBILE HEADER BAR (Shows on mobile, disappears on md/desktop) */}
        <div className="flex md:hidden items-center justify-between bg-slate-900/40 border border-slate-800/60 rounded-2xl px-5 py-2.5 backdrop-blur-sm shadow-xl">
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Time Left</span>
            <span className={`font-mono text-lg font-bold leading-none ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          
          {/* Decorative vertical divider */}
          <div className="h-8 w-[1px] bg-slate-800/80 mx-2" />

          <div className="flex flex-col text-right">
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Total Score</span>
            <span className="text-cyan-400 font-mono text-lg font-bold leading-none">
              {score}
            </span>
          </div>
        </div>

        {/* 2. DESKTOP STATS (Your original style, hidden on mobile) */}
        <div className="hidden md:block text-center">
          <div className="text-white text-5xl font-mono font-bold tracking-tighter mb-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {formatTime(timeLeft)}
          </div>
          <div className="text-slate-500 uppercase tracking-[0.2em] text-xs font-black">
            Score: <span className="text-white">{score}</span>
          </div>
        </div>
      </div>

          {/* THE NEW RESPONSIVE STAGE */}
          <PokemonStage 
            pokemon={currentPokemon} 
            nextPokemon={nextPokemon}
            feedback={feedback}
            history={history}
            gameOver={gameOver} 
          >
            {/* The Input lives inside the Stage as 'children' */}
            <GuessInput 
              guess={guess}
              setGuess={setGuess}
              targetName={currentPokemon.name}
              handleGuess={handleGuess}
              getLetterStyle={getLetterStyle}
            />
          </PokemonStage>
        </>
      )}
    </main>

    {/* 4. SIDEBAR - Now only shows if game is NOT over */}
    {!gameOver && <HistorySidebar history={history} />}
  </div>
);
}

export default Game;