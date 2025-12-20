import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import PrintButton from '../components/PrintButton';

// Legal document metadata
const legalDocuments = {
  'privacy-policy': {
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal information',
    file: 'privacy-policy.md'
  },
  'terms-of-service': {
    title: 'Terms of Service',
    description: 'Terms and conditions for using Thandi.ai',
    file: 'terms-of-service.md'
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    description: 'How we use cookies and similar technologies',
    file: 'cookie-policy.md'
  },
  'disclaimers': {
    title: 'Disclaimers & Limitations',
    description: 'Important disclaimers about AI-generated content',
    file: 'disclaimers.md'
  },
  'popia-compliance': {
    title: 'POPIA Compliance Statement',
    description: 'Our compliance with South African data protection law',
    file: 'popia-compliance.md'
  },
  'student-data-protection': {
    title: 'Student Data Protection Guidelines',
    description: 'Special protections for student data during beta testing',
    file: 'student-data-protection.md'
  },
  'content-policy': {
    title: 'AI Content Policy',
    description: 'How we govern AI-generated content and recommendations',
    file: 'content-policy.md'
  },
  'data-processing-notice': {
    title: 'Data Processing Notice',
    description: 'Detailed information about how we process personal data',
    file: 'data-processing-notice.md'
  },
  'accessibility-statement': {
    title: 'Accessibility Statement',
    description: 'Our commitment to digital accessibility for all students',
    file: 'accessibility-statement.md'
  },
  'contact-information': {
    title: 'Contact Information',
    description: 'How to reach us and our Information Officer',
    file: 'contact-information.md'
  }
};

export async function generateStaticParams() {
  return Object.keys(legalDocuments).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const doc = legalDocuments[slug];
  if (!doc) return { title: 'Legal Document Not Found' };
  
  return {
    title: `${doc.title} | Thandi.ai`,
    description: doc.description,
  };
}

async function getLegalDocument(slug) {
  const doc = legalDocuments[slug];
  if (!doc) return null;

  try {
    const filePath = path.join(process.cwd(), 'legal', doc.file);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    return {
      ...doc,
      content: fileContents,
    };
  } catch (error) {
    console.error(`Error reading legal document ${slug}:`, error);
    return null;
  }
}

// Simple markdown to HTML converter for basic formatting
function markdownToHtml(markdown) {
  return markdown
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-4">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4 class="text-lg font-semibold text-gray-900 mt-4 mb-2">$1</h4>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/^\- (.*$)/gim, '<li class="mb-2 text-gray-700">$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li class="mb-2 text-gray-700">$2</li>')
    .replace(/\n\n/g, '</p><p class="mb-4 text-gray-700">')
    .replace(/^(?!<[h|l|p])/gm, '<p class="mb-4 text-gray-700">')
    .replace(/(?<!>)$/gm, '</p>');
}

export default async function LegalDocumentPage({ params }) {
  const { slug } = await params;
  const document = await getLegalDocument(slug);
  
  if (!document) {
    notFound();
  }

  const htmlContent = markdownToHtml(document.content);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/"
            className="inline-flex items-center text-thandi-teal hover:text-thandi-teal-dark transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Thandi.ai
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Document Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {document.title}
          </h1>
          <p className="text-lg text-gray-600">
            {document.description}
          </p>
        </div>

        {/* Document Content */}
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Document Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-gray-500">
              <p>Document provided by THANDI AI (PTY) LTD</p>
              <p>POPIA Registration: 2025-068149</p>
            </div>
            <div className="flex gap-4">
              <PrintButton />
              <Link
                href="/legal/contact-information"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-thandi-teal hover:bg-thandi-teal-dark transition-colors"
              >
                Contact Information Officer
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}