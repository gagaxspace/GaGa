import { useState } from 'react';
import { Search, Edit, X, Users, Plus, MessageCircle } from 'lucide-react';
import ChatListItem from '@/components/features/ChatListItem';
import StoryCircle from '@/components/features/StoryCircle';
import type { Chat } from '@/types';
import { MOCK_USERS } from '@/constants/mockData';
import { cn } from '@/lib/utils';
import logoSrc from '@/assets/logo.png';

interface ChatsPageProps {
  chats: any[];
  onChatSelect: (chat: any) => void;
  onPin: (chatId: string) => void;
  onMute: (chatId: string) => void;
  onDelete: (chatId: string) => void;
  onCreateGroup: (name: string, participants: string[]) => void;
}

const ChatsPage = ({ chats, onChatSelect, onPin, onMute, onDelete, onCreateGroup }: ChatsPageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const sortedChats = [...chats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const aTime = a.lastMessage?.timestamp?.getTime() || 0;
    const bTime = b.lastMessage?.timestamp?.getTime() || 0;
    return bTime - aTime;
  });

  const filteredChats = sortedChats.filter(chat => {
    if (!searchQuery) return true;
    const name = chat.type === 'group' ? chat.name : '';
    const q = searchQuery.toLowerCase();
    return name?.toLowerCase().includes(q) || chat.lastMessage?.content?.toLowerCase().includes(q);
  });

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedParticipants.length === 0) return;
    onCreateGroup(groupName.trim(), selectedParticipants);
    setShowNewGroup(false);
    setGroupName('');
    setSelectedParticipants([]);
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Dark Header */}
      <div className="px-5 pt-12 pb-3 flex items-center justify-between bg-black">
        <div className="flex items-center gap-2">
          <img src={logoSrc} alt="GaGa Chat" className="w-8 h-8 rounded-full gchat-logo-glow" />
          <h1 className="text-white text-xl font-bold">GaGa Chat</h1>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowSearch(s => !s)} className="p-2 text-white/60 hover:text-white transition-colors">
            <Search size={20} />
          </button>
          <button onClick={() => setShowNewGroup(true)} className="p-2 text-white/60 hover:text-white transition-colors">
            <Edit size={20} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 pb-3 animate-slide-in">
          <div className="flex items-center bg-white/10 rounded-xl px-3 py-2.5 gap-2">
            <Search size={15} className="text-white/40 flex-shrink-0" />
            <input
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="flex-1 bg-transparent text-[14px] text-white placeholder-white/30 outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X size={14} className="text-white/40" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stories */}
      {!showSearch && (
        <StoryCircle
          onViewStory={(id) => console.log('View story', id)}
          onAddStory={() => console.log('Add story')}
        />
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide bg-black">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-white/30">
            <MessageCircle size={40} className="opacity-30 mb-2" />
            <p className="text-sm mt-2">No chats found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredChats.map(chat => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                onClick={() => onChatSelect(chat)}
                onPin={() => onPin(chat.id)}
                onMute={() => onMute(chat.id)}
                onDelete={() => onDelete(chat.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* New Group Modal */}
      {showNewGroup && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end animate-fade-in" onClick={e => { if (e.target === e.currentTarget) setShowNewGroup(false); }}>
          <div className="bg-[#1a1a1a] border-t border-white/10 rounded-t-3xl w-full max-h-[85vh] flex flex-col animate-slide-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">New Group</h2>
              <button onClick={() => setShowNewGroup(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="px-5 py-4 border-b border-white/10">
              <input
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="Group name"
                className="w-full text-sm bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 outline-none focus:border-line-green transition-colors placeholder-white/30"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              <p className="px-5 py-2 text-xs text-white/40 font-medium">SELECT MEMBERS</p>
              {MOCK_USERS.map(user => (
                <div
                  key={user.id}
                  onClick={() => setSelectedParticipants(prev =>
                    prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id]
                  )}
                  className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-white/40">{user.statusMessage}</p>
                  </div>
                  <div className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                    selectedParticipants.includes(user.id)
                      ? 'bg-[#00FF00] border-[#00FF00]'
                      : 'border-gray-300'
                  )}>
                    {selectedParticipants.includes(user.id) && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-white/10">
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedParticipants.length === 0}
                className="w-full gchat-btn py-3.5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
              >
                Create Group ({selectedParticipants.length} selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatsPage;
