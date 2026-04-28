import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getPokemonDetail } from '../services/pokeapi'
import { TYPE_COLORS } from '../utils/typeColors'
import {STAT_CONFIG} from '../utils/statConfig'

function PokemonDetail() {
  const { id } = useParams()
  const [pokemon, setPokemon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    setPokemon(null)
    getPokemonDetail(id).then(data => {
      if (!data) {
        setError(true)
      } else {
        setPokemon(data)
      }
      setLoading(false)
    })
  }, [id])

  const primaryType = pokemon?.types?.[0]
  const typeColor = TYPE_COLORS[primaryType] || TYPE_COLORS.normal

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Back link */}
        <Link
          to="/pokedex"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Pokédex
        </Link>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 border-2 border-gray-700 border-t-red-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
            <p className="text-4xl font-black text-gray-700">#{String(id).padStart(4, '0')}</p>
            <p className="text-lg font-bold text-gray-300">Pokémon not found</p>
            <p className="text-sm text-gray-500">This ID doesn't exist in the National Dex.</p>
            <Link to="/pokedex" className="mt-2 text-sm text-red-500 hover:text-red-400 underline underline-offset-4 transition-colors">
              Return to Pokédex
            </Link>
          </div>
        )}

        {/* Content */}
        {pokemon && (
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: `radial-gradient(ellipse 60% 50% at 20% 40%, ${typeColor.ring}18 0%, transparent 70%)`,
            }}
          >
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">

              {/* Left — artwork */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full blur-3xl opacity-30"
                    style={{ background: typeColor.ring }}
                  />
                  <img
                    src={pokemon.image}
                    alt={pokemon.name}
                    className="relative w-56 h-56 sm:w-72 sm:h-72 object-contain drop-shadow-2xl"
                  />
                </div>

                {/* Height & Weight */}
                <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Height</p>
                    <p className="text-xl font-black text-white">{pokemon.height}<span className="text-sm font-normal text-gray-400"> m</span></p>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Weight</p>
                    <p className="text-xl font-black text-white">{pokemon.weight}<span className="text-sm font-normal text-gray-400"> kg</span></p>
                  </div>
                </div>
              </div>

              {/* Right — info */}
              <div className="flex flex-col gap-6">

                {/* Name & number */}
                <div>
                  <p className="text-xs font-mono text-gray-500 tracking-widest mb-1">
                    #{String(pokemon.id).padStart(4, '0')}
                  </p>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight capitalize">
                    {pokemon.name}
                  </h1>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {pokemon.types.map(type => {
                      const c = TYPE_COLORS[type] || TYPE_COLORS.normal
                      return (
                        <span
                          key={type}
                          className={`text-sm px-4 py-1 rounded-full capitalize font-semibold ${c.bg} ${c.text}`}
                        >
                          {type}
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* Flavor text */}
                {pokemon.flavorText && (
                  <p className="text-gray-400 text-sm leading-relaxed italic border-l-2 border-gray-700 pl-4">
                    {pokemon.flavorText}
                  </p>
                )}

                {/* Abilities */}
                <div>
                  <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-500 mb-3">Abilities</h2>
                  <div className="flex flex-wrap gap-2">
                    {pokemon.abilities.map(({ name, isHidden }) => (
                      <span
                        key={name}
                        className={`text-sm px-3 py-1.5 rounded-xl capitalize font-medium border ${
                          isHidden
                            ? 'bg-gray-800/50 border-gray-700 text-gray-400'
                            : 'bg-gray-800 border-gray-700 text-gray-200'
                        }`}
                      >
                        {name}
                        {isHidden && <span className="ml-1.5 text-[10px] text-gray-500 uppercase tracking-wide">hidden</span>}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Base stats */}
                <div>
                  <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-500 mb-4">Base Stats</h2>
                  <div className="flex flex-col gap-3">
                    {pokemon.stats.map(({ name, value }) => {
                      const config = STAT_CONFIG[name] || { label: name, color: 'bg-gray-500' }
                      const pct = Math.round((value / 255) * 100)
                      return (
                        <div key={name} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-14 shrink-0 text-right">{config.label}</span>
                          <span className="text-sm font-mono font-bold w-8 shrink-0 text-right tabular-nums">{value}</span>
                          <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${config.color} transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                    {/* Total */}
                    <div className="flex items-center gap-3 pt-1 border-t border-gray-800">
                      <span className="text-xs text-gray-500 w-14 shrink-0 text-right">Total</span>
                      <span className="text-sm font-mono font-black w-8 shrink-0 text-right tabular-nums text-white">
                        {pokemon.stats.reduce((sum, s) => sum + s.value, 0)}
                      </span>
                      <div className="flex-1" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PokemonDetail
