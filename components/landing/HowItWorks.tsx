import {
  UserCircleIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const steps = [
  {
    name: 'Log in & Select Assets',
    description: 'Sign in to your account and choose from a wide range of assets to analyze.',
    icon: UserCircleIcon,
  },
  {
    name: 'Analyze Scores & Trends',
    description: 'View real-time COT scores, seasonal trends, and combined bias indicators for each asset.',
    icon: MagnifyingGlassIcon,
  },
  {
    name: 'Make Informed Decisions',
    description: 'Use the insights and alerts to make data-driven trading decisions with confidence.',
    icon: CheckCircleIcon,
  },
];

export function HowItWorks() {
  return (
    <div id="about" className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">How It Works</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Get started in three simple steps
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our streamlined process makes it easy to access professional market analysis.
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
