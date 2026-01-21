'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { label: 'Home', href: '/', isActive: true },
    { label: 'Assessment', href: '/assessment', isActive: false },
    { label: 'School Login', href: '/school/claim', isActive: false },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-thandi-gradient rounded-full flex items-center justify-center ring-2 ring-thandi-gold">
              <span className="text-white font-bold text-lg font-heading">T</span>
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading text-thandi-teal">Thandi.ai</h1>
              <p className="text-xs text-thandi-brown -mt-1 font-body">From School to Success</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                  item.isActive 
                    ? 'text-primary-600 border-b-2 border-primary-600 pb-1' 
                    : 'text-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/assessment"
              className="bg-thandi-gold text-thandi-teal px-6 py-2.5 rounded-lg font-medium font-body hover:bg-thandi-gold/90 transition-all duration-200 hover:scale-105"
            >
              Start Assessment
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-base font-medium px-3 py-2 rounded-md transition-colors ${
                    item.isActive 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/assessment"
                className="bg-thandi-gold text-thandi-teal px-4 py-3 rounded-lg font-medium font-body text-center mt-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Start Assessment
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}