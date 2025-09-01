import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SlidingDoorsProps {
  isOpen: boolean;
  onAnimationComplete?: () => void;
}

const SlidingDoors: React.FC<SlidingDoorsProps> = ({ isOpen, onAnimationComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    console.log('[SlidingDoors] isOpen changed:', isOpen);
    
    if (isOpen && !isVisible) {
      console.log('[SlidingDoors] Starting animation');
      setIsVisible(true);
      setAnimationComplete(false);
    } else if (!isOpen && isVisible && !animationComplete) {
      console.log('[SlidingDoors] Starting close animation');
      setAnimationComplete(true);
    }
  }, [isOpen, isVisible, animationComplete]);

  const handleAnimationComplete = () => {
    if (isOpen && !animationComplete) {
      console.log('[SlidingDoors] Open animation complete');
      setAnimationComplete(true);
      
      // Wait a moment before triggering the complete callback
      const timer = setTimeout(() => {
        console.log('[SlidingDoors] Triggering onAnimationComplete');
        onAnimationComplete?.();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex pointer-events-none">
      <motion.div
        className="h-full w-1/2 bg-indigo-700"
        initial={{ x: 0 }}
        animate={{ x: isOpen ? '-100%' : 0 }}
        transition={{ 
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1]
        }}
        onAnimationComplete={handleAnimationComplete}
      />
      <motion.div
        className="h-full w-1/2 bg-indigo-700"
        initial={{ x: 0 }}
        animate={{ x: isOpen ? '100%' : 0 }}
        transition={{ 
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1]
        }}
      />
    </div>
  );
};

export default SlidingDoors;