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
    <div className="flex items-center gap-2 sm:gap-2 min-w-0 flex-1">
          <span className="text-xs sm:text-xs text-slate-600 whitespace-nowrap">
            COT: <span className="font-semibold">{cotWeightPercent}%</span>
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={cotWeightPercent}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="flex-1 min-w-[120px] sm:w-20 lg:w-24 h-2 sm:h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600 transition-colors touch-manipulation"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${cotWeightPercent}%, #e2e8f0 ${cotWeightPercent}%, #e2e8f0 100%)`
            }}
          />
          <span className="text-xs sm:text-xs text-slate-600 whitespace-nowrap">
            Season: <span className="font-semibold">{seasonalityWeightPercent}%</span>
          </span>
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
