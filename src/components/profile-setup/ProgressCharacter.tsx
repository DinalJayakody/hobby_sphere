import React from 'react';
import { motion } from 'framer-motion';

interface ProgressCharacterProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressCharacter: React.FC<ProgressCharacterProps> = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="flex items-center justify-center mb-8">
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
        className="relative"
      >
        {/* Character body */}
        <motion.div
          animate={{ 
            y: [0, -5, 0],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg relative"
        >
          {/* Character face based on progress */}
          <motion.div
            key={currentStep}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="text-2xl"
          >
            {progress < 25 ? '😊' : progress < 50 ? '😄' : progress < 75 ? '🤗' : '🎉'}
          </motion.div>
          
          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(30, 64, 175, 0.2)"
              strokeWidth="4"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#1e40af"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progress / 100 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              style={{
                strokeDasharray: "283", // 2 * π * 45
                strokeDashoffset: 0,
              }}
            />
          </svg>
        </motion.div>

        {/* Celebration particles when completed */}
        {progress === 100 && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, Math.cos(i * 45 * Math.PI / 180) * 40],
                  y: [0, Math.sin(i * 45 * Math.PI / 180) * 40]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 1,
                  delay: i * 0.1
                }}
                className="absolute top-1/2 left-1/2 text-lg"
              >
                🎊
              </motion.div>
            ))}
          </>
        )}

        {/* Step indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-slate-700 text-sm font-medium bg-white/30 px-3 py-1 rounded-full"
        >
          {currentStep}/{totalSteps}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProgressCharacter;