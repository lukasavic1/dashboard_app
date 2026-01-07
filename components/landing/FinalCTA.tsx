'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';

export function FinalCTA() {
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
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 min-h-screen flex items-center px-6 lg:px-8 py-20">
      <div className="mx-auto max-w-5xl w-full text-center">
        <h2 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Stop Trading Stocks & Commodities Blind
        </h2>
        <p className="mt-8 text-xl leading-relaxed text-blue-100 font-medium sm:text-2xl">
          See what commercial traders are doing in stocks, crude oil, gold, and 50+ markets. Get clear signals. Trade with data, not emotion.
        </p>
        <p className="mt-6 text-xl font-bold text-white sm:text-2xl">
          $99/month. Less than one bad trade.
        </p>
        <div className="mt-10 flex items-center justify-center">
          <button
            onClick={handleSubscribeClick}
            className="rounded-xl bg-white px-10 py-5 text-xl font-bold text-blue-600 shadow-2xl hover:bg-gray-50 transition-all hover:shadow-3xl"
          >
            {user ? 'Go to Dashboard' : 'Get COT Signals Now'}
          </button>
        </div>
        <p className="mt-8 text-base text-blue-100 sm:text-lg">
          <span className="font-bold text-white">30-day guarantee</span> • Cancel anytime
        </p>
      </div>
    </div>
  );
}
