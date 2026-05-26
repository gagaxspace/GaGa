import { Plus } from 'lucide-react';
import { CURRENT_USER, MOCK_USERS } from '@/constants/mockData';

interface StoryCircleProps {
  onViewStory?: (userId: string) => void;
  onAddStory?: () => void;
}

const StoryCircle = ({ onViewStory, onAddStory }: StoryCircleProps) => {
  const usersWithStories = MOCK_USERS.slice(0, 6);

  return (
    <div className="flex gap-3 px-4 py-3 overflow-x-auto scrollbar-hide bg-black border-b border-white/10">
      {/* My Story */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0" onClick={onAddStory}>
        <div className="relative cursor-pointer">
          <img
            src={CURRENT_USER.avatar}
            alt="My Story"
            className="w-14 h-14 rounded-full object-cover border-2 border-white/20"
          />
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#00FF00] rounded-full flex items-center justify-center border-2 border-black">
            <Plus size={12} className="text-white" strokeWidth={3} />
          </div>
        </div>
        <span className="text-[10px] text-white/50 font-medium truncate w-14 text-center">My Story</span>
      </div>

      {/* Friends' Stories */}
      {usersWithStories.map(user => (
        <div
          key={user.id}
          className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer"
          onClick={() => onViewStory?.(user.id)}
        >
          <div className="story-ring">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-black"
            />
          </div>
          <span className="text-[10px] text-white/50 font-medium truncate w-14 text-center">
            {user.name.split(' ')[0]}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StoryCircle;
