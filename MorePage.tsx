import { useState } from 'react';
import {
  ChevronRight, Bell, Image, MessageSquare, Phone, BookImage, Users, Globe,
  Bot, FlaskConical, Shield, Lock, Database, QrCode, ArrowRightLeft, Smile,
  Palette, Coins, UserCircle, Search, X, Settings, LogOut
} from 'lucide-react';
import { CURRENT_USER } from '@/constants/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import logoSrc from '@/assets/logo.png';
import { useAuth } from '@/hooks/useAuth';

interface SettingsSubPageProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

const SettingsSubPage = ({ title, onBack, children }: SettingsSubPageProps) => (
  <div className="flex flex-col h-full bg-black">
    <div className="px-4 pt-12 pb-4 flex items-center gap-3">
      <button onClick={onBack} className="text-white p-1">
        <ChevronRight size={22} className="rotate-180 text-white" />
      </button>
      <h1 className="text-white text-xl font-bold">{title}</h1>
    </div>
    <div className="flex-1 overflow-y-auto scrollbar-hide">{children}</div>
  </div>
);

const SettingsRow = ({
  icon,
  label,
  description,
  onPress,
  showArrow = true,
  danger = false,
  toggle,
  toggleValue,
  onToggle,
}: {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  onPress?: () => void;
  showArrow?: boolean;
  danger?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: () => void;
}) => (
  <button
    onClick={toggle ? onToggle : onPress}
    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors text-left"
  >
    {icon && <div className="flex-shrink-0 w-6 flex items-center justify-center text-white/80">{icon}</div>}
    <div className="flex-1 min-w-0">
      <p className={cn('text-[15px]', danger ? 'text-red-400' : 'text-white')}>{label}</p>
      {description && <p className="text-[13px] text-white/40 mt-0.5 leading-tight">{description}</p>}
    </div>
    {toggle ? (
      <div className={cn('relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0', toggleValue ? 'bg-[#00FF00]' : 'bg-white/20')}>
        <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200', toggleValue ? 'translate-x-7' : 'translate-x-1')} />
      </div>
    ) : showArrow ? (
      <ChevronRight size={18} className="text-white/30 flex-shrink-0" />
    ) : null}
  </button>
);

const SectionDivider = ({ label }: { label: string }) => (
  <div className="px-5 pt-6 pb-2">
    <p className="text-[13px] text-white/40">{label}</p>
  </div>
);

const Separator = () => <div className="h-px bg-white/10 mx-5" />;

const FriendsSettings = ({ onBack }: { onBack: () => void }) => {
  const [autoAdd, setAutoAdd] = useState(false);
  const [allowOthers, setAllowOthers] = useState(false);

  return (
    <SettingsSubPage title="Friends" onBack={onBack}>
      <SectionDivider label="Add friends" />
      <div className="bg-white/5 rounded-xl mx-3 overflow-hidden">
        <SettingsRow
          label="Auto-add friends"
          description="Enable this setting to automatically add friends from your device's contacts."
          toggle
          toggleValue={autoAdd}
          onToggle={() => setAutoAdd(v => !v)}
        />
        <Separator />
        <SettingsRow
          label="Allow others to add me"
          description="Allow other users to search for and automatically friend you using your phone number."
          toggle
          toggleValue={allowOthers}
          onToggle={() => setAllowOthers(v => !v)}
        />
      </div>
      <SectionDivider label="Manage friends" />
      <div className="bg-white/5 rounded-xl mx-3 overflow-hidden">
        <SettingsRow label="Hidden accounts" onPress={() => toast.info('No hidden accounts')} />
        <Separator />
        <SettingsRow label="Blocked accounts" onPress={() => toast.info('No blocked accounts')} />
      </div>
    </SettingsSubPage>
  );
};

const MorePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [subPage, setSubPage] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
  };

  if (subPage === 'friends') return <FriendsSettings onBack={() => setSubPage(null)} />;

  const generalItems = [
    { icon: <Bell size={20} />, label: 'Notifications' },
    { icon: <Image size={20} />, label: 'Photos & videos' },
    { icon: <MessageSquare size={20} />, label: 'Chats' },
    { icon: <Phone size={20} />, label: 'Calls' },
    { icon: <BookImage size={20} />, label: 'Albums' },
    { icon: <Users size={20} />, label: 'Friends', onPress: () => setSubPage('friends') },
    { icon: <Globe size={20} />, label: 'Language' },
    { icon: <Bot size={20} />, label: 'Google Assistant' },
    { icon: <FlaskConical size={20} />, label: 'GaGa Chat Labs' },
  ];

  const appInfoItems = [
    { icon: <Shield size={20} />, label: 'Privacy Policy' },
    { icon: <Lock size={20} />, label: 'Privacy Center' },
    { icon: <Bell size={20} />, label: 'Announcements' },
    { icon: <UserCircle size={20} />, label: 'Help center' },
    { icon: <Bot size={20} />, label: 'About GaGa Chat' },
  ];

  const allItems = [
    'Profile', 'Account', 'Privacy',
    'Back up and restore chat history', 'Easy transfer QR code', 'Account transfer options',
    'Stickers', 'Themes', 'Coins',
    ...generalItems.map(i => i.label),
    ...appInfoItems.map(i => i.label),
  ];

  const filtered = searchQuery
    ? allItems.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header with GaGa Chat branding */}
      <div className="px-5 pt-12 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logoSrc} alt="GaGa Chat" className="w-7 h-7 rounded-full gchat-logo-glow" />
          <h1 className="text-white text-xl font-bold">Settings</h1>
        </div>
        <button className="p-2 text-white/60 hover:text-white transition-colors">
          <Settings size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-3">
        <div className="flex items-center bg-white/10 rounded-xl px-3 py-2.5 gap-2">
          <Search size={15} className="text-white/40 flex-shrink-0" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search settings, help articles"
            className="flex-1 bg-transparent text-[14px] text-white placeholder-white/30 outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <X size={14} className="text-white/40" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="flex-1 overflow-y-auto scrollbar-hide bg-black">
          {filtered.length > 0 ? (
            <div className="bg-white/5 mx-3 rounded-xl overflow-hidden">
              {filtered.map((item, i) => (
                <div key={item}>
                  <SettingsRow label={item} onPress={() => { setSearchQuery(''); toast.info(`${item} coming soon!`); }} />
                  {i < filtered.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-white/30">
              <Search size={32} className="mb-2" />
              <p className="text-sm">No results found</p>
            </div>
          )}
        </div>
      )}

      {/* Main Settings List */}
      {!searchQuery && (
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {/* Profile Row */}
          <div className="bg-white/5 mx-3 rounded-xl overflow-hidden mb-1">
            <button
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors"
              onClick={() => toast.info('Profile editing coming soon!')}
            >
              <div className="relative flex-shrink-0">
                <img src={CURRENT_USER.avatar} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-black bg-[#00FF00]" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-semibold text-[15px]">{CURRENT_USER.name}</p>
                <p className="text-white/40 text-[12px] italic">{CURRENT_USER.statusMessage}</p>
              </div>
              <ChevronRight size={18} className="text-white/30" />
            </button>
          </div>

          {/* Personal info */}
          <SectionDivider label="Personal info" />
          <div className="bg-white/5 mx-3 rounded-xl overflow-hidden">
            <SettingsRow icon={<Database size={20} />} label="Account" onPress={() => toast.info('Account settings coming soon!')} />
            <Separator />
            <SettingsRow icon={<Lock size={20} />} label="Privacy" onPress={() => toast.info('Privacy settings coming soon!')} />
          </div>

          {/* Backup and transfer */}
          <SectionDivider label="Backup and transfer" />
          <div className="bg-white/5 mx-3 rounded-xl overflow-hidden">
            <SettingsRow icon={<Database size={20} />} label="Back up and restore chat history" onPress={() => toast.success('Chat backup started!')} />
            <Separator />
            <SettingsRow icon={<QrCode size={20} />} label="Easy transfer QR code" onPress={() => setShowQR(true)} />
            <Separator />
            <SettingsRow icon={<ArrowRightLeft size={20} />} label="Account transfer options" onPress={() => toast.info('Transfer options coming soon!')} />
          </div>

          {/* Shops */}
          <SectionDivider label="Shops" />
          <div className="bg-white/5 mx-3 rounded-xl overflow-hidden">
            <SettingsRow icon={<Smile size={20} />} label="Stickers" onPress={() => toast.info('Sticker shop coming soon!')} />
            <Separator />
            <SettingsRow icon={<Palette size={20} />} label="Themes" onPress={() => toast.info('Theme shop coming soon!')} />
            <Separator />
            <SettingsRow icon={<Coins size={20} />} label="Coins" onPress={() => toast.info('GaGa Chat Coins coming soon!')} />
          </div>

          {/* General */}
          <SectionDivider label="General" />
          <div className="bg-white/5 mx-3 rounded-xl overflow-hidden">
            {generalItems.map((item, i) => (
              <div key={item.label}>
                <SettingsRow
                  icon={item.icon}
                  label={item.label}
                  onPress={item.onPress ?? (() => toast.info(`${item.label} settings coming soon!`))}
                />
                {i < generalItems.length - 1 && <Separator />}
              </div>
            ))}
          </div>

          {/* App info */}
          <SectionDivider label="App info" />
          <div className="bg-white/5 mx-3 rounded-xl overflow-hidden">
            {appInfoItems.map((item, i) => (
              <div key={item.label}>
                <SettingsRow
                  icon={item.icon}
                  label={item.label}
                  onPress={() => toast.info(`${item.label} coming soon!`)}
                />
                {i < appInfoItems.length - 1 && <Separator />}
              </div>
            ))}
          </div>

          <div className="px-4 mt-4">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold text-sm hover:bg-red-500/20 transition-colors active:scale-[0.99]"
            >
              <LogOut size={18} />
              Sign Out
              {user?.email && <span className="text-red-400/60 text-xs ml-1">({user.email})</span>}
            </button>
          </div>

          <div className="py-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <img src={logoSrc} alt="GaGa Chat" className="w-5 h-5 rounded-full" />
              <p className="text-white/20 text-xs font-medium">GaGa Chat v1.0.0</p>
            </div>
            <p className="text-white/10 text-[10px]">Always at your side</p>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center animate-fade-in"
          onClick={() => setShowQR(false)}
        >
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 mx-6 text-center animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <img src={logoSrc} alt="GaGa Chat" className="w-8 h-8 rounded-full gchat-logo-glow" />
              <h3 className="text-lg font-bold text-white">My QR Code</h3>
            </div>
            <div className="w-48 h-48 mx-auto bg-white rounded-2xl flex items-center justify-center mb-4 p-3">
              <div className="grid grid-cols-8 gap-0.5 w-full h-full">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className={cn('rounded-sm', (i + Math.floor(i / 8)) % 3 !== 0 ? 'bg-gray-900' : 'bg-transparent')} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <img src={CURRENT_USER.avatar} alt="" className="w-8 h-8 rounded-full" />
              <span className="font-semibold text-white">{CURRENT_USER.name}</span>
            </div>
            <p className="text-xs text-white/40 mb-6">Scan to add me on GaGa Chat</p>
            <button onClick={() => setShowQR(false)} className="w-full gchat-btn py-3 rounded-2xl font-semibold text-sm">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MorePage;
