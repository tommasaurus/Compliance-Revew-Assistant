import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, GripVertical } from 'lucide-react';
import styles from './KeyGuide.module.css';

interface KeyGuideProps {
  onDismiss: () => void;
  show: boolean;
}

interface Position {
  x: number;
  y: number;
}

interface Shortcut {
  key: string;
  description: string;
}

const shortcuts: Shortcut[] = [
  { key: '↑/↓', description: 'Cycle through violations' },
  { key: 'Enter', description: 'Edit / Accept Changes' },
  { key: 'Esc', description: 'Cancel edit / Close sidebar' },
  { key: 'Hover', description: 'Show quick suggestions (when sidebar is closed)' },
];

export function KeyGuide({ onDismiss, show }: KeyGuideProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  // Load position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('keyGuidePosition');
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
  }, []);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const newPosition = {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y
    };
    setPosition(newPosition);
    localStorage.setItem('keyGuidePosition', JSON.stringify(newPosition));
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0}
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1,
            ...position
          }}
          exit={{ opacity: 0, y: 20 }}
          className={styles.container}
        >
          <div className={styles.header}>
            <div className={styles.dragHandle}>
              <GripVertical size={16} />
            </div>
            <h3 className={styles.title}>Keyboard Shortcuts</h3>
            <button onClick={onDismiss} className={styles.closeButton}>
              <X size={16} />
            </button>
          </div>
          <div className={styles.shortcuts}>
            {shortcuts.map((shortcut, index) => (
              <div key={index} className={styles.shortcut}>
                <kbd className={styles.key}>{shortcut.key}</kbd>
                <span className={styles.description}>{shortcut.description}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 