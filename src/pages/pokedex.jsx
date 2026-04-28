import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { TYPE_COLORS } from '../utils/typeColors'

const ALL_TYPES = Object.keys(TYPE_COLORS)
const PAGE_SIZE = 48
const BASE_URL = 'https://pokeapi.co/api/v2'

function PokemonCard({ pokemon }) {
  const { id, name, types } = pokemon
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
  const primaryType = types[0]
  const colors = TYPE_COLORS[primaryType] || TYPE_COLORS.normal

  return (
    <Link
      to={`/pokemon/${id}`}
      className="group bg-gray-900 border border-gray-800 rounded-xl p-3 flex flex-col items-center gap-2 hover:border-gray-600 transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-lg"
      style={{ '--ring-color': colors.ring }}
    >
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
          style={{ background: `radial-gradient(circle, ${colors.ring}40 0%, transparent 70%)` }}
        />
        <img
          src={imageUrl}
          alt={name}
          className="w-16 h-16 object-contain relative z-10 drop-shadow-md group-hover:drop-shadow-lg transition-all duration-200"
          loading="lazy"
        />
      </div>

      <div className="text-center w-full">
        <p className="text-[10px] text-gray-600 font-mono tracking-wider">
          #{String(id).padStart(4, '0')}
        </p>
        <p className="text-xs font-semibold capitalize leading-tight text-gray-100 truncate w-full text-center">
          {name}
        </p>
      </div>

      <div className="flex gap-1 flex-wrap justify-center">
        {types.map(type => {
          const c = TYPE_COLORS[type] || TYPE_COLORS.normal
          return (
            <span
              key={type}
              className={`text-[9px] px-2 py-0.5 rounded-full capitalize font-semibold tracking-wide ${c.bg} ${c.text}`}
            >
              {type}
            </span>
          )
        })}
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex flex-col items-center gap-2 animate-pulse">
      <div className="w-16 h-16 bg-gray-800 rounded-full" />
      <div className="w-10 h-2 bg-gray-800 rounded" />
      <div className="w-16 h-3 bg-gray-800 rounded" />
      <div className="w-12 h-3 bg-gray-800 rounded" />
    </div>
  )
}

function Pokedex() {
  const [pokemonList, setPokemonList] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [page, setPage] = useState(1)
  const gridRef = useRef(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setLoadingProgress(10)

      const listRes = await fetch(`${BASE_URL}/pokemon?limit=1025&offset=0`)
      const listData = await listRes.json()
      setLoadingProgress(25)

      const baseList = listData.results.map(p => {
        const segments = p.url.split('/').filter(Boolean)
        const id = parseInt(segments[segments.length - 1])
        return { id, name: p.name, types: [] }
      })

      const typeListRes = await fetch(`${BASE_URL}/type?limit=20`)
      const typeListData = await typeListRes.json()
      setLoadingProgress(35)

      const realTypes = typeListData.results.filter(
        t => !['unknown', 'shadow'].includes(t.name)
      )

      let completed = 0
      const typeDetails = await Promise.all(
        realTypes.map(t =>
          fetch(t.url)
            .then(r => r.json())
            .then(data => {
              completed++
              setLoadingProgress(35 + Math.round((completed / realTypes.length) * 55))
              return data
            })
        )
      )

      const typeMap = {}
      for (const typeDetail of typeDetails) {
        for (const entry of typeDetail.pokemon) {
          const url = entry.pokemon.url
          const segs = url.split('/').filter(Boolean)
          const id = parseInt(segs[segs.length - 1])
          if (!typeMap[id]) typeMap[id] = []
          typeMap[id].push(typeDetail.name)
        }
      }

      const full = baseList.map(p => ({ ...p, types: typeMap[p.id] || [] }))
      setPokemonList(full)
      setLoadingProgress(100)
      setTimeout(() => setLoading(false), 150)
    }

    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return pokemonList.filter(p => {
      const matchesSearch = !q || p.name.includes(q)
      const matchesType = !selectedType || p.types.includes(selectedType)
      return matchesSearch && matchesType
    })
  }, [pokemonList, search, selectedType])

  useEffect(() => {
    setPage(1)
  }, [search, selectedType])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handlePageChange(next) {
    setPage(next)
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-red-500 mb-1">
              National Dex
            </p>
            <h1 className="text-4xl font-black tracking-tight">Pokédex</h1>
          </div>
          {!loading && (
            <p className="text-sm text-gray-500 tabular-nums">
              {filtered.length.toLocaleString()} / 1,025 Pokémon
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search Pokémon..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 transition-colors capitalize sm:w-44 appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '16px',
              paddingRight: '40px',
            }}
          >
            <option value="">All Types</option>
            {ALL_TYPES.map(t => (
              <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Type filter chips */}
        {selectedType && (
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setSelectedType('')}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold capitalize transition-all
                ${TYPE_COLORS[selectedType]?.bg} ${TYPE_COLORS[selectedType]?.text} border border-current/30`}
            >
              {selectedType}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="w-full max-w-xs bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-red-600 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 tracking-wide">
                Loading Pokédex… {loadingProgress < 100 ? `${loadingProgress}%` : ''}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Array.from({ length: 48 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <span className="text-5xl select-none">?</span>
            <p className="text-lg font-bold text-gray-300">No Pokémon found</p>
            <p className="text-sm text-gray-500">
              Try a different name or type filter.
            </p>
            <button
              onClick={() => { setSearch(''); setSelectedType('') }}
              className="mt-2 text-sm text-red-500 hover:text-red-400 underline underline-offset-4 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div
              ref={gridRef}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
            >
              {paginated.map(pokemon => (
                <PokemonCard key={pokemon.id} pokemon={pokemon} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={page === 1}
                  className="px-3 py-2 rounded-lg bg-gray-800 text-gray-400 disabled:opacity-30 hover:bg-gray-700 hover:text-white transition-all text-sm"
                  aria-label="First page"
                >
                  «
                </button>
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-30 hover:bg-gray-700 hover:text-white transition-all text-sm font-medium"
                >
                  ← Prev
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                          pageNum === page
                            ? 'bg-red-600 text-white shadow-[0_0_16px_rgba(220,38,38,0.4)]'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-30 hover:bg-gray-700 hover:text-white transition-all text-sm font-medium"
                >
                  Next →
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={page === totalPages}
                  className="px-3 py-2 rounded-lg bg-gray-800 text-gray-400 disabled:opacity-30 hover:bg-gray-700 hover:text-white transition-all text-sm"
                  aria-label="Last page"
                >
                  »
                </button>
              </div>
            )}

            {/* Page info */}
            {totalPages > 1 && (
              <p className="text-center text-xs text-gray-600 mt-3 tabular-nums">
                Page {page} of {totalPages} · showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Pokedex
