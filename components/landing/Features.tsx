import {
  ChartBarIcon,
  LightBulbIcon,
  AdjustmentsHorizontalIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';

const benefits = [
  {
    name: 'Stop Guessing. Start Knowing.',
    description:
      'See exactly what commercial traders—the market movers—are doing. No interpretation. No confusion. Just clear bullish or bearish signals based on real positioning data.',
    icon: ChartBarIcon,
  },
  {
    name: 'Get In Before the Crowd',
    description:
      'Commercial positioning predicts price moves. You see the signal before retail catches on, giving you better entries and exits.',
    icon: LightBulbIcon,
  },
  {
    name: 'Match Your Strategy, Not Ours',
    description:
      'Adjust how signals are calculated to fit your risk tolerance and trading style. Conservative? Aggressive? You control it.',
    icon: AdjustmentsHorizontalIcon,
  },
  {
    name: 'Never Miss a Seasonal Move',
    description:
      'Know when historical patterns align with current positioning. Get alerts when everything lines up for a high-probability trade.',
    icon: BellAlertIcon,
  },
];

export function Features() {
  return (
    <div id="features" className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">What You Get</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Trade Like You Have Inside Information
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            The same data institutions use, delivered as actionable signals. No PhD required.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {benefits.map((benefit) => (
              <div key={benefit.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <benefit.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {benefit.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">{benefit.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
