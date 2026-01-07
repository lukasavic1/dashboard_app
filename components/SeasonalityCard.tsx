type SeasonalityResult = {
  score: number
  bias: 'Bullish' | 'Neutral' | 'Bearish'
  notes: string[]
}

function biasColor(bias: SeasonalityResult['bias']) {
  switch (bias) {
    case 'Bullish':
      return 'text-green-700 bg-green-100'
    case 'Bearish':
      return 'text-red-700 bg-red-100'
    default:
      return 'text-yellow-700 bg-yellow-100'
  }
}

export function SeasonalityCard({ data }: { data: SeasonalityResult }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Seasonality</h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${biasColor(
            data.bias
          )}`}
        >
          {data.bias}
        </span>
      </div>

      <div className="text-4xl font-bold mb-2 text-gray-900">
        {data.score > 0 ? '+' : ''}
        {data.score}
      </div>

      <ul className="text-sm text-gray-600 space-y-1">
        {data.notes.map((note, i) => (
          <li key={i}>• {note}</li>
        ))}
      </ul>
    </div>
  )
}
