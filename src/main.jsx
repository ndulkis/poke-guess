import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './pages/home.jsx'
import Game from './pages/game.jsx'
import Pokedex from './pages/pokedex.jsx'
import PokemonDetail from './pages/pokemonDetail.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/pokedex" element={<Pokedex />} />
        <Route path="/pokemon/:id" element={<PokemonDetail />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
