'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export function ProblemSolution() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSubscribeClick = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/signup');
    }
  };

  return (
    <div id="problem-solution" className="bg-white min-h-screen flex flex-col justify-center px-6 lg:px-8 py-20">
      <div className="mx-auto max-w-6xl w-full">
        {/* Problem */}
        <div className="mb-24">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              You're Trading Stocks & Commodities Blind
            </h2>
            <div className="mt-12 space-y-8 text-left max-w-4xl mx-auto">
              <div className="flex gap-6">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xl font-bold text-gray-900">Too many indicators, no clear direction</p>
                  <p className="mt-2 text-lg text-gray-700">You check RSI, MACD, moving averages, volume. They conflict. You still don't know if crude oil is going up or down.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xl font-bold text-gray-900">You enter after the move already started</p>
                  <p className="mt-2 text-lg text-gray-700">By the time you see gold breaking out, commercial traders already positioned. You're buying the top, selling the bottom.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xl font-bold text-gray-900">Emotion overrides your plan</p>
                  <p className="mt-2 text-lg text-gray-700">Without clear data, you hold losing positions in stocks too long. You exit winning commodity trades too early. Fear and greed win.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Solution */}
        <div>
          <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 p-10 sm:p-12 border-2 border-blue-200">
            <div className="text-center">
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Follow Commercial Traders. They Move Markets.
              </h2>
              <p className="mt-6 text-xl leading-relaxed text-gray-800 font-medium">
                Every Friday, commercial traders report their positions to the CFTC. We analyze that data and give you one number: bullish or bearish. For stocks, crude, gold, and 50+ markets.
              </p>
              <div className="mt-10 space-y-5 text-left max-w-3xl mx-auto">
                <div className="flex gap-5">
                  <CheckCircleIcon className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xl font-bold text-gray-900">One signal. Bullish or bearish.</p>
                    <p className="mt-2 text-lg text-gray-700">No charts to read. No indicators to compare. Just: "Crude oil is bullish. Gold is bearish."</p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <CheckCircleIcon className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xl font-bold text-gray-900">Commercial positioning predicts price</p>
                    <p className="mt-2 text-lg text-gray-700">When commercial traders go long, prices usually follow. You see their moves before retail traders do.</p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <CheckCircleIcon className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xl font-bold text-gray-900">Trade with data, not emotion</p>
                    <p className="mt-2 text-lg text-gray-700">The signal says "bearish" on wheat? You know. No second-guessing. No FOMO. Just follow the data.</p>
                  </div>
                </div>
              </div>
              <div className="mt-10">
                <button
                  onClick={handleSubscribeClick}
                  className="rounded-xl bg-blue-600 px-10 py-5 text-xl font-bold text-white shadow-2xl hover:bg-blue-700 transition-all hover:shadow-3xl"
                >
                  {user ? 'Go to Dashboard' : 'Get COT Signals Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
