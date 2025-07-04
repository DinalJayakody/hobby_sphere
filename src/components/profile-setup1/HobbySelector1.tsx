import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Heart } from 'lucide-react';
import { hobbies } from '../../data/hobbies';

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
  updateCustomHobby,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const isOtherSelected = hobby === 'Other';
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleHobbySelect = (selectedHobby: string) => {
    updateHobby(selectedHobby);
    
    // If the selection is not "Other", clear the custom hobby
    if (selectedHobby !== 'Other') {
      updateCustomHobby('');
    }
    
    setIsDropdownOpen(false);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4 mb-6">
        <div className="h-12 w-12 rounded-full bg-white text-navy flex items-center justify-center text-xl font-bold">
          4
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">What's your favorite hobby?</h2>
          <p className="text-sky-100">Find people with similar interests</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="hobby" className="block text-white font-medium">
          Select a Hobby
        </label>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm text-white border border-white/20 focus:border-white focus:ring-2 focus:ring-white/20 outline-none transition-all duration-300"
          >
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-pink-300" />
              <span>{hobby || 'Select your favorite hobby'}</span>
            </div>
            <ChevronDown className={`h-5 w-5 text-white/70 transition-transform duration-300 ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-navy/95 backdrop-blur-md border border-white/20 rounded-lg shadow-lg max-h-60 overflow-auto animate-dropdown">
              {hobbies.map((item, index) => (
                <div
                  key={index}
                  className={`px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors duration-200 text-white ${hobby === item ? 'bg-white/20' : ''}`}
                  onClick={() => handleHobbySelect(item)}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {isOtherSelected && (
        <div className="space-y-2 animate-fade-in">
          <label htmlFor="customHobby" className="block text-white font-medium">
            Tell us about your hobby
          </label>
          <input
            id="customHobby"
            type="text"
            value={customHobby}
            onChange={(e) => updateCustomHobby(e.target.value)}
            placeholder="What's your favorite hobby?"
            className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/50 border border-white/20 focus:border-white focus:ring-2 focus:ring-white/20 outline-none transition-all duration-300"
          />
        </div>
      )}
      
      {hobby && hobby !== 'Other' && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10 flex items-center space-x-2">
          <Heart className="h-5 w-5 text-pink-300" />
          <p className="text-white">
            Great choice! <span className="font-medium">{hobby}</span> is a popular hobby among our users.
          </p>
        </div>
      )}
      
      {isOtherSelected && customHobby && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10 flex items-center space-x-2">
          <Heart className="h-5 w-5 text-pink-300" />
          <p className="text-white">
            <span className="font-medium">{customHobby}</span> sounds interesting! You might be the trendsetter.
          </p>
        </div>
      )}
    </div>
  );
};

export default HobbySelector;