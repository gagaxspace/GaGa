import { useState } from 'react';
import { Search, X, Star, UserPlus, MessageCircle, Phone, ChevronRight, Users, QrCode, Plus } from 'lucide-react';
import { MOCK_USERS, CURRENT_USER } from '@/constants/mockData';
import type { User } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import QRScannerPage from '@/pages/QRScannerPage';

interface ContactsPageProps {
  onStartChat: (userId: string) => void;
}

type SubView = null | 'addFriends' | 'qrScanner';

// ──────────────────────────────────────────────
// Add Friends Sub-page
// ──────────────────────────────────────────────
const AddFriendsPage = ({
  onBack,
  onShowQR,
}: {
  onBack: () => void;
  onShowQR: () => void;
}) => (
  <div className="flex flex-col h-full bg-black">
    {/* Header */}
    <div className="px-4 pt-12 pb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-white p-1">
          <ChevronRight size={22} className="rotate-180" />
        </button>
        <h1 className="text-white text-xl font-bold">Add friends</h1>
      </div>
      <button className="p-2 text-white/50 hover:text-white transition-colors" onClick={onShowQR}>
        <Search size={20} />
      </button>
    </div>

    {/* Top Actions */}
    <div className="flex justify-around px-6 py-4 border-b border-white/10">
      {[
        { icon: <Plus size={26} className="text-white" />, label: 'Invite', action: () => toast.info('Invite via link coming soon!') },
        { icon: <QrCode size={26} className="text-white" />, label: 'My QR code', action: onShowQR },
        { icon: <Search size={26} className="text-white" />, label: 'Search', action: onShowQR },
      ].map(item => (
        <button
          key={item.label}
          onClick={item.action}
          className="flex flex-col items-center gap-2 hover:opacity-70 transition-opacity"
        >
          {item.icon}
          <span className="text-white/60 text-[13px]">{item.label}</span>
        </button>
      ))}
    </div>

    {/* Quick Actions */}
    <div className="divide-y divide-white/10">
      <button
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors"
        onClick={() => toast.info('Auto-add: Enable in Settings → Friends')}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 gchat-btn">
          <UserPlus size={22} className="text-black" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-white text-[15px] font-medium">Auto-add friends</p>
          <p className="text-white/40 text-[13px] mt-0.5">Auto-add contacts as friends.</p>
        </div>
        <span className="text-[13px] font-semibold text-white border border-white/30 px-4 py-1.5 rounded-full">
          Allow
        </span>
      </button>

      <button
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors"
        onClick={() => toast.info('Create group — use the Chats tab!')}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 gchat-btn">
          <Users size={22} className="text-black" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-white text-[15px] font-medium">Create a group</p>
          <p className="text-white/40 text-[13px] mt-0.5">Gather your friends in a group chat.</p>
        </div>
      </button>
    </div>

    {/* CTA */}
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
      <h3 className="text-white text-[18px] font-bold">Try inviting a friend today!</h3>
      <p className="text-white/40 text-[14px]">Invite your friends via email or text message.</p>
      <button
        onClick={() => toast.info('Invite coming soon!')}
        className="border border-white/30 text-white font-semibold px-8 py-2.5 rounded-lg hover:bg-white/10 transition-colors"
      >
        Invite a friend
      </button>
    </div>
  </div>
);

// ──────────────────────────────────────────────
// User Row
// ──────────────────────────────────────────────
const UserRow = ({
  user, statusColors, onClick, onChat,
}: {
  user: User;
  statusColors: Record<string, string>;
  onClick: () => void;
  onChat: () => void;
}) => (
  <div
    className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5"
    onClick={onClick}
  >
    <div className="relative flex-shrink-0">
      <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
      <div className={cn('absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-black', statusColors[user.status])} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1">
        <p className="font-medium text-[15px] text-white truncate">{user.name}</p>
        {user.isFavorite && <span className="text-amber-400 text-xs">⭐</span>}
      </div>
      <p className="text-[13px] text-white/40 truncate">{user.statusMessage}</p>
    </div>
    <button
      onClick={e => { e.stopPropagation(); onChat(); }}
      className="p-2 text-white/30 hover:text-white/60 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
    >
      <MessageCircle size={18} />
    </button>
  </div>
);

// ──────────────────────────────────────────────
// Main ContactsPage
// ──────────────────────────────────────────────
const ContactsPage = ({ onStartChat }: ContactsPageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'online'>('all');
  const [subView, setSubView] = useState<SubView>(null);

  if (subView === 'qrScanner') {
    return (
      <QRScannerPage
        onBack={() => setSubView('addFriends')}
        onAddFriend={(userId) => { onStartChat(userId); setSubView(null); }}
      />
    );
  }

  if (subView === 'addFriends') {
    return (
      <AddFriendsPage
        onBack={() => setSubView(null)}
        onShowQR={() => setSubView('qrScanner')}
      />
    );
  }

  const filtered = MOCK_USERS.filter(u => {
    const matchesSearch = !searchQuery
      || u.name.toLowerCase().includes(searchQuery.toLowerCase())
      || u.statusMessage.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'favorites') return matchesSearch && u.isFavorite;
    if (activeFilter === 'online') return matchesSearch && u.status === 'online';
    return matchesSearch;
  });

  const favorites = filtered.filter(u => u.isFavorite);
  const others = filtered.filter(u => !u.isFavorite);

  const groupedByLetter: Record<string, User[]> = {};
  others.forEach(user => {
    const letter = user.name[0].toUpperCase();
    if (!groupedByLetter[letter]) groupedByLetter[letter] = [];
    groupedByLetter[letter].push(user);
  });

  const statusColors: Record<string, string> = {
    online: 'bg-emerald-400',
    busy: 'bg-amber-400',
    offline: 'bg-gray-500',
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <div className="px-5 pt-12 pb-3 flex items-center justify-between">
        <h1 className="text-white text-xl font-bold">Friends</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSearch(s => !s)}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <Search size={20} />
          </button>
          <button
            onClick={() => setSubView('addFriends')}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <UserPlus size={20} />
          </button>
        </div>
      </div>

      {/* Search */}
      {showSearch && (
        <div className="px-4 pb-3 animate-slide-in">
          <div className="flex items-center bg-white/10 rounded-xl px-3 py-2.5 gap-2">
            <Search size={15} className="text-white/40 flex-shrink-0" />
            <input
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search friends..."
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

      {/* Filter Tabs */}
      <div className="flex px-5 gap-1 pb-2">
        {([
          { id: 'all', label: 'All' },
          { id: 'favorites', label: '⭐ Favorites' },
          { id: 'online', label: '🟢 Online' },
        ] as const).map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
              activeFilter === f.id
                ? 'bg-white/15 text-white'
                : 'text-white/40 hover:text-white/60'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* My Profile */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10">
        <div className="relative">
          <img src={CURRENT_USER.avatar} alt="Me" className="w-12 h-12 rounded-full object-cover" />
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-black" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-[15px]">
            {CURRENT_USER.name}{' '}
            <span className="text-white/40 font-normal text-[13px]">(You)</span>
          </p>
          <p className="text-[13px] text-white/40 truncate italic">{CURRENT_USER.statusMessage}</p>
        </div>
        <button
          className="text-white/30 hover:text-white/60 transition-colors"
          onClick={() => toast.info('Edit profile coming soon!')}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Favorites */}
        {favorites.length > 0 && (
          <div>
            <div className="flex items-center gap-2 px-5 py-2">
              <Star size={11} className="text-white/30 fill-white/30" />
              <span className="text-[12px] text-white/30 font-medium">FAVORITES</span>
            </div>
            {favorites.map(user => (
              <UserRow
                key={user.id}
                user={user}
                statusColors={statusColors}
                onClick={() => setSelectedUser(user)}
                onChat={() => onStartChat(user.id)}
              />
            ))}
          </div>
        )}

        {/* Alphabetical */}
        {Object.keys(groupedByLetter).sort().map(letter => (
          <div key={letter}>
            <div className="px-5 py-1.5">
              <span className="text-[12px] text-white/30 font-bold">{letter}</span>
            </div>
            {groupedByLetter[letter].map(user => (
              <UserRow
                key={user.id}
                user={user}
                statusColors={statusColors}
                onClick={() => setSelectedUser(user)}
                onChat={() => onStartChat(user.id)}
              />
            ))}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-white/30">
            <Search size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No friends found</p>
          </div>
        )}

        <div className="h-6" />
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-end animate-fade-in"
          onClick={e => { if (e.target === e.currentTarget) setSelectedUser(null); }}
        >
          <div className="bg-[#1a1a1a] border-t border-white/10 rounded-t-3xl w-full animate-slide-in pb-8">
            {/* Cover — gradient */}
            <div
              className="h-28 relative rounded-t-3xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #00CC00 0%, #00FF00 55%, #ADFF2F 100%)' }}
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/30 rounded-full text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Avatar */}
            <div className="flex justify-center -mt-10 relative z-10 mb-3">
              <div className="relative">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-20 h-20 rounded-full border-4 border-[#1a1a1a] shadow-lg object-cover"
                />
                <div className={cn(
                  'absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#1a1a1a]',
                  statusColors[selectedUser.status]
                )} />
              </div>
            </div>

            <div className="text-center px-6 pb-4">
              <h3 className="text-xl font-bold text-white">{selectedUser.name}</h3>
              {selectedUser.isFavorite && <span className="text-amber-400 text-sm">⭐ Favorite</span>}
              <p className="text-sm text-white/40 mt-1 italic">"{selectedUser.statusMessage}"</p>
              <span className={cn(
                'inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-medium capitalize',
                selectedUser.status === 'online' ? 'bg-emerald-500/15 text-emerald-400'
                  : selectedUser.status === 'busy' ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-white/10 text-white/40'
              )}>
                {selectedUser.status}
              </span>
            </div>

            <div className="flex gap-3 px-6">
              <button
                onClick={() => { onStartChat(selectedUser.id); setSelectedUser(null); }}
                className="flex-1 flex items-center justify-center gap-2 gchat-btn py-3 rounded-2xl hover:opacity-90 transition-opacity"
              >
                <MessageCircle size={18} />
                <span className="font-semibold">Chat</span>
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white font-semibold py-3 rounded-2xl hover:bg-white/15 transition-colors"
                onClick={() => toast.info('Voice calls coming soon!')}
              >
                <Phone size={18} />
                Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
