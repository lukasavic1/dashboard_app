const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Stock & Commodity Trader',
    content:
      'I trade crude oil and gold. Before COT signals, I lost money guessing. Now I just check: bullish or bearish? Saved me from 3 bad trades last month. This pays for itself.',
  },
  {
    name: 'Michael Rodriguez',
    role: 'Commodity Trader',
    content:
      'Caught a 15% move in crude oil because the COT signal was strong and seasonality aligned. Commercial traders were long before price moved. This is the edge I needed.',
  },
  {
    name: 'David Kim',
    role: 'Part-Time Trader',
    content:
      'I trade stocks and commodities part-time. Don\'t have hours to analyze. COT signals give me the same data institutions use, in 30 seconds. Best $99/month I spend.',
  },
];

export function Testimonials() {
  return (
    <div className="bg-white min-h-screen flex flex-col justify-center px-6 lg:px-8 py-20">
      <div className="mx-auto max-w-6xl w-full">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Traders Using COT Signals Win More
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="flex"
            >
              <figure className="flex flex-col rounded-3xl bg-white p-8 text-base leading-relaxed shadow-2xl ring-2 ring-gray-200 h-full">
                <blockquote className="text-gray-900 flex-grow text-lg">
                  <p>"{testimonial.content}"</p>
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-x-4">
                  <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-base text-gray-600">{testimonial.role}</div>
                  </div>
                </figcaption>
              </figure>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
