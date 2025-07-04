import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Search, 
  Heart,
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
  Film,
  Brush,
  Bike,
  TreePine,
  Waves,
  Star,
  CheckCircle
} from 'lucide-react';

interface HobbyDropdownProps {
  selectedHobby: string;
  onHobbySelect: (hobby: string) => void;
}

const HobbyDropdown: React.FC<HobbyDropdownProps> = ({ selectedHobby, onHobbySelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const hobbies = [
    { name: 'Art & Design', icon: Palette, category: 'Creative', color: 'from-purple-400 to-pink-400' },
    { name: 'Music Production', icon: Music, category: 'Creative', color: 'from-blue-400 to-purple-400' },
    { name: 'Photography', icon: Camera, category: 'Creative', color: 'from-green-400 to-blue-400' },
    { name: 'Digital Art', icon: Brush, category: 'Creative', color: 'from-pink-400 to-red-400' },
    { name: 'Film Making', icon: Film, category: 'Creative', color: 'from-indigo-400 to-purple-400' },
    
    { name: 'Reading', icon: BookOpen, category: 'Learning', color: 'from-orange-400 to-red-400' },
    { name: 'Programming', icon: Code, category: 'Learning', color: 'from-gray-400 to-blue-400' },
    { name: 'Language Learning', icon: Star, category: 'Learning', color: 'from-yellow-400 to-orange-400' },
    
    { name: 'Gaming', icon: Gamepad2, category: 'Entertainment', color: 'from-red-400 to-purple-400' },
    { name: 'Streaming', icon: Film, category: 'Entertainment', color: 'from-purple-400 to-pink-400' },
    
    { name: 'Fitness', icon: Dumbbell, category: 'Sports', color: 'from-green-400 to-teal-400' },
    { name: 'Cycling', icon: Bike, category: 'Sports', color: 'from-blue-400 to-green-400' },
    { name: 'Swimming', icon: Waves, category: 'Sports', color: 'from-cyan-400 to-blue-400' },
    { name: 'Hiking', icon: Mountain, category: 'Sports', color: 'from-green-500 to-emerald-500' },
    
    { name: 'Travel', icon: Plane, category: 'Adventure', color: 'from-blue-400 to-cyan-400' },
    { name: 'Nature Photography', icon: TreePine, category: 'Adventure', color: 'from-green-400 to-teal-400' },
    
    { name: 'Cooking', icon: ChefHat, category: 'Lifestyle', color: 'from-red-400 to-pink-400' },
    { name: 'Coffee Brewing', icon: Coffee, category: 'Lifestyle', color: 'from-yellow-600 to-orange-500' },
    { name: 'Guitar Playing', icon: Guitar, category: 'Lifestyle', color: 'from-amber-400 to-orange-400' },
  ];

  const filteredHobbies = hobbies.filter(hobby =>
    hobby.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hobby.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedHobbies = filteredHobbies.reduce((acc, hobby) => {
    if (!acc[hobby.category]) {
      acc[hobby.category] = [];
    }
    acc[hobby.category].push(hobby);
    return acc;
  }, {} as Record<string, typeof hobbies>);

  const handleHobbySelect = (hobbyName: string) => {
    onHobbySelect(hobbyName);
    setIsOpen(false);
    setSearchTerm('');
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
          className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Heart className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Choose your primary hobby</h2>
        <p className="text-sky-100 text-base">Select from our curated list of popular hobbies and interests</p>
      </div>

      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full p-4 bg-white/10 border rounded-xl text-white text-left flex items-center justify-between hover:bg-white/15 transition-all duration-200 ${
            selectedHobby ? 'border-green-400/50' : 'border-white/20'
          }`}
        >
          <div className="flex items-center">
            <Heart className="w-5 h-5 mr-3 text-sky-300" />
            <span className={selectedHobby ? 'text-white font-medium' : 'text-sky-200'}>
              {selectedHobby || 'Select your primary hobby'}
            </span>
          </div>
          <div className="flex items-center">
            {selectedHobby && <CheckCircle className="w-5 h-5 text-green-400 mr-2" />}
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-sky-300" />
            </motion.div>
          </div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg z-10 max-h-96 overflow-hidden"
            >
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sky-300" />
                  <input
                    type="text"
                    placeholder="Search hobbies and interests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-sky-200 focus:border-white/40 focus:outline-none"
                  />
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {Object.entries(groupedHobbies).map(([category, categoryHobbies]) => (
                  <div key={category} className="p-2">
                    <div className="px-3 py-2 text-sky-300 text-sm font-medium uppercase tracking-wide">
                      {category}
                    </div>
                    {categoryHobbies.map((hobby, index) => {
                      const IconComponent = hobby.icon;
                      return (
                        <motion.button
                          key={hobby.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', x: 5 }}
                          onClick={() => handleHobbySelect(hobby.name)}
                          className="w-full p-3 text-left hover:bg-white/10 transition-all duration-150 flex items-center rounded-lg mx-2 my-1"
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${hobby.color} flex items-center justify-center mr-3 shadow-sm`}>
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium text-base">{hobby.name}</div>
                          </div>
                          {selectedHobby === hobby.name && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                            >
                              <motion.div className="w-2 h-2 bg-white rounded-full" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                ))}

                {filteredHobbies.length === 0 && searchTerm && (
                  <div className="p-6 text-center text-sky-200">
                    <p className="text-base mb-2">No hobbies found matching "{searchTerm}"</p>
                    <p className="text-sm text-sky-300">Try searching for a different hobby or category</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedHobby && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center p-4 bg-green-500/10 rounded-lg border border-green-500/20"
        >
          <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
          <span className="text-green-300 font-medium">Selected: {selectedHobby}</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HobbyDropdown;