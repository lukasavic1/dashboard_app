'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function Hero() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSubscribeClick = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/signup');
    }
  };

  const scrollToPricing = () => {
    const element = document.getElementById('pricing');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      <div className="mx-auto max-w-3xl py-24 sm:py-32 lg:py-40">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            Know When Smart Money Enters Before You Miss the Move
          </h1>
          <p className="mt-6 text-xl leading-8 text-gray-700 sm:text-2xl">
            See exactly what commercial traders are doing—the same data institutions use—delivered as clear bullish/bearish signals. No noise. No guesswork.
          </p>
          <div className="mt-10 flex items-center justify-center">
            <button
              onClick={handleSubscribeClick}
              className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-blue-700 transition-all hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {user ? 'Go to Dashboard' : 'Start Trading Smarter Today'}
            </button>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            <span className="font-semibold text-green-600">30-day money-back guarantee</span> • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
