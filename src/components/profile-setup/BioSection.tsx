import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Sparkles, CheckCircle } from 'lucide-react';

interface BioSectionProps {
  bio: string;
  updateBio: (bio: string) => void;
}

const BioSection: React.FC<BioSectionProps> = ({ bio, updateBio }) => {
  const [focused, setFocused] = useState(false);
  const maxLength = 200;
  const suggestions = [
    "Creative designer passionate about user experiences and digital innovation",
    "Coffee enthusiast and weekend adventurer exploring Sri Lanka's hidden gems",
    "Tech lover building the future one line of code at a time",
    "Photography enthusiast capturing life's beautiful moments and stories"
  ];

  const handleSuggestionClick = (suggestion: string) => {
    updateBio(suggestion);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <User className="w-8 h-8 text-blue-700" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Tell us about yourself</h2>
        <p className="text-slate-600 text-base">Share a brief bio that represents who you are and what you're passionate about</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <motion.textarea
            whileFocus={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            value={bio}
            onChange={(e) => updateBio(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Write something about yourself..."
            maxLength={maxLength}
            rows={4}
            className={`w-full p-4 rounded-xl bg-white/30 border transition-all duration-300 text-slate-800 placeholder-slate-500 resize-none text-base leading-relaxed ${
              focused ? 'border-blue-400 bg-white/40' : 'border-slate-300/50'
            }`}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: bio.length > 0 ? 1 : 0 }}
            className="absolute top-3 right-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
          </motion.div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <motion.span
            animate={{ color: bio.length > maxLength * 0.8 ? '#d97706' : '#64748b' }}
            className="font-medium"
          >
            {bio.length}/{maxLength} characters
          </motion.span>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(bio.length / maxLength) * 100}%` }}
            className="h-2 bg-slate-200 rounded-full overflow-hidden ml-4 flex-1 max-w-[120px]"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              layout
            />
          </motion.div>
        </div>

        {bio.length === 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center text-slate-600 text-sm mb-3">
              <Sparkles className="w-4 h-4 mr-2" />
              Need inspiration? Try one of these examples:
            </div>
            <div className="grid gap-3">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-left p-4 rounded-lg bg-white/20 hover:bg-white/30 text-slate-700 text-sm transition-all duration-200 border border-slate-300/30 leading-relaxed"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default BioSection;