import Header from './components/Header';
import HeroSection from './components/HeroSection';
import Footer from './components/Footer';

export const metadata = {
  title: 'THANDI - AI Career Guidance for South African Students',
  description: 'Discover your perfect career path with THANDI\'s AI-powered career assessment. Designed specifically for South African Grade 10-12 students following the CAPS curriculum.',
  keywords: 'career guidance, South Africa, CAPS curriculum, Grade 10, Grade 11, Grade 12, university applications, bursaries, AI career assessment',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
}