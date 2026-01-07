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
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Stop Trading in the Dark
          </h2>
          <p className="mt-6 text-xl leading-8 text-blue-100">
            See what commercial traders are doing. Get clear signals. Trade with confidence.
          </p>
          <p className="mt-4 text-lg font-semibold text-white">
            All for less than the cost of one bad trade.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              onClick={handleSubscribeClick}
              className="rounded-lg bg-white px-8 py-4 text-lg font-bold text-blue-600 shadow-lg hover:bg-gray-50 transition-all hover:shadow-xl"
            >
              {user ? 'Go to Dashboard' : 'Get Started Now'}
            </button>
          </div>
          <p className="mt-6 text-sm text-blue-100">
            <span className="font-semibold text-white">30-day guarantee</span> • Cancel anytime • No credit card required to start
          </p>
        </div>
      </div>
    </div>
  );
}
