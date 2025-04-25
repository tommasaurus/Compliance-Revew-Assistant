"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './InteractiveHighlight.module.css';

// Types for violations and suggestions
interface Violation {
  id: string;
  text: string;
  start: number;
  end: number;
  length: number;
  type: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

interface Suggestions {
  [key: string]: string[];
}

interface Resolution {
  id: string;
  type: 'accepted' | 'dismissed' | 'edited';
  originalText: string;
  newText: string;
  comment?: string;
}

interface InteractiveHighlightProps {
  text: string;
  violations: Violation[];
  suggestions: Suggestions;
}

// Popover dimensions based on CSS
const POPOVER_WIDTH = 400; // px
const ESTIMATED_POPOVER_HEIGHT = 100; // px

export function InteractiveHighlight({ text, violations, suggestions }: InteractiveHighlightProps) {
  const [hoveredViolation, setHoveredViolation] = useState<string | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<string | null>(null);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [dismissComment, setDismissComment] = useState('');
  const [editText, setEditText] = useState('');
  const [popoverPosition, setPopoverPosition] = useState({ 
    top: 0,
    left: 0,
    isTopSide: false 
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate popover position based on initial mouse hover position
  const calculatePopoverPosition = (e: React.MouseEvent<HTMLSpanElement>) => {
    const highlightRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Determine the specific line's vertical position under the mouse
    let lineTop = highlightRect.top;
    let lineBottom = highlightRect.bottom;
    let foundLine = false;

    // Use caretRangeFromPoint for precise line detection if available
    if (document.caretRangeFromPoint) {
      const range = document.caretRangeFromPoint(mouseX, mouseY);
      if (range) {
        const rects = range.getClientRects();
        if (rects.length > 0) {
          for (const rect of rects) {
            if (mouseY >= rect.top && mouseY <= rect.bottom) {
              lineTop = rect.top;
              lineBottom = rect.bottom;
              foundLine = true;
              break;
            }
          }
        }
      }
    }

    // If no exact line is found, approximate the nearest line
    if (!foundLine) {
      const lineHeight = parseFloat(getComputedStyle(e.currentTarget).lineHeight) || 25.6;
      const totalLines = Math.ceil(highlightRect.height / lineHeight);
      let lineIndex = Math.floor((mouseY - highlightRect.top) / lineHeight);
      // Clamp lineIndex to valid range: 0 to (totalLines - 1)
      lineIndex = Math.max(0, Math.min(lineIndex, totalLines - 1));
      lineTop = highlightRect.top + lineIndex * lineHeight;
      lineBottom = Math.min(lineTop + lineHeight, highlightRect.bottom); // Don’t exceed highlight bottom
    }

    // Decide whether to place the popover below or above the highlight
    const placeBelow = lineBottom + ESTIMATED_POPOVER_HEIGHT < window.innerHeight;
    const isTopSide = !placeBelow;
    const top = placeBelow ? lineBottom : lineTop;

    // Center the popover horizontally under the mouse, with boundary checks
    let left = mouseX - POPOVER_WIDTH / 2;
    if (left + POPOVER_WIDTH > window.innerWidth) {
      left = window.innerWidth - POPOVER_WIDTH;
    }
    if (left < 0) {
      left = 0;
    }

    return { top, left, isTopSide };
  };

  // Determine highlight color based on resolution status
  const getHighlightColor = (violationId: string) => {
    const resolution = resolutions.find(r => r.id === violationId);
    if (!resolution) return 'bg-[#FFF9C4]/40';
    switch (resolution.type) {
      case 'accepted': return 'bg-green-100';
      case 'dismissed': return 'bg-gray-100';
      case 'edited': return 'bg-blue-100';
      default: return 'bg-[#FFF9C4]/40';
    }
  };

  // Handlers for accepting, dismissing, and editing suggestions
  const handleAcceptSuggestion = (violationId: string, suggestion: string) => {
    setResolutions(prev => [...prev, {
      id: violationId,
      type: 'accepted',
      originalText: violations.find(v => v.id === violationId)?.text || '',
      newText: suggestion
    }]);
    setHoveredViolation(null);
    setSelectedViolation(null);
  };

  const handleDismiss = (violationId: string) => {
    if (!dismissComment.trim()) return;
    setResolutions(prev => [...prev, {
      id: violationId,
      type: 'dismissed',
      originalText: violations.find(v => v.id === violationId)?.text || '',
      newText: violations.find(v => v.id === violationId)?.text || '',
      comment: dismissComment
    }]);
    setDismissComment('');
    setSelectedViolation(null);
  };

  const handleEdit = (violationId: string) => {
    if (!editText.trim()) return;
    setResolutions(prev => [...prev, {
      id: violationId,
      type: 'edited',
      originalText: violations.find(v => v.id === violationId)?.text || '',
      newText: editText
    }]);
    setEditText('');
    setSelectedViolation(null);
  };

  // Prevent popover from closing when moving mouse into it
  const handlePopoverEnter = () => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
  };

  // Close popover when mouse leaves it
  const handlePopoverLeave = () => {
    setHoveredViolation(null);
  };

  return (
    <div className="space-y-8">
      <div ref={containerRef} className="text-[16px] leading-[1.6] text-[#333333] relative">
        {violations.sort((a, b) => a.start - b.end).map((violation, index, sortedViolations) => {
          const isSelected = selectedViolation === violation.id;
          const resolution = resolutions.find(r => r.id === violation.id);

          const previousEnd = index === 0 ? 0 : sortedViolations[index - 1].end;
          const textBeforeViolation = text.slice(previousEnd, violation.start);

          return (
            <React.Fragment key={violation.id}>
              {textBeforeViolation}
              <span
                className={`${getHighlightColor(violation.id)} px-1 rounded cursor-pointer relative
                  ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
                onMouseEnter={(e) => {
                  if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
                  setHoveredViolation(violation.id);
                  // Set position only when popup opens, not on mouse move
                  const position = calculatePopoverPosition(e);
                  setPopoverPosition(position);
                }}
                onMouseLeave={() => {
                  if (hoveredViolation === violation.id) {
                    leaveTimeoutRef.current = setTimeout(() => {
                      setHoveredViolation(null);
                    }, 300); // 300ms delay to allow moving to popover
                  }
                }}
                onClick={() => setSelectedViolation(violation.id)}
              >
                {resolution ? resolution.newText : violation.text}
              </span>
              {index === sortedViolations.length - 1 && text.slice(violation.end)}
            </React.Fragment>
          );
        })}

        {/* Popover rendered outside highlights with fixed position once set */}
        {hoveredViolation && (
          <div
            ref={popoverRef}
            className={styles.popoverContainer}
            style={{
              position: 'fixed',
              top: `${popoverPosition.top}px`,
              left: `${popoverPosition.left}px`,
              transform: popoverPosition.isTopSide ? 'translateY(-100%)' : 'none',
            }}
            onMouseEnter={handlePopoverEnter}
            onMouseLeave={handlePopoverLeave}
          >
            <motion.div
              className={styles.popoverContent}
              initial={{ opacity: 0, y: popoverPosition.isTopSide ? 5 : -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: popoverPosition.isTopSide ? 5 : -5 }}
              transition={{ duration: 0.2 }}
            >
              {suggestions[hoveredViolation].map((suggestion, i) => (
                <button
                  key={i}
                  className={styles.suggestionButton}
                  onClick={() => handleAcceptSuggestion(hoveredViolation, suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </motion.div>
          </div>
        )}
      </div>

      {/* Resolution panel */}
      <AnimatePresence>
        {selectedViolation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-lg p-4 space-y-4"
          >
            {(() => {
              const violation = violations.find(v => v.id === selectedViolation);
              if (!violation) return null;
              return (
                <div>
                  <h3 className="font-medium">{violation.type}</h3>
                  <p className="text-sm text-gray-600">{violation.message}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs
                    ${violation.severity === 'high' ? 'bg-red-100 text-red-800' :
                    violation.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'}`}>
                    {violation.severity} severity
                  </span>
                </div>
              );
            })()}

            <div className="space-y-2">
              <div className="space-y-2">
                <h4 className="font-medium">Suggestions</h4>
                {suggestions[selectedViolation].map((suggestion, i) => (
                  <button
                    key={i}
                    className="block w-full text-left p-2 hover:bg-white rounded text-sm border"
                    onClick={() => handleAcceptSuggestion(selectedViolation, suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Dismiss</h4>
                <textarea
                  className="w-full p-2 border rounded"
                  placeholder="Enter reason for dismissal..."
                  value={dismissComment}
                  onChange={(e) => setDismissComment(e.target.value)}
                />
                <button
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => handleDismiss(selectedViolation)}
                >
                  Dismiss
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Edit Manually</h4>
                <textarea
                  className="w-full p-2 border rounded"
                  placeholder="Enter new text..."
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <button
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => handleEdit(selectedViolation)}
                >
                  Save Edit
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resolved violations list */}
      {resolutions.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium mb-2">Resolved Violations</h3>
          <ul className="space-y-2">
            {resolutions.map((resolution) => (
              <li key={resolution.id} className="text-sm">
                <span className="font-medium">{resolution.id}:</span>{' '}
                {resolution.type === 'accepted' ? 'Accepted suggestion' :
                 resolution.type === 'dismissed' ? `Dismissed (${resolution.comment})` :
                 'Manually edited'}: "{resolution.newText}"
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}