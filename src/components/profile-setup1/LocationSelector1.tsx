import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import { sriLankaCities } from '../../data/locations';

interface LocationSelectorProps {
  location: string;
  updateLocation: (location: string) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ location, updateLocation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState(sriLankaCities);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
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
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLocations(sriLankaCities);
    } else {
      const filtered = sriLankaCities.filter(city => 
        city.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  }, [searchTerm]);
  
  const handleLocationSelect = (city: string) => {
    updateLocation(city);
    setSearchTerm(city);
    setIsDropdownOpen(false);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4 mb-6">
        <div className="h-12 w-12 rounded-full bg-white text-navy flex items-center justify-center text-xl font-bold">
          3
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Where are you from?</h2>
          <p className="text-sky-100">Help connect with people from your area</p>
        </div>
      </div>
      
      <div className="space-y-2" ref={dropdownRef}>
        <label htmlFor="location" className="block text-white font-medium">
          Your Location
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-white/50" />
          </div>
          <input
            id="location"
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Search for your city in Sri Lanka"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/50 border border-white/20 focus:border-white focus:ring-2 focus:ring-white/20 outline-none transition-all duration-300"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Search className="h-5 w-5 text-white/50" />
          </div>
          
          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-navy/95 backdrop-blur-md border border-white/20 rounded-lg shadow-lg max-h-[800px] overflow-y-auto animate-dropdown">

              {filteredLocations.length === 0 ? (
                <div className="p-4 text-center text-white">
                  No locations found
                </div>
              ) : (
                filteredLocations.map((city, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors duration-200 text-white"
                    onClick={() => handleLocationSelect(city)}
                  >
                    {city}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      
      {location && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10 flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-white" />
          <p className="text-white">
            Selected location: <span className="font-medium">{location}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;