function Timer({ timeLeft = 180 }) {
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const colorClass =
    timeLeft < 15
      ? 'text-red-500 animate-pulse'
      : timeLeft < 60
      ? 'text-yellow-400'
      : 'text-black'

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Time</span>
      <span className={`text-3xl font-bold font-mono transition-colors ${colorClass}`}>
        {display}
      </span>
    </div>
  )
}

export default Timer