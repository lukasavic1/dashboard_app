import {
  ChartBarIcon,
  LightBulbIcon,
  AdjustmentsHorizontalIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';

const benefits = [
  {
    name: 'COT Signals for Every Market',
    description:
      'Get bullish/bearish signals for stocks, crude oil, gold, wheat, corn, natural gas, and 50+ markets. Updated every Friday when new COT data releases.',
    icon: ChartBarIcon,
  },
  {
    name: 'See Commercial Positioning Before Price Moves',
    description:
      'Commercial traders position before retail. When they go long crude oil, price usually follows. You see their moves first.',
    icon: LightBulbIcon,
  },
  {
    name: 'Adjust Signals to Your Risk Level',
    description:
      'Conservative trader? Tighten the parameters. Aggressive? Loosen them. You control how bullish/bearish the signal needs to be.',
    icon: AdjustmentsHorizontalIcon,
  },
  {
    name: 'Seasonal Patterns + COT Data',
    description:
      'Know when historical seasonality aligns with current commercial positioning. Get alerts when both say "buy" or "sell".',
    icon: BellAlertIcon,
  },
];

export function Features() {
  return (
    <div id="features" className="bg-gray-50 min-h-screen flex flex-col justify-center px-6 lg:px-8 py-20">
      <div className="mx-auto max-w-6xl w-full">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            What You Get Every Week
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-gray-800 font-medium">
            COT data for stocks and commodities, turned into clear signals. No interpretation needed.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
          {benefits.map((benefit) => (
            <div key={benefit.name} className="relative pl-16">
              <dt className="text-2xl font-bold leading-tight text-gray-900 mb-3">
                <div className="absolute left-0 top-0 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600">
                  <benefit.icon className="h-7 w-7 text-white" aria-hidden="true" />
                </div>
                {benefit.name}
              </dt>
              <dd className="text-lg leading-relaxed text-gray-700">{benefit.description}</dd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
