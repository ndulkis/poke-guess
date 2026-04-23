import { NavLink } from 'react-router-dom'

function Navbar() {
  const linkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors ${isActive ? 'text-red-500' : 'text-gray-300 hover:text-white'}`

  return (
    <nav className="w-full bg-gray-900 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
      <NavLink to="/" className="text-white text-xl font-bold tracking-wide">
        Poké<span className="text-red-500">Guess</span>
      </NavLink>
      <div className="flex gap-6">
        <NavLink to="/game" className={linkClass}>Play</NavLink>
        <NavLink to="/pokedex" className={linkClass}>Pokédex</NavLink>
      </div>
    </nav>
  )
}

export default Navbar