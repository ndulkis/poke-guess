import { useState, useEffect, useMemo, useRef } from 'react'
import Navbar from '../components/Navbar'
import SkeletonCard from '../components/SkeletonCard'
import PokemonCard from '../components/PokemonCard'
import FilterControls from '../components/FilterControls'

const PAGE_SIZE = 48
const BASE_URL = 'https://pokeapi.co/api/v2'

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

        <FilterControls
          search={search}
          onSearchChange={setSearch}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />

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
