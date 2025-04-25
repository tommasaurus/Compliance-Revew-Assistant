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
    setResolutions(prev => {
      const existingIndex = prev.findIndex(r => r.id === violationId);
      const newResolution = {
        id: violationId,
        type: 'accepted' as const,
        originalText: violations.find(v => v.id === violationId)?.text || '',
        newText: suggestion
      };

      if (existingIndex !== -1) {
        // Replace existing resolution
        const newResolutions = [...prev];
        newResolutions[existingIndex] = newResolution;
        return newResolutions;
      } else {
        // Add new resolution
        return [...prev, newResolution];
      }
    });
    setExpandedViolation(null);
  };

  const handleDismiss = (violationId: string, comment: string) => {
    setResolutions(prev => {
      const existingIndex = prev.findIndex(r => r.id === violationId);
      const newResolution = {
        id: violationId,
        type: 'dismissed' as const,
        originalText: violations.find(v => v.id === violationId)?.text || '',
        newText: violations.find(v => v.id === violationId)?.text || '',
        comment
      };

      if (existingIndex !== -1) {
        // Replace existing resolution
        const newResolutions = [...prev];
        newResolutions[existingIndex] = newResolution;
        return newResolutions;
      } else {
        // Add new resolution
        return [...prev, newResolution];
      }
    });
    setExpandedViolation(null);
  };

  const handleEdit = (violationId: string, newText: string) => {
    setResolutions(prev => {
      const existingIndex = prev.findIndex(r => r.id === violationId);
      const newResolution = {
        id: violationId,
        type: 'edited' as const,
        originalText: violations.find(v => v.id === violationId)?.text || '',
        newText
      };

      if (existingIndex !== -1) {
        // Replace existing resolution
        const newResolutions = [...prev];
        newResolutions[existingIndex] = newResolution;
        return newResolutions;
      } else {
        // Add new resolution
        return [...prev, newResolution];
      }
    });
    setExpandedViolation(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="h-[2.8rem] border-b border-[#E5E9EF] bg-white/90 backdrop-blur-sm flex items-center px-6 sticky top-0 z-20">        
        <div className="flex items-center ml-[10px]">
          <span className={`${inter.className} text-[1.3rem] font-[extrabold] tracking-tight text-[#1F2937]`}>
            Compliance<span className="font-bold text-[#4B5563]">Review</span>
          </span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[794px] mx-auto px-4 py-8 min-h-[100vh]">
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
                    onAcceptSuggestion={handleAcceptSuggestion}
                    onEdit={handleEdit}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="h-[500px]"></div>
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
        resolutions={resolutions}
      />
    </div>
  );
}
