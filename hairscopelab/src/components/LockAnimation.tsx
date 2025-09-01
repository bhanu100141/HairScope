import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LockAnimationProps {
  playing: boolean;
  size?: number;
  onComplete?: () => void;
}

/**
 * Animated center lock: rotates and fades, then completes.
 */
const LockAnimation: React.FC<LockAnimationProps> = ({ 
  playing, 
  size = 80, 
  onComplete 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (playing && !isAnimating) {
      console.log('Starting lock animation');
      setIsVisible(true);
      setIsAnimating(true);
      
      // Auto-hide after animation completes
      const timer = setTimeout(() => {
        console.log('Lock animation completed');
        setIsVisible(false);
        setIsAnimating(false);
        onComplete?.();
      }, 1500);
      
      return () => {
        console.log('Cleaning up lock animation');
        clearTimeout(timer);
      };
    }
  }, [playing, isAnimating, onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="flex flex-col items-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <motion.svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-indigo-600"
            animate={{
              rotate: [0, 360],
              opacity: [1, 0.8, 1],
            }}
            transition={{
              rotate: { 
                duration: 1.5,
                ease: "easeInOut",
                repeat: 0,
              },
              opacity: {
                duration: 1.5,
                ease: "easeInOut",
                repeat: 0,
              }
            }}
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </motion.svg>
          
          <motion.p 
            className="mt-4 text-lg font-medium text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Access Granted
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LockAnimation;