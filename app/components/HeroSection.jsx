import Link from 'next/link';

export default function HeroSection() {
  const statistics = [
    {
      number: '6',
      label: 'Quick Steps',
      description: ''
    },
    {
      number: '5',
      label: 'Career Matches',
      description: ''
    },
    {
      number: '5min',
      label: 'To Complete',
      description: ''
    }
  ];

  return (
    <section className="relative bg-hero-gradient min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(circle_at_1px_1px,rgba(44,122,123,0.1)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* AI Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-thandi-cream/20 backdrop-blur-sm border border-thandi-gold/30 mb-8">
            <svg className="w-4 h-4 text-thandi-gold" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm text-thandi-cream font-medium font-body">AI-Powered Career Guidance</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-7xl font-bold font-heading text-thandi-cream mb-6 leading-tight">
            From School to{' '}
            <span className="text-thandi-gold">Success</span>
          </h1>

          {/* Value Proposition */}
          <p className="text-xl sm:text-2xl text-thandi-cream/90 mb-10 leading-relaxed font-body">
            Discover your ideal career path in just 6 quick steps. Get AI-powered recommendations backed by South African labor market data.
          </p>

          {/* Primary CTA */}
          <Link
            href="/assessment"
            className="inline-flex items-center bg-thandi-gold hover:bg-thandi-gold/90 text-thandi-teal font-semibold font-body rounded-full px-10 py-7 shadow-xl transition-all duration-300 hover:scale-105 mb-20"
          >
            Start Your Assessment
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {statistics.map((stat, index) => (
              <div key={index} className="text-center">
                {index === 1 && <div className="border-x border-thandi-cream/20 h-full flex flex-col justify-center">
                  <div className="text-4xl sm:text-5xl font-bold font-heading text-thandi-gold mb-2">
                    {stat.number}
                  </div>
                  <div className="text-base text-thandi-cream/80 font-body">
                    {stat.label}
                  </div>
                </div>}
                {index !== 1 && (
                  <>
                    <div className="text-4xl sm:text-5xl font-bold font-heading text-thandi-gold mb-2">
                      {stat.number}
                    </div>
                    <div className="text-base text-thandi-cream/80 font-body">
                      {stat.label}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}