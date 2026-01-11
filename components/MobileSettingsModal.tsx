'use client';

import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ScoreWeightSlider } from './ScoreWeightSlider';
import { useState, useEffect } from 'react';

type BiasFilter = 'All' | 'Strongly Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strongly Bearish' | 'No Data';
type SortOption = 'bias' | 'score' | 'name';

interface MobileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scoreWeights: { cotWeight: number; seasonalityWeight: number };
  onScoreWeightsChange: (weights: { cotWeight: number; seasonalityWeight: number }) => void;
  biasFilter: BiasFilter;
  onBiasFilterChange: (filter: BiasFilter) => void;
  sortOption: SortOption;
  onSortOptionChange: (sort: SortOption) => void;
  filteredCount: number;
  totalCount: number;
}

export function MobileSettingsModal({
  isOpen,
  onClose,
  scoreWeights,
  onScoreWeightsChange,
  biasFilter,
  onBiasFilterChange,
  sortOption,
  onSortOptionChange,
  filteredCount,
  totalCount,
}: MobileSettingsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto transition-opacity duration-300 z-[9999]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full my-auto flex flex-col max-h-[90vh] relative border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200/60 bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-all p-2 rounded-xl hover:bg-slate-100 active:scale-95"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-slate-50/30 space-y-6">
          {/* Score Weights */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Score Weights
            </h3>
            <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4">
              <ScoreWeightSlider onWeightsChange={onScoreWeightsChange} />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

          {/* Filter by Bias */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide block">
              Filter by Bias
            </label>
            <select
              value={biasFilter}
              onChange={(e) => onBiasFilterChange(e.target.value as BiasFilter)}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-white border-2 border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All</option>
              <option value="Strongly Bullish">Strongly Bullish</option>
              <option value="Bullish">Bullish</option>
              <option value="Neutral">Neutral</option>
              <option value="Bearish">Bearish</option>
              <option value="Strongly Bearish">Strongly Bearish</option>
              <option value="No Data">No Data</option>
            </select>
          </div>

          {/* Sort Options */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide block">
              Sort By
            </label>
            <select
              value={sortOption}
              onChange={(e) => onSortOptionChange(e.target.value as SortOption)}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-white border-2 border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="bias">Bias (Bullish → Bearish)</option>
              <option value="score">Score (High → Low)</option>
              <option value="name">Name (A → Z)</option>
            </select>
          </div>

          {/* Results count */}
          <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">Showing {filteredCount}</span> of {totalCount} assets
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200/60 bg-gradient-to-br from-slate-50/50 to-white">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl hover:from-slate-800 hover:to-slate-700 transition-all text-sm font-semibold shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return mounted && typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
}
