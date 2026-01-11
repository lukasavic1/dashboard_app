'use client';

import { useState, useEffect } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

const STORAGE_KEY = 'scoreWeights';
const DEFAULT_COT_WEIGHT = 0.7;
const DEFAULT_SEASONALITY_WEIGHT = 0.3;

interface ScoreWeights {
  cotWeight: number;
  seasonalityWeight: number;
}

interface ScoreWeightSliderProps {
  onWeightsChange: (weights: ScoreWeights) => void;
}

export function ScoreWeightSlider({ onWeightsChange }: ScoreWeightSliderProps) {
  const [cotWeightPercent, setCotWeightPercent] = useState(70);
  const [showTooltip, setShowTooltip] = useState(false);

  // Load weights from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const weights = JSON.parse(stored) as ScoreWeights;
        const cotPercent = Math.round(weights.cotWeight * 100);
        setCotWeightPercent(cotPercent);
        onWeightsChange(weights);
      } catch (error) {
        console.error('Failed to parse stored weights:', error);
        // Use defaults
        const defaultWeights = {
          cotWeight: DEFAULT_COT_WEIGHT,
          seasonalityWeight: DEFAULT_SEASONALITY_WEIGHT,
        };
        onWeightsChange(defaultWeights);
      }
    } else {
      // Use defaults
      const defaultWeights = {
        cotWeight: DEFAULT_COT_WEIGHT,
        seasonalityWeight: DEFAULT_SEASONALITY_WEIGHT,
      };
      onWeightsChange(defaultWeights);
    }
  }, [onWeightsChange]);

  const handleSliderChange = (value: number) => {
    setCotWeightPercent(value);
    const cotWeight = value / 100;
    const seasonalityWeight = 1 - cotWeight;
    const weights: ScoreWeights = { cotWeight, seasonalityWeight };
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weights));
    
    // Notify parent
    onWeightsChange(weights);
  };

  const seasonalityWeightPercent = 100 - cotWeightPercent;

  return (
    <div className="relative flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 min-w-0">
        <span className="text-[10px] sm:text-xs font-semibold text-slate-700 whitespace-nowrap">
          Weights:
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="text-[10px] sm:text-xs text-slate-600 whitespace-nowrap">
            COT: <span className="font-semibold">{cotWeightPercent}%</span>
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={cotWeightPercent}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-16 sm:w-20 lg:w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600 transition-colors"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${cotWeightPercent}%, #e2e8f0 ${cotWeightPercent}%, #e2e8f0 100%)`
            }}
          />
          <span className="text-[10px] sm:text-xs text-slate-600 whitespace-nowrap">
            Season: <span className="font-semibold">{seasonalityWeightPercent}%</span>
          </span>
        </div>
      </div>
      
      {/* Info icon with tooltip */}
      <div 
        className="relative inline-block"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <InformationCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 hover:text-slate-600 cursor-help transition-colors flex-shrink-0" />
        
        {showTooltip && (
          <div className="absolute right-0 top-full mt-3 w-80 sm:w-[420px] z-[100] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-none">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-5 py-4">
              <div className="flex items-center gap-2 mb-1">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-base font-bold text-white">Score Weight Configuration</h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 bg-gradient-to-b from-white to-slate-50/50">
              {/* Explanation Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">How It Works</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed ml-6">
                  The final score combines <span className="font-semibold text-slate-900">COT (Commitment of Traders) data</span> and <span className="font-semibold text-slate-900">seasonality patterns</span>. Adjust the slider to change how much each factor influences the final score.
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-2"></div>

              {/* Customization Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Customize Your Trading Style</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed ml-6">
                  This lets you configure the app to help you exactly how you want. Prefer COT data? Increase its weight. Trust seasonality more? Boost that instead. Your preference is saved automatically.
                </p>
              </div>

              {/* Default Section */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Default Settings</span>
                </div>
                <p className="text-sm font-semibold text-slate-900 ml-3.5">
                  70% COT / 30% Seasonality
                </p>
                <p className="text-xs text-slate-500 ml-3.5">
                  This balanced approach gives more weight to current commercial positioning while still considering historical patterns.
                </p>
              </div>
            </div>

            {/* Tooltip arrow */}
            <div className="absolute bottom-full right-6">
              <div className="border-8 border-transparent border-b-white"></div>
              <div className="absolute top-0.5 left-0 border-8 border-transparent border-b-slate-200"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook to get weights (for use in other components)
export function useScoreWeights(): ScoreWeights {
  const [weights, setWeights] = useState<ScoreWeights>({
    cotWeight: DEFAULT_COT_WEIGHT,
    seasonalityWeight: DEFAULT_SEASONALITY_WEIGHT,
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ScoreWeights;
        setWeights(parsed);
      } catch (error) {
        console.error('Failed to parse stored weights:', error);
      }
    }

    // Listen for storage changes (from other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as ScoreWeights;
          setWeights(parsed);
        } catch (error) {
          console.error('Failed to parse stored weights:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return weights;
}
