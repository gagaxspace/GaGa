import { useState, useRef, useEffect } from 'react';
import {
  Phone, Video, MoreVertical, Image, Smile, Mic, Send, X, ChevronLeft,
  Reply, Copy, Trash2, Heart, ThumbsUp, Laugh, Surprised, Sad, Angry
} from 'lucide-react';
import MessageBubble from '@/components/features/MessageBubble';
import StickerPicker from '@/components/features/StickerPicker';
import TypingIndicator from '@/components/features/TypingIndicator';
import CallModal from '@/components/features/CallModal';
import type { Chat, Message } from '@/types';
import { getChatName, getChatAvatar, getUserById, CURRENT_USER } from '@/constants/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatRoomPageProps {
  chat: Chat;
  messages: Message[];
  onBack: () => void;
  onSend: (chatId: string, content: string, type?: Message['type']) => void;
  onReact: (chatId: string, messageId: string, emoji: string) => void;
  onMarkRead: (chatId: string) => void;
}

const QUICK_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '😡'];

const ChatRoomPage = ({ chat, messages, onBack, onSend, onReact, onMarkRead }: ChatRoomPageProps) => {
  const [input, setInput] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video' | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatName = getChatName(chat);
  const chatAvatar = getChatAvatar(chat);
  const otherUser = chat.type === 'direct'
    ? getUserById(chat.participants.find(p => p !== 'me') || '')
    : null;

  useEffect(() => { onMarkRead(chat.id); }, [chat.id]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.senderId === 'me' && lastMsg?.type === 'text') {
      const t = setTimeout(() => setIsTyping(true), 700);
      const t2 = setTimeout(() => setIsTyping(false), 2800);
      return () => { clearTimeout(t); clearTimeout(t2); };
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(chat.id, input.trim(), 'text');
    setInput('');
    setShowStickers(false);
    setReplyTo(null);
    inputRef.current?.focus();
  };

  const handleReact = (msgId: string, emoji: string) => {
    onReact(chat.id, msgId, emoji);
    setShowReactions(null);
    setSelectedMsg(null);
  };

  const groupMessages = (msgs: Message[]) =>
    msgs.map((msg, i) => {
      const prev = msgs[i - 1];
      const next = msgs[i + 1];
      return {
        ...msg,
        showAvatar: Boolean(!next || next.senderId !== msg.senderId),
        showSenderName: Boolean(!prev || prev.senderId !== msg.senderId),
      };
    });

  const grouped = groupMessages(messages);

  const shouldShowDate = (msg: Message, prev?: Message) =>
    !prev || msg.timestamp.toDateString() !== prev.timestamp.toDateString();

  const getSubtitle = () => {
    if (chat.type === 'group') return `${chat.participants.length} members`;
    return otherUser?.status === 'online' ? 'Online' : (otherUser?.statusMessage || '');
  };

  const replyMsg = replyTo ? getUserById(replyTo.senderId) : null;

  return (
    <div className="flex flex-col h-full bg-[#111] relative">
      {/* Header */}
      <div className="gchat-header flex items-center gap-2 px-3 py-2.5 sticky top-0 z-40">
        <button onClick={onBack} className="p-1.5 text-black/70 hover:bg-black/10 rounded-full transition-colors -ml-1">
          <ChevronLeft size={24} />
        </button>
        <div className="relative flex-shrink-0 cursor-pointer" onClick={() => setShowInfo(true)}>
          <img src={chatAvatar} alt={chatName} className="w-9 h-9 rounded-full object-cover bg-white/20" />
          {otherUser?.status === 'online' && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-300 rounded-full border-2 border-transparent" />
          )}
        </div>
        <div className="flex-1 cursor-pointer min-w-0" onClick={() => setShowInfo(true)}>
          <p className="text-black font-bold text-[15px] leading-tight truncate">{chatName}</p>
          <p className="text-black/60 text-[11px] truncate">{getSubtitle()}</p>
        </div>
        <div className="flex items-center">
          <button onClick={() => setCallType('voice')} className="p-2 text-black/70 hover:bg-black/10 rounded-full transition-colors">
            <Phone size={20} />
          </button>
          <button onClick={() => setCallType('video')} className="p-2 text-black/70 hover:bg-black/10 rounded-full transition-colors">
            <Video size={20} />
          </button>
          <button onClick={() => setShowInfo(true)} className="p-2 text-black/70 hover:bg-black/10 rounded-full transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide"
        style={{ background: 'linear-gradient(180deg, #0d0d0d 0%, #111 100%)' }}
        onClick={() => { setSelectedMsg(null); setShowReactions(null); }}
      >
        {grouped.map((msg, i) => (
          <div key={msg.id}>
            {shouldShowDate(msg, grouped[i - 1]) && (
              <div className="flex justify-center my-3">
                <span className="bg-white/10 text-white/60 text-[11px] px-3 py-1 rounded-full">
                  {msg.timestamp.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}

            {/* Long-press message action overlay */}
            <div
              className="relative group"
              onContextMenu={e => {
                e.preventDefault();
                setSelectedMsg(msg);
                setShowReactions(msg.id);
              }}
            >
              {/* Quick reactions popup */}
              {showReactions === msg.id && (
                <div
                  className={cn(
                    'absolute z-20 flex gap-1 bg-[#2a2a2a] border border-white/10 rounded-full px-2 py-1.5 shadow-xl animate-scale-in',
                    msg.senderId === 'me' ? 'right-0' : 'left-8'
                  )}
                  style={{ bottom: '100%', marginBottom: 4 }}
                  onClick={e => e.stopPropagation()}
                >
                  {QUICK_REACTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleReact(msg.id, emoji)}
                      className="text-2xl hover:scale-125 transition-transform active:scale-110"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Action bar (reply, copy) */}
              {selectedMsg?.id === msg.id && showReactions !== msg.id && (
                <div
                  className={cn(
                    'absolute z-20 flex gap-1 bg-[#2a2a2a] border border-white/10 rounded-xl px-1 py-1 shadow-xl animate-scale-in',
                    msg.senderId === 'me' ? 'right-0' : 'left-8'
                  )}
                  style={{ bottom: '100%', marginBottom: 4 }}
                  onClick={e => e.stopPropagation()}
                >
                  <ActionBtn icon={<Reply size={16} />} label="Reply" onClick={() => { setReplyTo(msg); setSelectedMsg(null); inputRef.current?.focus(); }} />
                  <ActionBtn icon={<Copy size={16} />} label="Copy" onClick={() => { navigator.clipboard?.writeText(msg.content); toast.success('Copied!'); setSelectedMsg(null); }} />
                  <ActionBtn icon={<Trash2 size={16} />} label="Delete" danger onClick={() => { toast.info('Message deleted'); setSelectedMsg(null); }} />
                </div>
              )}

              <MessageBubble
                message={msg}
                isOwn={msg.senderId === 'me'}
                showAvatar={msg.showAvatar}
                showSenderName={msg.showSenderName}
                isGroup={chat.type === 'group'}
                onLongPress={() => { setSelectedMsg(msg); setShowReactions(msg.id); }}
                onReact={(emoji) => handleReact(msg.id, emoji)}
              />
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-end gap-2">
            {otherUser && <img src={otherUser.avatar} alt="" className="w-8 h-8 rounded-full" />}
            <TypingIndicator name={otherUser?.name || 'Someone'} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sticker Picker */}
      {showStickers && (
        <StickerPicker
          onSelect={(s) => { onSend(chat.id, s, 'sticker'); setShowStickers(false); }}
          onClose={() => setShowStickers(false)}
        />
      )}

      {/* Reply Preview */}
      {replyTo && (
        <div className="bg-[#1a1a1a] border-t border-white/10 px-4 py-2 flex items-center gap-3">
          <div className="flex-1 border-l-2 border-[#00FF00] pl-3">
            <p className="text-[11px] text-[#00FF00] font-semibold mb-0.5">
              {replyTo.senderId === 'me' ? 'You' : getUserById(replyTo.senderId)?.name}
            </p>
            <p className="text-[12px] text-white/50 truncate">
              {replyTo.type === 'sticker' ? `${replyTo.content} Sticker` : replyTo.content}
            </p>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-white/30 hover:text-white/60">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="bg-[#1a1a1a] border-t border-white/10 px-2 py-2">
        <div className="flex items-end gap-2">
          <button
            onClick={() => { setShowStickers(s => !s); setReplyTo(null); }}
            className={cn(
              'p-2.5 rounded-full transition-colors flex-shrink-0',
              showStickers ? 'gchat-btn' : 'text-white/50 hover:bg-white/10'
            )}
          >
            <Smile size={22} />
          </button>

          <div className="flex-1 flex items-end bg-white/10 rounded-2xl px-3 py-2 gap-2 min-h-[42px]">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Aa"
              className="flex-1 bg-transparent text-sm outline-none text-white placeholder-white/30"
            />
            <button
              className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
              onClick={() => toast.info('Image sharing coming soon!')}
            >
              <Image size={20} />
            </button>
          </div>

          {input.trim() ? (
            <button
              onClick={handleSend}
              className="w-10 h-10 gchat-btn rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity active:scale-95 shadow-sm"
            >
              <Send size={18} className="text-black ml-0.5" />
            </button>
          ) : (
            <button
              className="p-2.5 text-white/50 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
              onClick={() => toast.info('Voice messages coming soon!')}
            >
              <Mic size={22} />
            </button>
          )}
        </div>
      </div>

      {/* Call Modal */}
      {callType && otherUser && (
        <CallModal user={otherUser} type={callType} onEnd={() => setCallType(null)} />
      )}

      {/* Chat Info Panel */}
      {showInfo && (
        <div
          className="fixed inset-0 z-50 animate-fade-in"
          onClick={e => { if (e.target === e.currentTarget) setShowInfo(false); }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#1a1a1a] border-l border-white/10 shadow-2xl flex flex-col animate-scale-in">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <h3 className="font-bold text-white">Chat Info</h3>
              <button onClick={() => setShowInfo(false)}>
                <X size={20} className="text-white/50" />
              </button>
            </div>

            <div className="flex flex-col items-center py-6 bg-black/30 border-b border-white/10">
              <img
                src={chatAvatar}
                alt={chatName}
                className="w-20 h-20 rounded-full mb-3 border-4 border-[#1a1a1a] shadow-md object-cover"
              />
              <h4 className="font-bold text-white text-lg">{chatName}</h4>
              {otherUser && <p className="text-sm text-white/50 mt-1 italic">"{otherUser.statusMessage}"</p>}
              {chat.type === 'group' && (
                <p className="text-sm text-white/50 mt-1">{chat.participants.length} members</p>
              )}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-2 p-4 border-b border-white/10">
              {[
                { icon: '🔕', label: 'Mute' },
                { icon: '🔍', label: 'Search' },
                { icon: '📷', label: 'Media' },
              ].map(a => (
                <button
                  key={a.label}
                  onClick={() => toast.info(`${a.label} coming soon!`)}
                  className="flex flex-col items-center gap-1 py-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <span className="text-xl">{a.icon}</span>
                  <span className="text-xs text-white/50">{a.label}</span>
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {chat.type === 'group' && (
                <div className="p-4">
                  <p className="text-xs text-white/30 font-medium mb-3 uppercase tracking-wide">Members</p>
                  {chat.participants.map(pid => {
                    const u = getUserById(pid);
                    if (!u) return null;
                    return (
                      <div key={pid} className="flex items-center gap-3 py-2">
                        <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{u.name}</p>
                          <p className="text-xs text-white/40">{pid === 'me' ? 'You' : u.status}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="border-t border-white/10">
                {[
                  { label: 'Block Contact', danger: true },
                  { label: 'Report', danger: true },
                  { label: 'Leave Chat', danger: true },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => toast.info(`${item.label} coming soon!`)}
                    className="flex items-center gap-3 w-full px-4 py-4 text-sm text-red-400 hover:bg-red-500/5 transition-colors border-b border-white/5"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ActionBtn = ({
  icon, label, onClick, danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) => (
  <button
    onClick={onClick}
    className={cn(
      'flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs hover:bg-white/10 transition-colors min-w-[52px]',
      danger ? 'text-red-400' : 'text-white/70'
    )}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default ChatRoomPage;
