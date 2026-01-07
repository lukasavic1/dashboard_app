import {
  UserCircleIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const steps = [
  {
    name: 'Pick Your Market',
    description: 'Select stocks, crude oil, gold, wheat, or any of 50+ markets. COT data updates automatically every Friday.',
    icon: UserCircleIcon,
  },
  {
    name: 'See the Signal',
    description: 'Get one number: bullish or bearish. Plus seasonal context. No charts. No indicators. Just the signal.',
    icon: MagnifyingGlassIcon,
  },
  {
    name: 'Trade',
    description: 'Signal says "bullish" on crude? Go long. Signal says "bearish" on gold? Go short. That\'s it.',
    icon: CheckCircleIcon,
  },
];

export function HowItWorks() {
  return (
    <div id="about" className="bg-white min-h-screen flex flex-col justify-center px-6 lg:px-8 py-20">
      <div className="mx-auto max-w-6xl w-full">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            How It Works
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-gray-800 font-medium">
            Three steps. No learning curve. Start trading with COT signals today.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.name} className="relative flex flex-col items-center text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600">
                <step.icon className="h-10 w-10 text-white" aria-hidden="true" />
              </div>
              <div className="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-xl font-bold text-white">
                {index + 1}
              </div>
              <dt className="text-2xl font-bold leading-tight text-gray-900 mb-3">{step.name}</dt>
              <dd className="text-lg leading-relaxed text-gray-700">{step.description}</dd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
