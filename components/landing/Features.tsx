import {
  ChartBarIcon,
  LightBulbIcon,
  AdjustmentsHorizontalIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Market Analysis from COT Reports',
    description:
      'Access comprehensive market analysis derived from official Commitment of Traders reports. Get insights into commercial and non-commercial trader positions.',
    icon: ChartBarIcon,
  },
  {
    name: 'Scores & Insights',
    description:
      'Receive clear bullish/bearish scores and bias indicators to help you understand market sentiment at a glance.',
    icon: LightBulbIcon,
  },
  {
    name: 'Customizable Calculation Sliders',
    description:
      'Fine-tune your analysis with adjustable parameters that let you customize how scores are calculated to match your trading strategy.',
    icon: AdjustmentsHorizontalIcon,
  },
  {
    name: 'Seasonal Trends & Alerts',
    description:
      'Stay ahead with seasonal trend analysis and automated alerts that notify you of significant market movements and opportunities.',
    icon: BellAlertIcon,
  },
];

export function Features() {
  return (
    <div id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Features</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to analyze markets
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Powerful tools and insights to help you make better trading decisions based on fundamental market data.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
