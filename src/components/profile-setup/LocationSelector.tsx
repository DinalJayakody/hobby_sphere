import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, Search, MapPinIcon, CheckCircle } from 'lucide-react';

interface LocationSelectorProps {
  location: string;
  updateLocation: (location: string) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ location, updateLocation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const sriLankanCities = [
    { name: 'Colombo', province: 'Western Province', emoji: '🏙️' },
    { name: 'Kandy', province: 'Central Province', emoji: '🏛️' },
    { name: 'Galle', province: 'Southern Province', emoji: '🏰' },
    { name: 'Jaffna', province: 'Northern Province', emoji: '🕌' },
    { name: 'Negombo', province: 'Western Province', emoji: '🏖️' },
    { name: 'Anuradhapura', province: 'North Central Province', emoji: '🏺' },
    { name: 'Polonnaruwa', province: 'North Central Province', emoji: '⛩️' },
    { name: 'Trincomalee', province: 'Eastern Province', emoji: '⚓' },
    { name: 'Batticaloa', province: 'Eastern Province', emoji: '🌊' },
    { name: 'Matara', province: 'Southern Province', emoji: '🌴' },
    { name: 'Ratnapura', province: 'Sabaragamuwa Province', emoji: '💎' },
    { name: 'Badulla', province: 'Uva Province', emoji: '🏔️' },
    { name: 'Kurunegala', province: 'North Western Province', emoji: '🌾' },
    { name: 'Puttalam', province: 'North Western Province', emoji: '🐟' },
    { name: 'Kalmunai', province: 'Eastern Province', emoji: '🏘️' },
    { name: 'Vavuniya', province: 'Northern Province', emoji: '🚂' },
    { name: 'Gampaha', province: 'Western Province', emoji: '🏡' },
    { name: 'Kalutara', province: 'Western Province', emoji: '🥥' },
    { name: 'Hambantota', province: 'Southern Province', emoji: '🦎' },
    { name: 'Nuwara Eliya', province: 'Central Province', emoji: '🍃' },
    { name: 'Ella', province: 'Uva Province', emoji: '🌄' },
    { name: 'Sigiriya', province: 'Central Province', emoji: '🗿' },
    { name: 'Dambulla', province: 'Central Province', emoji: '🕳️' },
    { name: 'Hikkaduwa', province: 'Southern Province', emoji: '🏄' },
    { name: 'Mirissa', province: 'Southern Province', emoji: '🐋' },
  ];

  const filteredCities = sriLankanCities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.province.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCitySelect = (cityName: string) => {
    updateLocation(cityName);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCustomLocation = () => {
    if (customLocation.trim()) {
      updateLocation(customLocation.trim());
      setShowCustomInput(false);
      setCustomLocation('');
      setIsOpen(false);
    }
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
          <MapPin className="w-8 h-8 text-blue-700" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Where are you located?</h2>
        <p className="text-slate-600 text-base">Select your city in Sri Lanka to connect with nearby people</p>
      </div>

      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full p-4 bg-white/30 border rounded-xl text-slate-800 text-left flex items-center justify-between hover:bg-white/40 transition-all duration-200 ${
            location ? 'border-green-500' : 'border-slate-300/50'
          }`}
        >
          <div className="flex items-center">
            <MapPinIcon className="w-5 h-5 mr-3 text-blue-600" />
            <span className={location ? 'text-slate-800 font-medium' : 'text-slate-500'}>
              {location || 'Select your city in Sri Lanka'}
            </span>
          </div>
          <div className="flex items-center">
            {location && <CheckCircle className="w-5 h-5 text-green-600 mr-2" />}
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-blue-600" />
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
              className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-sm border border-slate-300/50 rounded-xl shadow-lg z-10 max-h-96 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-300/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600" />
                  <input
                    type="text"
                    placeholder="Search Sri Lankan cities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/50 border border-slate-300/50 rounded-lg text-slate-800 placeholder-slate-500 focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {filteredCities.map((city, index) => (
                  <motion.button
                    key={city.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', x: 5 }}
                    onClick={() => handleCitySelect(city.name)}
                    className="w-full p-4 text-left hover:bg-blue-50 transition-all duration-150 flex items-center border-b border-slate-200/50 last:border-b-0"
                  >
                    <span className="text-2xl mr-4 flex-shrink-0">{city.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-800 font-medium text-base">{city.name}</div>
                      <div className="text-slate-600 text-sm">{city.province}</div>
                    </div>
                    {location === city.name && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center ml-3"
                      >
                        <motion.div className="w-2 h-2 bg-white rounded-full" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}

                {filteredCities.length === 0 && searchTerm && (
                  <div className="p-6 text-center text-slate-600">
                    <p className="text-base mb-2">No cities found matching "{searchTerm}"</p>
                    <p className="text-sm text-slate-500">Try searching for a different city or province name</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-300/30 bg-white/50">
                {!showCustomInput ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCustomInput(true)}
                    className="w-full p-3 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200 border border-dashed border-blue-400 rounded-lg hover:border-blue-500"
                  >
                    + Add custom location
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3"
                  >
                    <input
                      type="text"
                      placeholder="Enter your location"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomLocation()}
                      className="w-full p-3 bg-white/50 border border-slate-300/50 rounded-lg text-slate-800 placeholder-slate-500 focus:border-blue-400 focus:outline-none text-sm"
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCustomLocation}
                        disabled={!customLocation.trim()}
                        className="flex-1 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        Add Location
                      </button>
                      <button
                        onClick={() => {
                          setShowCustomInput(false);
                          setCustomLocation('');
                        }}
                        className="flex-1 p-2 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {location && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center p-4 bg-green-100 rounded-lg border border-green-300"
        >
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-700 font-medium">Selected: {location}</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LocationSelector;