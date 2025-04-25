import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ResolutionSidebar.module.css';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
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
  onEdit,
}: ResolutionSidebarProps) {
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
                <div key={violation.id} className={styles.violationItem}>
                  <button
                    className={styles.violationHeader}
                    onClick={() => onExpandViolation(
                      expandedViolationId === violation.id ? null : violation.id
                    )}
                  >
                    <div className={styles.violationType}>
                      {violation.type}
                      <span 
                        className={styles.violationSeverity}
                        data-severity={violation.severity}
                      >
                        {violation.severity}
                      </span>
                    </div>
                    <div className={styles.violationText}>
                      {violation.text}
                    </div>
                    <div className={styles.violationMessage}>
                      {violation.message}
                    </div>
                    <ChevronRightIcon
                      className={`${styles.expandIcon} ${
                        expandedViolationId === violation.id ? styles.expanded : ''
                      }`}
                    />
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
                              onClick={() => onAcceptSuggestion(violation.id, suggestion)}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>

                        <div className={styles.actions}>
                          <button
                            className={styles.editButton}
                            onClick={() => {
                              const newText = prompt('Enter new text:', violation.text);
                              if (newText) onEdit(violation.id, newText);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className={styles.dismissButton}
                            onClick={() => {
                              const reason = prompt('Enter reason for dismissal:');
                              if (reason) onDismiss(violation.id, reason);
                            }}
                          >
                            Dismiss
                          </button>
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