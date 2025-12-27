/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Thandi brand colors - Handover Specification
        thandi: {
          teal: '#114E4E',        // Primary dark teal
          gold: '#DFA33A',        // Accent gold
          'teal-mid': '#2C7A7B',  // Secondary gradient start
          'teal-light': '#3AB795', // Secondary gradient end
          cream: '#F3E6C9',       // Light backgrounds/text
          brown: '#5C3B20',       // Secondary text/borders
        },
        // Extended THANDI teal variants for components
        'thandi-teal': {
          50: '#f0fdfa',
          100: '#ccfbf1', 
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#114E4E',  // Main THANDI teal
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        secondary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        }
      },
      fontFamily: {
        'heading': ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        'body': ['var(--font-nunito)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'thandi-gradient': 'linear-gradient(135deg, #114E4E 0%, #2C7A7B 50%, #3AB795 100%)',
        'thandi-gradient-light': 'linear-gradient(135deg, #2C7A7B 0%, #3AB795 100%)',
        'hero-gradient': 'linear-gradient(to bottom right, #2C7A7B, #3AB795)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      boxShadow: {
        'thandi': '0 10px 25px rgba(17, 78, 78, 0.1)',
        'thandi-lg': '0 20px 40px rgba(17, 78, 78, 0.15)',
      }
    },
  },
  plugins: [],
}