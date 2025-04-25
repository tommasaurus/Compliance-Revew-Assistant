"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  onAcceptSuggestion: (violationId: string, suggestion: string) => void;
  onEdit: (violationId: string, newText: string) => void;
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
  isOpen,
  onAcceptSuggestion,
  onEdit
}: InteractiveHighlightProps) {
  const [hoveredViolation, setHoveredViolation] = useState<string | null>(null);
  const [editingViolation, setEditingViolation] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const [inputWidth, setInputWidth] = useState<number>(0);
  const measureRef = useRef<HTMLDivElement>(null);
  const [popoverPosition, setPopoverPosition] = useState({ 
    top: 0,
    left: 0,
    isTopSide: false 
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (editingViolation && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingViolation]);

  // Update input width when text changes
  useEffect(() => {
    if (measureRef.current && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const textWidth = measureRef.current.offsetWidth;
      // Limit width to container width
      setInputWidth(Math.min(textWidth + 20, containerWidth - 40)); // 40px for padding
    }
  }, [editText]);

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

  const getSeverityClass = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return styles.highlightHigh;
      case 'medium': return styles.highlightMedium;
      case 'low': return styles.highlightLow;
      default: return '';
    }
  };

  const getHighlightClass = (violationId: string) => {
    const resolution = resolutions.find(r => r.id === violationId);
    const violation = violations.find(v => v.id === violationId);
    
    const classes = [styles.highlight];
    
    if (resolution) {
      switch (resolution.type) {
        case 'accepted':
          classes.push(styles.highlightAccepted);
          break;
        case 'dismissed':
          classes.push(styles.highlightDismissed);
          break;
        case 'edited':
          classes.push(styles.highlightEdited);
          break;
      }
    } else if (violation) {
      classes.push(getSeverityClass(violation.severity));
    }
    
    return classes.join(' ');
  };

  const handlePopoverEnter = () => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
  };

  const handlePopoverLeave = () => {
    setHoveredViolation(null);
  };

  const handleStartEdit = (violationId: string, currentText: string) => {
    setEditingViolation(violationId);
    setEditText(currentText);
    setHoveredViolation(null);
  };

  const handleFinishEdit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && editingViolation && editText.trim()) {
      e.preventDefault(); // Prevent newline
      onEdit(editingViolation, editText);
      setEditingViolation(null);
      setEditText('');
    } else if (e.key === 'Escape') {
      setEditingViolation(null);
      setEditText('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Hidden measure element */}
      <div
        ref={measureRef}
        style={{
          visibility: 'hidden',
          position: 'absolute',
          whiteSpace: 'pre-wrap',
          fontSize: '16px',
          lineHeight: '1.6',
          padding: '0 0.25rem',
          maxWidth: '100%'
        }}
      >
        {editText}
      </div>

      {/* Document Content */}
      <div
        ref={containerRef}
        className="text-[16px] leading-[1.6] text-[#333333] relative z-0 max-w-[800px]"
      >
        {violations.sort((a, b) => a.start - b.end).map((violation, index, sortedViolations) => {
          const isSelected = selectedViolationId === violation.id;
          const resolution = resolutions.find(r => r.id === violation.id);
          const previousEnd = index === 0 ? 0 : sortedViolations[index - 1].end;
          const textBeforeViolation = text.slice(previousEnd, violation.start);
          const isEditing = editingViolation === violation.id;
          const currentText = resolution ? resolution.newText : violation.text;

          return (
            <React.Fragment key={violation.id}>
              {textBeforeViolation}
              {isEditing ? (
                <textarea
                  ref={editInputRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleFinishEdit}
                  onBlur={() => {
                    setEditingViolation(null);
                    setEditText('');
                  }}
                  className={`${styles.editInput} ${getHighlightClass(violation.id)}`}
                  style={{ 
                    width: `${inputWidth}px`,
                    minHeight: '24px',
                    height: 'auto'
                  }}
                />
              ) : (
                <span
                  className={`${getHighlightClass(violation.id)} ${isSelected ? styles.selected : ''}`}
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
                  onClick={() => {
                    handleStartEdit(violation.id, currentText);
                    onViolationSelect(violation.id);
                  }}
                >
                  {currentText}
                </span>
              )}
              {index === sortedViolations.length - 1 && text.slice(violation.end)}
            </React.Fragment>
          );
        })}

        {/* Suggestions Popover */}
        {hoveredViolation && !isOpen && !editingViolation && (
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
            >
              {suggestions[hoveredViolation]?.map((suggestion, index) => (
                <button
                  key={index}
                  className={styles.suggestionButton}
                  onClick={() => {
                    onAcceptSuggestion(hoveredViolation, suggestion);
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