const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Professional Trader',
    content:
      'MarketLens has transformed how I analyze markets. The COT data insights are incredibly valuable and the seasonal trends help me time my entries perfectly.',
  },
  {
    name: 'Michael Rodriguez',
    role: 'Hedge Fund Analyst',
    content:
      'The combination of COT reports and seasonality analysis in one platform is exactly what I needed. The customizable sliders let me fine-tune everything to my strategy.',
  },
  {
    name: 'David Kim',
    role: 'Independent Investor',
    content:
      'As someone who trades part-time, MarketLens gives me access to professional-grade analysis without the complexity. The alerts keep me informed without constant monitoring.',
  },
];

export function Testimonials() {
  return (
    <div className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Testimonials</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Trusted by traders and analysts
          </p>
        </div>
        <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="-mt-8 sm:-mx-4 sm:columns-1 sm:text-[0] lg:columns-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="pt-8 sm:inline-block sm:w-full sm:px-4"
              >
                <figure className="rounded-2xl bg-white p-8 text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
                  <blockquote className="text-gray-900">
                    <p>"{testimonial.content}"</p>
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-x-4">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-gray-600">{testimonial.role}</div>
                    </div>
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
