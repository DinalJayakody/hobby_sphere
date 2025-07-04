import React from 'react';
import { motion } from 'framer-motion';

interface FloatingElementsProps {
  step: number;
}

const FloatingElements: React.FC<FloatingElementsProps> = ({ step }) => {
  const elements = [
    { emoji: '✨', delay: 0, duration: 4 },
    { emoji: '💫', delay: 1, duration: 5 },
    { emoji: '⭐', delay: 2, duration: 3.5 },
    { emoji: '🌟', delay: 0.5, duration: 4.5 },
    { emoji: '💖', delay: 1.5, duration: 4 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {elements.map((element, index) => (
        <motion.div
          key={`${step}-${index}`}
          initial={{ 
            opacity: 0,
            y: '100vh',
            x: `${Math.random() * 100}vw`,
            scale: 0
          }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            y: '-10vh',
            scale: [0, 1, 1, 0],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeOut"
          }}
          className="absolute text-2xl"
        >
          {element.emoji}
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingElements;