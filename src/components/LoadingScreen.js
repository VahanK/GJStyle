export default function LoadingScreen({ progress, loaded }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      {/* Logo */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">GJ Style</h1>
        <p className="mt-1 text-sm font-medium uppercase tracking-widest text-gray-400">
          Jewelry Catalog
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-64 sm:w-80">
        <div className="mb-3 flex items-center justify-between text-xs text-gray-400">
          <span>Loading catalog…</span>
          <span>{loaded.toLocaleString()} products</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gray-900 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 text-right text-xs font-medium text-gray-400">
          {progress}%
        </div>
      </div>
    </div>
  );
}
