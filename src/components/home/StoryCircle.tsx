import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Story } from '../../types';
import Avatar from '../ui/Avatar';
import { PlusCircle } from 'lucide-react';

interface StoryCircleProps {
  story?: Story;
  isCreateStory?: boolean;
  onClick?: () => void;
}

const StoryCircle: React.FC<StoryCircleProps> = ({
  story,
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
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center transition-transform group-hover:scale-105">
            <PlusCircle className="w-8 h-8 text-navy-600" />
          </div>
        </div>
        <span className="text-xs text-gray-600 font-medium">New</span>
      </div>
    );
  }

  if (!story) return null;

  return (
    <div
      className="flex flex-col items-center cursor-pointer group"
      onClick={handleClick}
    >
      <div className="relative mb-1 p-0.5 rounded-full bg-gradient-to-tr from-navy-500 to-sky-400 transition-transform group-hover:scale-105">
        <Avatar
          src={story.profilePictureUrl || ''}
          alt={story.username}
          size="lg"
          border
        />
      </div>
      <span className="text-xs text-gray-600 font-medium truncate w-16 text-center">
        {story.username}
      </span>
    </div>
  );
};

export default StoryCircle;
