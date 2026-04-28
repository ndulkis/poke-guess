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

export default SkeletonCard
