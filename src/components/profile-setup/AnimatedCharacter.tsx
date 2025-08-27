import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedCharacterProps {
  step: number;
  className?: string;
}

const AnimatedCharacter: React.FC<AnimatedCharacterProps> = ({ step, className = "" }) => {
  const getCharacterForStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
            className={`relative ${className}`}
          >
            {/* Writing Character */}
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
              className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl"
              >
                ✍️
              </motion.div>
            </motion.div>
            
            {/* Floating words */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: [0, 1, 0], x: [-20, 20, 40] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              className="absolute -top-2 -right-2 text-lg"
            >
              💭
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0, 1, 0], y: [10, -10, -30] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              className="absolute -bottom-2 -left-2 text-sm"
            >
              ✨
            </motion.div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
            className={`relative ${className}`}
          >
            {/* Camera Character */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-3xl"
              >
                📸
              </motion.div>
            </motion.div>
            
            {/* Camera flash effect */}
            <motion.div
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.8, 1.5, 0.8]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="absolute inset-0 bg-white rounded-full opacity-0"
            />
            
            {/* Floating sparkles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  y: [0, -20, -40],
                  x: [0, (i - 1) * 15, (i - 1) * 25]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
                className="absolute top-0 left-1/2 text-lg"
              >
                ⭐
              </motion.div>
            ))}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
            className={`relative ${className}`}
          >
            {/* Globe Character */}
            <motion.div
              animate={{ 
                rotateY: [0, 360],
                y: [0, -8, 0]
              }}
              transition={{ 
                rotateY: { duration: 8, repeat: Infinity, ease: "linear" },
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
              className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-3xl"
              >
                🇱🇰
              </motion.div>
            </motion.div>
            
            {/* Orbiting elements */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <motion.div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-lg">
                🏛️
              </motion.div>
            </motion.div>
            
            <motion.div
              animate={{ rotate: [0, -360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <motion.div className="absolute top-1/2 -right-3 transform -translate-y-1/2 text-lg">
                🏖️
              </motion.div>
            </motion.div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
            className={`relative ${className}`}
          >
            {/* Hobby Character */}
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 3, -3, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl"
              >
                🎨
              </motion.div>
            </motion.div>
            
            {/* Floating hobby icons */}
            {['🎵', '📚', '🎮', '🏃'].map((icon, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  y: [0, -30, -60],
                  x: [0, Math.sin(i) * 20, Math.sin(i) * 40],
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5
                }}
                className="absolute top-0 left-1/2 text-lg"
              >
                {icon}
              </motion.div>
            ))}
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
            className={`relative ${className}`}
          >
            {/* Dropdown Selection Character */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <motion.div
                animate={{ 
                  y: [0, -3, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl"
              >
                💖
              </motion.div>
            </motion.div>
            
            {/* Floating selection icons */}
            {['🎯', '⭐', '💫', '🌟'].map((icon, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  y: [0, -25, -50],
                  x: [0, Math.cos(i * 90 * Math.PI / 180) * 30, Math.cos(i * 90 * Math.PI / 180) * 50],
                  rotate: [0, 180]
                }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.4
                }}
                className="absolute top-0 left-1/2 text-lg"
              >
                {icon}
              </motion.div>
            ))}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return getCharacterForStep();
};

export default AnimatedCharacter;