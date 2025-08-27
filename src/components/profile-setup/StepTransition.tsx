import React from 'react';
import { motion } from 'framer-motion';

interface StepTransitionProps {
  isVisible: boolean;
  direction: 'forward' | 'backward';
}

const StepTransition: React.FC<StepTransitionProps> = ({ isVisible, direction }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
    >
      {/* Transition character */}
      <motion.div
        initial={{ 
          scale: 0,
          x: direction === 'forward' ? -100 : 100
        }}
        animate={{ 
          scale: [0, 1.2, 1],
          x: 0,
          rotate: [0, 360]
        }}
        exit={{ 
          scale: 0,
          x: direction === 'forward' ? 100 : -100
        }}
        transition={{ 
          duration: 0.8,
          type: "spring",
          stiffness: 200
        }}
        className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-2xl"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: 2 }}
          className="text-3xl"
        >
          {direction === 'forward' ? '🚀' : '⬅️'}
        </motion.div>
      </motion.div>

      {/* Sparkle trail */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0,
            scale: 0,
            x: direction === 'forward' ? -150 - (i * 20) : 150 + (i * 20),
            y: (Math.random() - 0.5) * 100
          }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: direction === 'forward' ? 150 + (i * 20) : -150 - (i * 20)
          }}
          transition={{ 
            duration: 0.8,
            delay: i * 0.1
          }}
          className="absolute text-xl"
        >
          ✨
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StepTransition;