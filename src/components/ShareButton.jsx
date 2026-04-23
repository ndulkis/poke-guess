import { useState } from 'react'

function ShareButton({ shareText = '' }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    await navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleShare}
      className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors"
    >
      {copied ? 'Copied!' : 'Share Results'}
    </button>
  )
}

export default ShareButton