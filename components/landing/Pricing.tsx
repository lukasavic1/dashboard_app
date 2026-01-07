'use client';

import { CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';

const includedFeatures = [
  'Access to all COT report data',
  'Real-time scores & insights',
  'Seasonal trend analysis',
  'Customizable calculation parameters',
  'Email alerts & notifications',
  'Priority customer support',
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
    <div id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Pricing</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            One plan with everything you need to analyze markets effectively.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl rounded-3xl border border-gray-200 bg-white p-8 shadow-xl sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
          <div className="flex-1">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">Professional</h3>
            <p className="mt-4 text-sm leading-6 text-gray-600">
              Full access to all features and data for serious traders and analysts.
            </p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-5xl font-bold tracking-tight text-gray-900">$99</span>
              <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
            </p>
            <button
              onClick={handleSubscribe}
              className="mt-6 block w-full rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              {user ? 'Go to Dashboard' : 'Subscribe Now'}
            </button>
            <p className="mt-4 text-center text-xs leading-5 text-gray-600">
              <span className="font-semibold text-green-600">30-day money-back guarantee</span>
              {' '}— Try risk-free
            </p>
          </div>
          <div className="mt-10 flex-1 border-t border-gray-200 pt-10 lg:mt-0 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
            <h4 className="text-sm font-semibold leading-6 text-gray-900">What's included</h4>
            <ul role="list" className="mt-6 space-y-3 text-sm leading-6 text-gray-600">
              {includedFeatures.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <CheckIcon className="h-6 w-6 flex-none text-blue-600" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
