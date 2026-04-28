import { Link } from 'react-router-dom'
import { RANKS as ranks } from '../utils/scoring'

const steps = [
  { n: '01', heading: 'Spot the Silhouette', body: "A Pokémon's silhouette appears. Study its shape — every pixel is a clue." },
  { n: '02', heading: 'Wordle-Style Guessing', body: 'Correct letters lock into place. Build the name letter by letter across attempts.' },
  { n: '03', heading: 'Beat the Clock', body: 'You have 3 minutes. Wrong guesses cost time. Rack up as many correct answers as you can.' },
]

const stats = [
  { value: '3:00', label: 'Per Session' },
  { value: 'Daily', label: 'Same Seed Worldwide' },
  { value: '6', label: 'Rank Tiers' },
]

function home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ── Hero ── */}
      <section
        className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(220,38,38,0.12) 0%, transparent 70%), #030712',
        }}
      >
        {/* decorative pokéball ring */}
        <div
          className="absolute rounded-full border border-red-900/30 pointer-events-none"
          style={{ width: 700, height: 700, top: '50%', left: '50%', transform: 'translate(-50%, -54%)' }}
        />
        <div
          className="absolute rounded-full border border-red-900/20 pointer-events-none"
          style={{ width: 520, height: 520, top: '50%', left: '50%', transform: 'translate(-50%, -54%)' }}
        />

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-3xl">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-red-500 mb-2">
            Daily Challenge
          </span>

          <h1 className="text-[clamp(3.5rem,10vw,7rem)] font-black leading-none tracking-tighter">
            Poké<span className="text-red-500">Guess</span>
          </h1>

          <p className="text-lg text-gray-400 tracking-wide max-w-md">
            A Daily Pokémon Speed Run — identify as many Pokémon as you can in{' '}
            <span className="text-white font-semibold">3 minutes</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link
              to="/game"
              className="px-10 py-4 bg-red-600 hover:bg-red-500 text-white font-bold text-lg rounded-xl tracking-wide transition-all hover:scale-105 hover:shadow-[0_0_32px_rgba(220,38,38,0.5)] active:scale-100"
            >
              Play Today's Game
            </Link>
            <Link
              to="/pokedex"
              className="px-10 py-4 bg-transparent hover:bg-white/5 text-gray-300 hover:text-white font-semibold text-lg rounded-xl border border-gray-700 hover:border-gray-500 tracking-wide transition-all"
            >
              Browse Pokédex
            </Link>
          </div>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-10 flex flex-col items-center gap-2 text-gray-600 text-xs tracking-widest uppercase">
          <span>Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-600 to-transparent" />
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="border-y border-gray-800 bg-gray-900/60">
        <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x divide-gray-800">
          {stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center py-8 px-4 gap-1">
              <span className="text-3xl font-black text-white font-mono">{value}</span>
              <span className="text-xs text-gray-500 uppercase tracking-widest">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── How to Play ── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-red-500 mb-4">How It Works</h2>
        <p className="text-3xl font-black tracking-tight mb-16 max-w-xl">
          Three steps. Three minutes.<br />One daily champion.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map(({ n, heading, body }) => (
            <div key={n} className="relative bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors">
              <span className="block text-6xl font-black text-gray-800 leading-none mb-6 select-none">{n}</span>
              <h3 className="text-lg font-bold text-white mb-2">{heading}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ranks ── */}
      <section className="bg-gray-900/40 border-t border-gray-800 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-red-500 mb-4">Ranking System</h2>
          <p className="text-3xl font-black tracking-tight mb-16">Where will you land?</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ranks.map(({ title, threshold, color, text, bg, desc }) => (
              <div key={title} className={`${bg} border-l-4 ${color} rounded-xl p-6 flex flex-col gap-2`}>
                <div className="flex items-baseline justify-between">
                  <span className={`font-black text-lg ${text}`}>{title}</span>
                  <span className="text-xs font-mono text-gray-500">{threshold} pts</span>
                </div>
                <p className="text-gray-400 text-sm leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="py-24 px-6 text-center border-t border-gray-800">
        <p className="text-gray-500 text-sm uppercase tracking-widest mb-4">Not ready to play?</p>
        <p className="text-2xl font-black mb-8">
          Study the Pokédex first.
        </p>
        <Link
          to="/pokedex"
          className="inline-block px-8 py-3 border border-gray-700 hover:border-red-600 text-gray-300 hover:text-red-400 font-semibold rounded-xl transition-all tracking-wide"
        >
          Open Pokédex →
        </Link>
      </section>
    </div>
  )
}

export default home
