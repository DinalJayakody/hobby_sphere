import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Music, 
  Camera, 
  BookOpen, 
  Gamepad2, 
  Dumbbell, 
  Plane, 
  Code, 
  Coffee, 
  Mountain,
  Guitar,
  ChefHat,
  Plus,
  X,
  CheckCircle
} from 'lucide-react';

interface HobbySelectorProps {
  hobby: string;
  customHobby: string;
  updateHobby: (hobby: string) => void;
  updateCustomHobby: (customHobby: string) => void;
}

const HobbySelector: React.FC<HobbySelectorProps> = ({ 
  hobby, 
  customHobby, 
  updateHobby, 
  updateCustomHobby 
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customHobbyInput, setCustomHobbyInput] = useState('');

  const hobbies = [
    { name: 'Art & Design', icon: Palette, color: 'from-purple-400 to-pink-400' },
    { name: 'Music', icon: Music, color: 'from-blue-400 to-purple-400' },
    { name: 'Photography', icon: Camera, color: 'from-green-400 to-blue-400' },
    { name: 'Reading', icon: BookOpen, color: 'from-orange-400 to-red-400' },
    { name: 'Gaming', icon: Gamepad2, color: 'from-red-400 to-purple-400' },
    { name: 'Fitness', icon: Dumbbell, color: 'from-green-400 to-teal-400' },
    { name: 'Travel', icon: Plane, color: 'from-blue-400 to-cyan-400' },
    { name: 'Coding', icon: Code, color: 'from-gray-400 to-blue-400' },
    { name: 'Coffee', icon: Coffee, color: 'from-yellow-600 to-orange-500' },
    { name: 'Hiking', icon: Mountain, color: 'from-green-500 to-emerald-500' },
    { name: 'Guitar', icon: Guitar, color: 'from-amber-400 to-orange-400' },
    { name: 'Cooking', icon: ChefHat, color: 'from-red-400 to-pink-400' },
  ];

  const handleHobbySelect = (hobbyName: string) => {
    updateHobby(hobbyName);
    setShowCustomInput(false);
    setCustomHobbyInput('');
  };

  const handleCustomHobby = () => {
    if (customHobbyInput.trim()) {
      updateCustomHobby(customHobbyInput.trim());
      updateHobby('Custom');
      setShowCustomInput(false);
      setCustomHobbyInput('');
    }
  };

  const selectedHobby = hobby === 'Custom' ? customHobby : hobby;

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
          <Palette className="w-8 h-8 text-blue-700" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">What's your main hobby?</h2>
        <p className="text-slate-600 text-base">Choose what you're most passionate about or add your own</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {hobbies.map((hobbyItem, index) => {
          const IconComponent = hobbyItem.icon;
          const isSelected = hobby === hobbyItem.name;
          
          return (
            <motion.button
              key={hobbyItem.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleHobbySelect(hobbyItem.name)}
              className={`relative p-4 rounded-xl transition-all duration-300 ${
                isSelected 
                  ? 'bg-white/50 border-2 border-blue-500 shadow-lg' 
                  : 'bg-white/30 border border-slate-300/50 hover:bg-white/40'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${hobbyItem.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <p className="text-slate-800 font-medium text-sm">{hobbyItem.name}</p>
              
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-3 h-3 bg-white rounded-full"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: hobbies.length * 0.1 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCustomInput(true)}
          className={`p-4 rounded-xl border border-dashed transition-all duration-300 flex flex-col items-center justify-center min-h-[100px] ${
            hobby === 'Custom' 
              ? 'bg-white/50 border-blue-500 shadow-lg' 
              : 'bg-white/30 border-slate-400 hover:bg-white/40'
          }`}
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center mx-auto mb-3">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <p className="text-slate-800 font-medium text-sm">Add Custom</p>
          
          {hobby === 'Custom' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <motion.div className="w-3 h-3 bg-white rounded-full" />
            </motion.div>
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {showCustomInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/30 rounded-xl p-6 border border-slate-300/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-800 font-medium text-base">Add Your Custom Hobby</h3>
              <button
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomHobbyInput('');
                }}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter your hobby (e.g., Pottery, Surfing, Astronomy)..."
                value={customHobbyInput}
                onChange={(e) => setCustomHobbyInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomHobby()}
                className="w-full p-3 bg-white/30 border border-slate-300/50 rounded-lg text-slate-800 placeholder-slate-500 focus:border-blue-400 focus:outline-none"
                autoFocus
              />
              
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCustomHobby}
                  disabled={!customHobbyInput.trim()}
                  className="flex-1 p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:opacity-50 text-white rounded-lg font-medium transition-all duration-200"
                >
                  Add Hobby
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomHobbyInput('');
                  }}
                  className="flex-1 p-3 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded-lg font-medium transition-all duration-200"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedHobby && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center p-4 bg-green-100 rounded-lg border border-green-300"
        >
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-700 font-medium">Selected: {selectedHobby}</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HobbySelector;