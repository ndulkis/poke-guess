function SkipButton({ onSkip, disabled = false }) {
  return (
    <button
      onClick={onSkip}
      disabled={disabled}
      className="px-4 py-2 text-sm font-semibold text-gray-400 border border-gray-600 rounded-lg hover:border-gray-400 hover:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      Skip →
    </button>
  )
}

export default SkipButton