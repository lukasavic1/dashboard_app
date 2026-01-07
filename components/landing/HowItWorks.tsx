import {
  UserCircleIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const steps = [
  {
    name: 'Pick Your Market',
    description: 'Choose any asset. We pull the latest COT data and seasonal patterns automatically.',
    icon: UserCircleIcon,
  },
  {
    name: 'See the Signal',
    description: 'Get one clear number: bullish or bearish. Plus seasonal context. That\'s it. No charts to decode.',
    icon: MagnifyingGlassIcon,
  },
  {
    name: 'Trade with Confidence',
    description: 'When the signal is strong and seasonality aligns, you know. Enter. Exit. Repeat.',
    icon: CheckCircleIcon,
  },
];

export function HowItWorks() {
  return (
    <div id="about" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">How It Works</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Three Steps. Zero Complexity.
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            No learning curve. No setup. Just clear signals you can use immediately.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
            {steps.map((step, index) => (
              <div key={step.name} className="relative flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
                  <step.icon className="h-8 w-8 text-white" aria-hidden="true" />
                </div>
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <dt className="text-base font-semibold leading-7 text-gray-900">{step.name}</dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">{step.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
