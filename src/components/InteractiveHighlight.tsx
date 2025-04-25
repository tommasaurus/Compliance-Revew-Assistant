"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import styles from './InteractiveHighlight.module.css';
import { Violation } from '@/types/types';
import { cn } from '@/lib/utils';
import { KeyGuide } from './KeyGuide';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showKeyGuide, setShowKeyGuide] = useState(true);
  const [popoverPosition, setPopoverPosition] = useState({ 
    top: 0,
    left: 0,
    isTopSide: false 
  });

  const handleAcceptEdit = () => {
    if (editingViolation) {
      const violation = violations.find(v => v.id === editingViolation);
      const resolution = resolutions.find(r => r.id === editingViolation);
      const originalText = resolution ? resolution.newText : (violation?.text || '');
      
      // Only accept if the text has actually changed
      if (editText.trim() !== originalText.trim()) {
        onEdit(editingViolation, editText);
        toast.success(
          <div className={styles.toast}>
            <strong>Text edited</strong>
            <span>{violation?.type}</span>
          </div>,
          {
            duration: 3000,
            position: 'bottom-center',
            style: {
              background: '#EFF6FF',
              color: '#1E40AF',
              border: '1px solid #BFDBFE',
            },
          }
        );
      }
      setEditingViolation(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingViolation(null);
    setEditText('');
  };

  // Helper function to get the current text for a violation
  const getViolationText = useCallback((violationId: string) => {
    const violation = violations.find(v => v.id === violationId);
    const resolution = resolutions.find(r => r.id === violationId);
    return resolution ? resolution.newText : (violation?.text || '');
  }, [violations, resolutions]);

  // Combined keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if we're in a textarea
      if (e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        if (selectedViolationId && !editingViolation) {
          // Start editing when not in edit mode and a violation is selected
          e.preventDefault();
          handleStartEdit(selectedViolationId, getViolationText(selectedViolationId));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedViolationId, editingViolation, getViolationText]);

  useEffect(() => {
    if (editingViolation && editInputRef.current) {
      editInputRef.current.focus();
      const length = editInputRef.current.value.length;
      editInputRef.current.setSelectionRange(length, length);
    }
  }, [editingViolation]);

  // Reset hover state when sidebar closes
  useEffect(() => {
    if (!isOpen) {
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
      setHoveredViolation(null);
    }
  }, [isOpen]);

  const handleDismissKeyGuide = () => {
    setShowKeyGuide(false);    
  };

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

  const renderHighlightContent = (violationId: string, text: string) => {
    if (editingViolation === violationId) {
      return (
        <span className={styles.editContainer}>
          <textarea
            ref={editInputRef}
            value={editText}
            onChange={(e) => {
              setEditText(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAcceptEdit();
              } else if (e.key === 'Escape') {
                handleCancelEdit();
              }
            }}
            className={styles.editInput}
            autoFocus
            rows={1}
            style={{
              width: `${text.length}ch`,
            }}
          />
          <span className={styles.editButtons}>
            <button
              onClick={handleAcceptEdit}
              className={cn(styles.editButton, styles.acceptButton)}
              title="Accept (Enter)"
            >
              ✓
            </button>
            <button
              onClick={handleCancelEdit}
              className={cn(styles.editButton, styles.cancelButton)}
              title="Cancel (Esc)"
            >
              ✕
            </button>
          </span>
        </span>
      );
    }
    return text;
  };

  return (
    <div className="space-y-8">
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
                renderHighlightContent(violation.id, currentText)
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
                    const violation = violations.find(v => v.id === hoveredViolation);
                    toast.success(
                      <div className={styles.toast}>
                        <strong>Suggestion accepted</strong>
                        <span>{violation?.type}</span>
                      </div>,
                      {
                        duration: 3000,
                        position: 'bottom-center',
                        style: {
                          background: '#F0FDF4',
                          color: '#166534',
                          border: '1px solid #BBF7D0',
                        },
                      }
                    );
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

      {/* Key Guide */}
      <KeyGuide 
        show={showKeyGuide} 
        onDismiss={handleDismissKeyGuide}
      />
    </div>
  );
}