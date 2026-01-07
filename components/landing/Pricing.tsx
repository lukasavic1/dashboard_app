'use client';

import { CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';

const includedFeatures = [
  'COT data for stocks, crude oil, gold, and 50+ markets',
  'Bullish/bearish signals updated every Friday',
  'Seasonal patterns for every market',
  'Adjust signal sensitivity to your risk level',
  'Email alerts when signals change',
  'Cancel anytime—no contracts',
];

export function Pricing() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSubscribe = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/signup');
    }
  };
  return (
    <div id="pricing" className="bg-gray-50 min-h-screen flex flex-col justify-center px-6 lg:px-8 py-20">
      <div className="mx-auto max-w-6xl w-full">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            $99/Month. Everything Included.
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-gray-800 font-medium">
            No tiers. No upsells. Just COT signals for stocks and commodities.
          </p>
        </div>
        <div className="max-w-5xl mx-auto rounded-3xl border-4 border-blue-300 bg-white p-10 shadow-2xl lg:flex lg:gap-10">
          <div className="flex-1">
            <h3 className="text-3xl font-bold tracking-tight text-gray-900 mb-5">Full Access</h3>
            <p className="text-lg leading-relaxed text-gray-700 mb-6">
              COT data for every market. Clear signals. Seasonal patterns. All of it.
            </p>
            <p className="mb-6 flex items-baseline gap-x-2">
              <span className="text-6xl font-bold tracking-tight text-gray-900">$99</span>
              <span className="text-xl font-semibold leading-6 text-gray-600">/month</span>
            </p>
            <button
              onClick={handleSubscribe}
              className="w-full rounded-xl bg-blue-600 px-8 py-5 text-center text-xl font-bold text-white shadow-2xl hover:bg-blue-700 transition-all hover:shadow-3xl"
            >
              {user ? 'Go to Dashboard' : 'Start Now — Risk Free'}
            </button>
            <div className="mt-6 space-y-2 text-center">
              <p className="text-lg font-bold text-green-600">
                ✓ 30-day money-back guarantee
              </p>
              <p className="text-base text-gray-600">
                If COT signals don't improve your trading, get every dollar back.
              </p>
            </div>
          </div>
          <div className="mt-10 flex-1 border-t border-gray-200 pt-10 lg:mt-0 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
            <h4 className="text-xl font-bold leading-6 text-gray-900 mb-6">What you get</h4>
            <ul role="list" className="space-y-4 text-lg leading-relaxed text-gray-700">
              {includedFeatures.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <CheckIcon className="h-6 w-6 flex-none text-green-600 mt-1" aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-xl bg-blue-50 p-5 border-2 border-blue-200">
              <p className="text-lg font-bold text-blue-900 mb-2">Why $99?</p>
              <p className="text-base text-blue-800">
                One good trade in crude oil or gold based on the right COT signal pays for months. This is an edge, not an expense.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
