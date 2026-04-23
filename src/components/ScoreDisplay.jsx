function ScoreDisplay({ score = 0 }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Score</span>
      <span className="text-3xl font-bold text-black">{score}</span>
    </div>
  )
}

export default ScoreDisplay