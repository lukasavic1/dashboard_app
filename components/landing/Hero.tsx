'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function Hero() {
  const { user } = useAuth();
  const router = useRouter();
  const [particles, setParticles] = useState<Array<{ left: number; top: number; size: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    // Generate random particle positions and properties
    const particleData = Array.from({ length: 20 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
      duration: Math.random() * 20 + 15,
    }));
    setParticles(particleData);
  }, []);

  const handleSubscribeClick = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/signup');
    }
  };

  const scrollToPricing = () => {
    const element = document.getElementById('pricing');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative isolate overflow-hidden min-h-screen flex items-center px-6 pt-14 lg:px-8">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>

      {/* Animated floating particles */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-200/30 blur-sm animate-float"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Animated data visualization lines */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3">
                <animate attributeName="stop-opacity" values="0.3;0.6;0.3" dur="4s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3">
                <animate attributeName="stop-opacity" values="0.3;0.6;0.3" dur="4s" repeatCount="indefinite" begin="1s" />
              </stop>
            </linearGradient>
          </defs>
          <path
            d="M 0,300 Q 200,250 400,280 T 800,290 T 1200,300"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
          />
          <path
            d="M 0,350 Q 300,320 600,340 T 1200,360"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
            style={{ animationDelay: '1s' }}
          />
        </svg>
      </div>

      {/* Animated gradient orbs */}
      <div className="absolute -z-10">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="mx-auto max-w-5xl w-full py-20 relative z-10">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl leading-tight">
            Gold, Crude Oil, and more. Fully analyzed
          </h1>
          <p className="mt-8 text-xl leading-relaxed text-gray-800 sm:text-2xl font-medium">
            Every Friday, commercial traders report their positions. We turn that data into bullish/bearish signals for stocks, crude oil, gold, and 50+ markets. No interpretation needed.
          </p>
          <div className="mt-12 flex items-center justify-center">
            <button
              onClick={handleSubscribeClick}
              className="rounded-xl bg-blue-600 px-10 py-5 text-xl font-bold text-white shadow-2xl hover:bg-blue-700 transition-all hover:shadow-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 relative z-10"
            >
              {user ? 'Go to Dashboard' : 'Get COT Signals Now'}
            </button>
          </div>
          <p className="mt-8 text-base text-gray-600">
            <span className="font-bold text-green-600">30-day money-back guarantee</span> • Cancel anytime
          </p>
        </div>
      </div>

    </div>
  );
}
