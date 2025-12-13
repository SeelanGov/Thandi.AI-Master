import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Thandi.ai
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your AI-powered career guidance counselor for South African students
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Curriculum-Aware Career Guidance
          </h2>
          <p className="text-gray-600 mb-6">
            Get personalized career recommendations based on your curriculum (CAPS or IEB), 
            subjects, and university requirements. Our AI understands the South African 
            education system and provides accurate, up-to-date guidance.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="text-left">
              <h3 className="font-semibold text-gray-800 mb-2">✅ CAPS Curriculum</h3>
              <p className="text-sm text-gray-600">
                Complete support for government school curriculum with accurate 
                university requirements and career pathways.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800 mb-2">✅ IEB Curriculum</h3>
              <p className="text-sm text-gray-600">
                Full Independent Education Board support including AP Mathematics 
                bonuses and university-specific APS calculations.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/assessment" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
          >
            Start Your Career Assessment
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>🎓 Supports both CAPS and IEB curricula</p>
            <p>🏫 Covers all major South African universities</p>
            <p>📊 Updated for 2026 admission requirements</p>
          </div>
        </div>
        
        <div className="mt-12 text-xs text-gray-400">
          <p>Powered by curriculum-aware AI with 605+ knowledge embeddings</p>
        </div>
      </div>
    </div>
  );
}