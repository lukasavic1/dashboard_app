const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Day Trader',
    content:
      'I used to spend hours trying to figure out what the market was doing. Now I just check the signal. It\'s saved me from at least 3 bad trades this month alone.',
  },
  {
    name: 'Michael Rodriguez',
    role: 'Swing Trader',
    content:
      'The seasonal data combined with COT positioning is gold. I caught a 15% move in crude because the signal was strong and seasonality aligned. This pays for itself.',
  },
  {
    name: 'David Kim',
    role: 'Part-Time Trader',
    content:
      'I don\'t have time to analyze charts all day. This gives me the same edge the pros have, in 30 seconds. Best $99 I spend every month.',
  },
];

export function Testimonials() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Real Results</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Traders Who Use Clear Signals Win More
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-7xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-1 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex"
              >
                <figure className="flex flex-col rounded-2xl bg-white p-6 sm:p-8 text-sm leading-6 shadow-lg ring-1 ring-gray-900/5 h-full">
                  <blockquote className="text-gray-900 flex-grow">
                    <p>"{testimonial.content}"</p>
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-x-4">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
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
