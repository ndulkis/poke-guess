import { useState, useEffect } from 'react'

function SearchBar({ onSearch, placeholder = 'Search Pokémon...' }) {
  const [value, setValue] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => onSearch?.(value), 300)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2 bg-gray-800 text-white placeholder-gray-500 border border-gray-600 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
    />
  )
}

export default SearchBar