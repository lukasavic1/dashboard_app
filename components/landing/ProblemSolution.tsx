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
    <div id="problem-solution" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Problem */}
        <div className="mx-auto max-w-3xl mb-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Trading Blind Is Costing You Money
            </h2>
            <div className="mt-10 space-y-6 text-left">
              <div className="flex gap-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg font-semibold text-gray-900">Information overload paralyzes you</p>
                  <p className="mt-1 text-gray-600">Too many indicators, conflicting signals, and noise. You spend hours analyzing but still second-guess every entry.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg font-semibold text-gray-900">You enter too late or exit too early</p>
                  <p className="mt-1 text-gray-600">By the time you spot the trend, smart money already moved. You're chasing, not leading.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg font-semibold text-gray-900">Emotional decisions replace strategy</p>
                  <p className="mt-1 text-gray-600">Without clear signals, fear and greed take over. You hold losers too long and cut winners too soon.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Solution */}
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 sm:p-12 border border-blue-100">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                The Simplest Solution: Follow What Actually Works
              </h2>
              <p className="mt-6 text-xl leading-8 text-gray-700">
                Commercial traders—the ones who move markets—report their positions every week. We turn that data into clear signals you can act on.
              </p>
              <div className="mt-10 space-y-4 text-left">
                <div className="flex gap-4">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">One clear signal, not 20 indicators</p>
                    <p className="mt-1 text-gray-600">Bullish or bearish. Strong or weak. No interpretation needed.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">See moves before they happen</p>
                    <p className="mt-1 text-gray-600">Commercial positioning predicts price action. You get the signal before the crowd catches on.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">Trade with confidence, not emotion</p>
                    <p className="mt-1 text-gray-600">When the data says "bullish," you know. No second-guessing. No FOMO. Just clear direction.</p>
                  </div>
                </div>
              </div>
              <div className="mt-10">
                <button
                  onClick={handleSubscribeClick}
                  className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-blue-700 transition-all hover:shadow-xl"
                >
                  {user ? 'Go to Dashboard' : 'Get Clear Signals Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
