"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './InteractiveHighlight.module.css';

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
  resolutions: Resolution[];
  onViolationSelect: (violationId: string | null) => void;
  selectedViolationId: string | null;
  isOpen: boolean;
}

const POPOVER_WIDTH = 400;
const ESTIMATED_POPOVER_HEIGHT = 100;

export function InteractiveHighlight({ 
  text, 
  violations, 
  suggestions,
  resolutions,
  onViolationSelect,
  selectedViolationId,
  isOpen
}: InteractiveHighlightProps) {
  const [hoveredViolation, setHoveredViolation] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ 
    top: 0,
    left: 0,
    isTopSide: false 
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset hover state when sidebar closes
  useEffect(() => {
    if (!isOpen) {
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
      setHoveredViolation(null);
    }
  }, [isOpen]);

  const calculatePopoverPosition = (e: React.MouseEvent<HTMLSpanElement>) => {
    const highlightRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    let lineTop = highlightRect.top;
    let lineBottom = highlightRect.bottom;
    let foundLine = false;

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

    if (!foundLine) {
      const lineHeight = parseFloat(getComputedStyle(e.currentTarget).lineHeight) || 25.6;
      const totalLines = Math.ceil(highlightRect.height / lineHeight);
      let lineIndex = Math.floor((mouseY - highlightRect.top) / lineHeight);
      lineIndex = Math.max(0, Math.min(lineIndex, totalLines - 1));
      lineTop = highlightRect.top + lineIndex * lineHeight;
      lineBottom = Math.min(lineTop + lineHeight, highlightRect.bottom);
    }

    const placeBelow = lineBottom + ESTIMATED_POPOVER_HEIGHT < window.innerHeight;
    const isTopSide = !placeBelow;
    const top = placeBelow ? lineBottom : lineTop;

    let left = mouseX - POPOVER_WIDTH / 2;
    if (left + POPOVER_WIDTH > window.innerWidth) {
      left = window.innerWidth - POPOVER_WIDTH;
    }
    if (left < 0) {
      left = 0;
    }

    return { top, left, isTopSide };
  };

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

  const handlePopoverEnter = () => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
  };

  const handlePopoverLeave = () => {
    setHoveredViolation(null);
  };

  return (
    <div className="space-y-8">
      {/* Document Content */}
      <div
        ref={containerRef}
        className="text-[16px] leading-[1.6] text-[#333333] relative z-0"
      >
        {violations.sort((a, b) => a.start - b.end).map((violation, index, sortedViolations) => {
          const isSelected = selectedViolationId === violation.id;
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
                  if (!isOpen) {
                    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
                    setHoveredViolation(violation.id);
                    const position = calculatePopoverPosition(e);
                    setPopoverPosition(position);
                  }
                }}
                onMouseLeave={() => {
                  if (!isOpen && hoveredViolation === violation.id) {
                    leaveTimeoutRef.current = setTimeout(() => {
                      setHoveredViolation(null);
                    }, 300);
                  }
                }}
                onClick={() => onViolationSelect(violation.id)}
              >
                {resolution ? resolution.newText : violation.text}
              </span>
              {index === sortedViolations.length - 1 && text.slice(violation.end)}
            </React.Fragment>
          );
        })}

        {/* Suggestions Popover */}
        {hoveredViolation && !isOpen && (
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
                  onClick={() => {
                    onViolationSelect(hoveredViolation);
                    setHoveredViolation(null);
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}