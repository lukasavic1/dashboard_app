'use client';

import { createPortal } from 'react-dom';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
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
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Prevent background scroll
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 transition-opacity duration-300 z-[9999] overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onTouchMove={(e) => {
        // Prevent background scroll on touch devices
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col relative border border-slate-100 overflow-hidden touch-none"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200/60 bg-gradient-to-br from-slate-50 via-white to-slate-50/50 flex-shrink-0">
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
        <div 
          className="flex-1 overflow-y-auto p-6 pb-8 bg-gradient-to-b from-white to-slate-50/30 space-y-6 min-h-0 overscroll-contain touch-auto"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Score Weights */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 relative">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Score Weights
              </h3>
              {/* Info icon with tooltip */}
              <div 
                className="relative inline-block flex-shrink-0"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <InformationCircleIcon className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-help transition-colors" />
                
                {showTooltip && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[min(calc(100vw-4rem),320px)] max-w-[calc(100vw-4rem)] z-[100] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-none">
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
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2">
                      <div className="border-8 border-transparent border-b-white"></div>
                      <div className="absolute top-0.5 left-0 border-8 border-transparent border-b-slate-200"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-4">
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
        <div className="p-6 border-t border-slate-200/60 bg-gradient-to-br from-slate-50/50 to-white flex-shrink-0">
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
