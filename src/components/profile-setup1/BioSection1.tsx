import React, { useState } from 'react';

interface BioSectionProps {
  bio: string;
  updateBio: (bio: string) => void;
}

const BioSection: React.FC<BioSectionProps> = ({ bio, updateBio }) => {
  const maxLength = 200;
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      updateBio(value);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4 mb-6">
        <div className="h-12 w-12 rounded-full bg-white text-navy flex items-center justify-center text-xl font-bold">
          1
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Tell us about yourself</h2>
          <p className="text-sky-100">Your bio helps others get to know you better</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="bio" className="block text-white font-medium">
          Your Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={handleChange}
          placeholder="Share a little about yourself, your interests, and what brings you here..."
          className="w-full h-32 px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/50 border border-white/20 focus:border-white focus:ring-2 focus:ring-white/20 outline-none transition-all duration-300 resize-none"
        />
        <div className="flex justify-end">
          <span className={`text-sm ${bio.length > maxLength * 0.8 ? 'text-orange-300' : 'text-sky-100'}`}>
            {bio.length}/{maxLength}
          </span>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
        <p className="text-sky-100 text-sm">
          <span className="font-medium text-white">Tip:</span> A great bio is concise, authentic, and gives others a glimpse of your personality.
        </p>
      </div>
    </div>
  );
};

export default BioSection;