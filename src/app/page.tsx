"use client";

import { Inter } from 'next/font/google';
import { InteractiveHighlight } from '@/components/InteractiveHighlight';
import { ResolutionSidebar } from '@/components/ResolutionSidebar';
import { violations, suggestions } from '@/lib/mockData';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

const sampleText = "Our proprietary investment algorithm is designed by top-tier analysts and uses cutting-edge machine learning. It guarantees consistent returns of up to 20% annually. We've helped hundreds of investors beat the market and build generational wealth. Contact us today to learn how we can make you our next success story.";

export default function Home() {
  const [selectedViolation, setSelectedViolation] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedViolation, setExpandedViolation] = useState<string | null>(null);
  const [resolutions, setResolutions] = useState<Array<{
    id: string;
    type: 'accepted' | 'dismissed' | 'edited';
    originalText: string;
    newText: string;
    comment?: string;
  }>>([]);

  const handleViolationSelect = (violationId: string | null) => {
    setSelectedViolation(violationId);
    if (violationId) {
      setIsSidebarOpen(true);
      setExpandedViolation(violationId);
    }
  };

  const handleExpandViolation = (violationId: string | null) => {
    setExpandedViolation(violationId);
    setSelectedViolation(violationId);
  };

  const handleAcceptSuggestion = (violationId: string, suggestion: string) => {
    setResolutions(prev => [...prev, {
      id: violationId,
      type: 'accepted',
      originalText: violations.find(v => v.id === violationId)?.text || '',
      newText: suggestion
    }]);
    setExpandedViolation(null);
  };

  const handleDismiss = (violationId: string, comment: string) => {
    setResolutions(prev => [...prev, {
      id: violationId,
      type: 'dismissed',
      originalText: violations.find(v => v.id === violationId)?.text || '',
      newText: violations.find(v => v.id === violationId)?.text || '',
      comment
    }]);
    setExpandedViolation(null);
  };

  const handleEdit = (violationId: string, newText: string) => {
    setResolutions(prev => [...prev, {
      id: violationId,
      type: 'edited',
      originalText: violations.find(v => v.id === violationId)?.text || '',
      newText
    }]);
    setExpandedViolation(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="h-12 border-b border-[#E5E9EF] bg-white/90 backdrop-blur-sm flex items-center px-4 sticky top-0 z-20">        
        <button className="p-1.5 hover:bg-gray-100/80 rounded-full transition-all">
          <svg className="w-4 h-4 text-[#34495E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="ml-3 flex items-center space-x-2">
          <svg className="w-4 h-4 text-[#34495E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-sm text-[#34495E] font-medium">
            Compliance Review
          </span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[794px] mx-auto px-4 py-8">
          <div className="bg-[#FCFCFD] border border-[#E5E9EF] shadow-[0_4px_24px_rgba(0,0,0,0.28)] min-h-[1000px]">
            <div className="px-16 pt-[36px] pb-16">
              <div className="max-w-[590px] mx-auto">
                <div className="flex flex-col items-center mb-12">
                  <h1 className={`${inter.className} text-[24px] font-semibold text-[#333333] tracking-[-0.01em] text-center`}>
                    Blog Post
                  </h1>
                  <div className="w-12 h-[1px] bg-[#D3D3D3] mt-4"></div>
                </div>
                <div className={`${inter.className} space-y-8`}>
                  <InteractiveHighlight
                    text={sampleText}
                    violations={violations}
                    suggestions={suggestions}
                    resolutions={resolutions}
                    onViolationSelect={handleViolationSelect}
                    selectedViolationId={selectedViolation}
                    isOpen={isSidebarOpen}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Resolution Sidebar */}
      <ResolutionSidebar
        isOpen={isSidebarOpen}
        onClose={() => {
          setIsSidebarOpen(false);
          setSelectedViolation(null);
          setExpandedViolation(null);
        }}
        onExpand={() => setIsSidebarOpen(true)}
        violations={violations}
        suggestions={suggestions}
        expandedViolationId={expandedViolation}
        onExpandViolation={handleExpandViolation}
        onAcceptSuggestion={handleAcceptSuggestion}
        onDismiss={handleDismiss}
        onEdit={handleEdit}
      />
    </div>
  );
}
