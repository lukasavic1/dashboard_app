'use client';

interface AssetCardProps {
  assetId: string;
  assetName: string;
  seasonalityScore: number | null;
  finalScore?: number;
  finalBias?: string;
  cotScore?: number;
  cotBias?: string;
  isSelected: boolean;
  onClick: () => void;
}

function getFinalBiasColor(bias: string): string {
  switch (bias) {
    case 'Strongly Bullish':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'Bullish':
      return 'text-emerald-600 bg-emerald-50/50 border-emerald-200';
    case 'Neutral':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'Bearish':
      return 'text-rose-600 bg-rose-50/50 border-rose-200';
    case 'Strongly Bearish':
      return 'text-rose-700 bg-rose-50 border-rose-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
}

export function AssetCard({
  assetId,
  assetName,
  seasonalityScore,
  finalScore,
  finalBias,
  cotScore,
  cotBias,
  isSelected,
  onClick
}: AssetCardProps) {
  const hasData = finalBias !== undefined;

  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full rounded-lg border-2 p-2.5 text-left transition-all duration-200
        ${isSelected
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-50/50 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/20'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm hover:bg-slate-50/50'
        }
      `}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500 ring-2 ring-white shadow-sm" />
      )}

      <div className="flex items-center justify-between gap-2">
        {/* Left side: Asset name and ID */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className={`text-sm font-semibold truncate ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>
              {assetName}
            </h3>
            <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">{assetId}</span>
          </div>
        </div>

        {/* Right side: Final Bias and Score */}
        {hasData ? (
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold ${getFinalBiasColor(finalBias!)}`}>
              {finalBias}
            </span>
            <span className={`text-xs font-semibold ${finalScore! > 0 ? 'text-emerald-600' : finalScore! < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
              {finalScore! > 0 ? '+' : ''}{finalScore!.toFixed(1)}
            </span>
          </div>
        ) : (
          <span className="inline-flex items-center rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500 flex-shrink-0">
            No Data
          </span>
        )}
      </div>
    </button>
  );
}
