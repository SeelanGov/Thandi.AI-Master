import Link from 'next/link';

export default function Footer() {
  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'Assessment', href: '/assessment' },
    { label: 'Admin', href: '/admin' },
  ];

  const socialLinks = [
    { 
      label: 'Twitter', 
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      )
    },
    { 
      label: 'LinkedIn', 
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    },
    { 
      label: 'Facebook', 
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
  ];

  return (
    <footer className="bg-thandi-teal text-thandi-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-thandi-gradient rounded-full flex items-center justify-center ring-2 ring-thandi-gold">
                <span className="text-white font-bold text-lg font-heading">T</span>
              </div>
              <div>
                <h3 className="text-xl font-bold font-heading">Thandi.ai</h3>
                <p className="text-sm text-thandi-cream/80 font-body">From School to Success</p>
              </div>
            </div>
            <p className="text-thandi-cream/90 mb-6 max-w-md font-body">
              Empowering South African students with AI-powered career guidance. 
              Discover your path from school to a successful career that matches 
              your interests, subjects, and goals.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="text-thandi-cream/70 hover:text-thandi-gold transition-colors p-2 hover:bg-thandi-teal-mid/20 rounded-lg"
                  aria-label={social.label}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold font-heading mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-thandi-cream/80 hover:text-thandi-gold transition-colors font-body"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-12 pt-8 border-t border-thandi-cream/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h5 className="font-semibold font-heading mb-2">Get in Touch</h5>
              <p className="text-thandi-cream/80 text-sm font-body">
                <span className="block">Email: hello@thandi.online</span>
              </p>
            </div>
            <div>
              <h5 className="font-semibold font-heading mb-2">Location</h5>
              <p className="text-thandi-cream/80 text-sm font-body">
                Cape Town, South Africa<br />
                Serving students nationwide
              </p>
            </div>
            <div>
              <h5 className="font-semibold font-heading mb-2">Support</h5>
              <p className="text-thandi-cream/80 text-sm font-body">
                Available Monday - Friday<br />
                8:00 AM - 5:00 PM SAST
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-thandi-cream/20 flex flex-col md:flex-row justify-between items-center">
          <p className="text-thandi-cream/70 text-sm font-body">
            © 2025 Thandi AI (PTY) LTD. All rights reserved. • POPIA Compliant
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="text-thandi-cream/70 hover:text-thandi-gold text-sm transition-colors font-body">
              Privacy Policy
            </Link>
            <Link href="#" className="text-thandi-cream/70 hover:text-thandi-gold text-sm transition-colors font-body">
              Terms of Service
            </Link>
            <Link href="#" className="text-thandi-cream/70 hover:text-thandi-gold text-sm transition-colors font-body">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}