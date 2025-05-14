import React from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import StoryCircle from './StoryCircle';

const Stories: React.FC = () => {
  const { stories } = useData();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
        <StoryCircle
          isCreateStory
        />
        
        {stories.map(story => (
          <StoryCircle
            key={story.id}
            story={story}
          />
        ))}
      </div>
    </div>
  );
};

export default Stories;