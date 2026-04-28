import React, { createContext, useState, useContext } from 'react';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [isGameActive, setIsGameActive] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const startGame = () => setIsGameActive(true);
  const endGame = (score) => {
    setIsGameActive(false);
    setFinalScore(score);
  };

  return (
    <GameContext.Provider value={{ isGameActive, startGame, endGame, finalScore }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);