import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import styles from './ResolutionSidebar.module.css';
import { ChevronLeftIcon, ChevronRightIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Violation, Suggestions } from '@/lib/types';

interface ResolutionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onExpand: () => void;
  violations: Violation[];
  suggestions: Suggestions;
  expandedViolationId: string | null;
  onExpandViolation: (id: string | null) => void;
  onAcceptSuggestion: (violationId: string, suggestion: string) => void;
  onDismiss: (violationId: string, reason: string) => void;
  onEdit: (violationId: string, newText: string) => void;
  resolutions: Array<{
    id: string;
    type: 'accepted' | 'dismissed' | 'edited';
    originalText: string;
    newText: string;
    comment?: string;
  }>;
}

export function ResolutionSidebar({
  isOpen,
  onClose,
  onExpand,
  violations,
  suggestions,
  expandedViolationId,
  onExpandViolation,
  onAcceptSuggestion,
  onDismiss,
  resolutions,
}: ResolutionSidebarProps) {
  // Add state to track dismiss reason text for each violation
  const [dismissReasons, setDismissReasons] = useState<Record<string, string>>({});

  const handleDismissReasonChange = (violationId: string, value: string) => {
    setDismissReasons(prev => ({
      ...prev,
      [violationId]: value
    }));
  };

  const handleAcceptSuggestion = (violationId: string, suggestion: string) => {
    onAcceptSuggestion(violationId, suggestion);
    const violation = violations.find(v => v.id === violationId);
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
  };

  const handleDismiss = (violationId: string, reason: string) => {
    onDismiss(violationId, reason);
    const violation = violations.find(v => v.id === violationId);
    toast.success(
      <div className={styles.toast}>
        <strong>Violation dismissed</strong>
        <span>{violation?.type}</span>
      </div>,
      {
        duration: 3000,
        position: 'bottom-center',
        style: {
          background: '#F3F4F6',
          color: '#374151',
          border: '1px solid #E5E7EB',
        },
      }
    );
    handleDismissReasonChange(violationId, '');
  };

  return (
    <>
      {/* Expand Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{
              duration: 0.3,
              ease: "linear"
            }}
            className={styles.expandButton}
            onClick={onExpand}
          >
            <ChevronLeftIcon className={styles.expandButtonIcon} />
            <span className={styles.expandButtonText}>Expand</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.sidebar}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              duration: 0.3,
              ease: "linear"
            }}
          >
            <div className={styles.header}>
              <div className={styles.title}>
                <h2>Review suggestions</h2>
                <div className={styles.count}>{violations.length}</div>
              </div>
            </div>

            <motion.button 
              onClick={onClose} 
              className={styles.closeButton}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{
                duration: 0.3,
                ease: "linear"
              }}
            >
              <ChevronRightIcon />
            </motion.button>

            <div className={styles.content}>
              {violations.map((violation) => (
                <div 
                  key={violation.id} 
                  className={styles.violationItem}
                  data-selected={violation.id === expandedViolationId}
                >
                  <button
                    className={styles.violationHeader}
                    onClick={() => onExpandViolation(
                      expandedViolationId === violation.id ? null : violation.id
                    )}
                  >
                    <div className={styles.violationType}>
                      <span>{violation.type}</span>
                      <span 
                        className={styles.violationSeverity}
                        data-severity={violation.severity}
                      >
                        {violation.severity === 'high' && (
                          <ExclamationTriangleIcon className="w-3 h-3" />
                        )}
                        {violation.severity}
                      </span>
                      {resolutions.some(r => r.id === violation.id && (r.type === 'accepted' || r.type === 'edited')) && (
                        <span className={styles.resolvedBadge}>
                          Resolved
                        </span>
                      )}
                      {resolutions.some(r => r.id === violation.id && r.type === 'dismissed') && (
                        <span className={styles.dismissedBadge}>
                          Dismissed
                        </span>
                      )}
                    </div>
                    <div className={styles.violationText}>
                        &quot;{resolutions.find(r => r.id === violation.id)?.newText || violation.text}&quot;
                    </div>
                    <div className={styles.violationMessage}>
                      {violation.message}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedViolationId === violation.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: "linear",
                          opacity: { duration: 0.2 }
                        }}
                        className={styles.violationDetails}
                      >
                        <div className={styles.suggestions}>
                          {suggestions[violation.id]?.map((suggestion: string, index: number) => (
                            <button
                              key={index}
                              className={styles.suggestion}
                              onClick={() => handleAcceptSuggestion(violation.id, suggestion)}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>

                        <div className={styles.dismissSection}>
                          {resolutions.some(r => r.id === violation.id && r.type === 'dismissed') ? (
                            <div className={styles.dismissReason}>
                              <div className={styles.dismissReasonLabel}>Dismiss reason:</div>
                              <div className={styles.dismissReasonText}>
                                {resolutions.find(r => r.id === violation.id && r.type === 'dismissed')?.comment}
                              </div>
                            </div>
                          ) : (
                            <>
                              <textarea
                                className={styles.dismissInput}
                                placeholder="Enter reason for dismissal..."
                                rows={3}
                                value={dismissReasons[violation.id] || ''}
                                onChange={(e) => handleDismissReasonChange(violation.id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    const reason = dismissReasons[violation.id]?.trim();
                                    if (reason) {
                                      handleDismiss(violation.id, reason);
                                    }
                                  }
                                }}
                              />
                              <button
                                className={`${styles.actionButton} ${!dismissReasons[violation.id]?.trim() ? styles.actionButtonDisabled : ''}`}
                                onClick={() => {
                                  const reason = dismissReasons[violation.id]?.trim();
                                  if (reason) {
                                    handleDismiss(violation.id, reason);
                                  }
                                }}
                                disabled={!dismissReasons[violation.id]?.trim()}
                              >
                                Dismiss
                              </button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}