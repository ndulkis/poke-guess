import { Link } from 'react-router-dom'
import { TYPE_COLORS } from '../utils/typeColors'

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

export default PokemonCard
