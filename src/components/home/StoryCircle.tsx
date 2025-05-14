import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Story } from '../../types';
import Avatar from '../ui/Avatar';
import { PlusCircle } from 'lucide-react';

interface StoryCircleProps {
  story?: Story;
  user?: {
    id: string;
    username: string;
    profilePicture: string;
  };
  isCreateStory?: boolean;
  onClick?: () => void;
}

const StoryCircle: React.FC<StoryCircleProps> = ({ 
  story, 
  user, 
  isCreateStory = false,
  onClick 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (story) {
      navigate(`/stories/${story.id}`);
    } else if (isCreateStory) {
      navigate('/create-story');
    }
  };

  if (isCreateStory) {
    return (
      <div 
        className="flex flex-col items-center cursor-pointer group"
        onClick={handleClick}
      >
        <div className="relative mb-1">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <PlusCircle className="w-8 h-8 text-navy-600" />
          </div>
        </div>
        <span className="text-xs text-gray-600 font-medium">New</span>
      </div>
    );
  }

  if (!story && !user) return null;

  const displayUser = story?.user || user;
  if (!displayUser) return null;

  return (
    <div 
      className="flex flex-col items-center cursor-pointer group"
      onClick={handleClick}
    >
      <div 
        className={`relative mb-1 p-0.5 rounded-full ${
          story && !story.viewed
            ? 'bg-gradient-to-tr from-navy-500 to-sky-400'
            : 'bg-gray-200'
        }`}
      >
        <Avatar
          src={displayUser.profilePicture}
          alt={displayUser.username}
          size="lg"
          border
        />
      </div>
      <span className="text-xs text-gray-600 font-medium truncate w-16 text-center">
        {displayUser.username}
      </span>
    </div>
  );
};

export default StoryCircle;