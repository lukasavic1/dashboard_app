'use client';

import { CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';

const includedFeatures = [
  'All COT positioning data updated weekly',
  'Clear bullish/bearish signals for every asset',
  'Seasonal trend analysis and historical patterns',
  'Customizable signal calculation to match your style',
  'Email alerts when signals change',
  'Cancel anytime—no lock-in contracts',
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
    <div id="pricing" className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Pricing</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            One Price. Everything Included.
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            No tiers. No upsells. Just the data you need to trade better.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl rounded-3xl border-2 border-blue-200 bg-white p-8 shadow-2xl sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
          <div className="flex-1">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">Full Access</h3>
            <p className="mt-4 text-sm leading-6 text-gray-600">
              The same institutional-grade data, delivered as clear signals you can use today.
            </p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-5xl font-bold tracking-tight text-gray-900">$99</span>
              <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
            </p>
            <button
              onClick={handleSubscribe}
              className="mt-6 block w-full rounded-lg bg-blue-600 px-3 py-3 text-center text-base font-bold text-white shadow-lg hover:bg-blue-700 transition-all hover:shadow-xl"
            >
              {user ? 'Go to Dashboard' : 'Start Now — Risk Free'}
            </button>
            <div className="mt-6 space-y-2 text-center">
              <p className="text-sm font-semibold text-green-600">
                ✓ 30-day money-back guarantee
              </p>
              <p className="text-xs text-gray-500">
                If this doesn't improve your trading, get every dollar back. No questions.
              </p>
            </div>
          </div>
          <div className="mt-10 flex-1 border-t border-gray-200 pt-10 lg:mt-0 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
            <h4 className="text-sm font-semibold leading-6 text-gray-900">Everything you get</h4>
            <ul role="list" className="mt-6 space-y-3 text-sm leading-6 text-gray-600">
              {includedFeatures.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <CheckIcon className="h-6 w-6 flex-none text-green-600" aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-lg bg-blue-50 p-4 border border-blue-100">
              <p className="text-xs font-semibold text-blue-900">Why $99?</p>
              <p className="mt-1 text-xs text-blue-700">
                One good trade based on the right signal pays for months. This is an investment in your edge, not an expense.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
