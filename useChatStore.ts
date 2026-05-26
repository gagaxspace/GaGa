import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Chat, Message, Reaction } from '@/types';
import {
  MOCK_CHATS,
  MOCK_MESSAGES,
  CURRENT_USER,
  getUserById,
} from '@/constants/mockData';

interface ChatStore {
  chats: Chat[];
  messages: Record<string, Message[]>;
  activeChat: Chat | null;
  typingUsers: Record<string, string[]>; // chatId -> userIds typing

  // selectors / derived
  totalUnread: number;

  // actions
  setActiveChat: (chat: Chat | null) => void;
  sendMessage: (chatId: string, content: string, type?: Message['type']) => void;
  receiveMessage: (msg: Message) => void;
  addReaction: (chatId: string, messageId: string, emoji: string) => void;
  markAsRead: (chatId: string) => void;
  pinChat: (chatId: string) => void;
  muteChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  createGroupChat: (name: string, participantIds: string[]) => Chat;
  createDirectChat: (userId: string) => Chat;
  setTyping: (chatId: string, userId: string, typing: boolean) => void;
  recomputeUnread: () => void;
}

const reviveDates = (chats: Chat[], messages: Record<string, Message[]>) => {
  chats.forEach((c) => {
    if (c.createdAt && typeof c.createdAt === 'string') c.createdAt = new Date(c.createdAt);
    if (c.lastMessage?.timestamp && typeof c.lastMessage.timestamp === 'string') {
      c.lastMessage.timestamp = new Date(c.lastMessage.timestamp);
    }
  });
  Object.values(messages).forEach((arr) => {
    arr.forEach((m) => {
      if (typeof m.timestamp === 'string') m.timestamp = new Date(m.timestamp);
    });
  });
};

const computeTotalUnread = (chats: Chat[]) =>
  chats.reduce((s, c) => s + (c.isMuted ? 0 : c.unreadCount), 0);

const sortChats = (chats: Chat[]) => {
  return [...chats].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    const aT = a.lastMessage?.timestamp?.getTime() ?? a.createdAt.getTime();
    const bT = b.lastMessage?.timestamp?.getTime() ?? b.createdAt.getTime();
    return bT - aT;
  });
};

// Simulated auto-reply for realtime feel
const AUTO_REPLIES = [
  'Got it! 👍',
  'Sounds good!',
  'Haha that\'s funny 😂',
  'Let me get back to you',
  'Sure, no problem',
  'Interesting! Tell me more',
  'On my way',
  'Thanks! 🙏',
  '😊',
  'Awesome!',
];

const simulateReply = (chatId: string, get: () => ChatStore, set: (fn: (s: ChatStore) => Partial<ChatStore>) => void) => {
  const state = get();
  const chat = state.chats.find((c) => c.id === chatId);
  if (!chat) return;

  // pick a participant (not me) to reply
  const others = chat.participants.filter((p) => p !== CURRENT_USER.id);
  if (others.length === 0) return;
  const replierId = others[Math.floor(Math.random() * others.length)];
  const user = getUserById(replierId);
  if (!user || user.status === 'offline') return;

  // start typing
  state.setTyping(chatId, replierId, true);

  setTimeout(() => {
    const text = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
    const msg: Message = {
      id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      chatId,
      senderId: replierId,
      type: 'text',
      content: text,
      timestamp: new Date(),
      read: false,
    };
    state.setTyping(chatId, replierId, false);
    state.receiveMessage(msg);
  }, 1500 + Math.random() * 1500);
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: sortChats(MOCK_CHATS),
      messages: MOCK_MESSAGES,
      activeChat: null,
      typingUsers: {},
      totalUnread: computeTotalUnread(MOCK_CHATS),

      setActiveChat: (chat) => set({ activeChat: chat }),

      sendMessage: (chatId, content, type = 'text') => {
        const msg: Message = {
          id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          chatId,
          senderId: CURRENT_USER.id,
          type,
          content,
          timestamp: new Date(),
          read: true,
        };

        set((state) => {
          const existing = state.messages[chatId] || [];
          const updated = { ...state.messages, [chatId]: [...existing, msg] };
          // ensure chat exists; if it's a new chat (e.g. created from contacts), add it
          let chats = state.chats;
          if (!chats.find((c) => c.id === chatId)) {
            // best-effort: do nothing, caller should have added it
          }
          chats = chats.map((c) =>
            c.id === chatId ? { ...c, lastMessage: msg } : c
          );
          return {
            messages: updated,
            chats: sortChats(chats),
            totalUnread: computeTotalUnread(chats),
          };
        });

        // simulate the other side replying
        simulateReply(chatId, get, set);
      },

      receiveMessage: (msg) => {
        set((state) => {
          const existing = state.messages[msg.chatId] || [];
          const updatedMsgs = { ...state.messages, [msg.chatId]: [...existing, msg] };
          const chats = state.chats.map((c) => {
            if (c.id !== msg.chatId) return c;
            const isActive = state.activeChat?.id === msg.chatId;
            return {
              ...c,
              lastMessage: msg,
              unreadCount: isActive ? 0 : c.unreadCount + 1,
            };
          });
          return {
            messages: updatedMsgs,
            chats: sortChats(chats),
            totalUnread: computeTotalUnread(chats),
          };
        });
      },

      addReaction: (chatId, messageId, emoji) => {
        set((state) => {
          const arr = state.messages[chatId];
          if (!arr) return state;
          const updated = arr.map((m) => {
            if (m.id !== messageId) return m;
            const reactions: Reaction[] = m.reactions ? [...m.reactions] : [];
            const existingIdx = reactions.findIndex(
              (r) => r.userId === CURRENT_USER.id && r.emoji === emoji
            );
            if (existingIdx >= 0) {
              reactions.splice(existingIdx, 1);
            } else {
              reactions.push({ emoji, userId: CURRENT_USER.id });
            }
            return { ...m, reactions };
          });
          return { messages: { ...state.messages, [chatId]: updated } };
        });
      },

      markAsRead: (chatId) => {
        set((state) => {
          const chats = state.chats.map((c) =>
            c.id === chatId ? { ...c, unreadCount: 0 } : c
          );
          const arr = state.messages[chatId];
          const updatedMsgs = arr
            ? { ...state.messages, [chatId]: arr.map((m) => ({ ...m, read: true })) }
            : state.messages;
          return {
            chats,
            messages: updatedMsgs,
            totalUnread: computeTotalUnread(chats),
          };
        });
      },

      pinChat: (chatId) => {
        set((state) => {
          const chats = state.chats.map((c) =>
            c.id === chatId ? { ...c, isPinned: !c.isPinned } : c
          );
          return { chats: sortChats(chats) };
        });
      },

      muteChat: (chatId) => {
        set((state) => {
          const chats = state.chats.map((c) =>
            c.id === chatId ? { ...c, isMuted: !c.isMuted } : c
          );
          return { chats, totalUnread: computeTotalUnread(chats) };
        });
      },

      deleteChat: (chatId) => {
        set((state) => {
          const chats = state.chats.filter((c) => c.id !== chatId);
          const messages = { ...state.messages };
          delete messages[chatId];
          return {
            chats,
            messages,
            totalUnread: computeTotalUnread(chats),
            activeChat: state.activeChat?.id === chatId ? null : state.activeChat,
          };
        });
      },

      createGroupChat: (name, participantIds) => {
        const chat: Chat = {
          id: `chat_${Date.now()}`,
          type: 'group',
          name,
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
          participants: [CURRENT_USER.id, ...participantIds],
          unreadCount: 0,
          isPinned: false,
          isMuted: false,
          createdAt: new Date(),
        };
        set((state) => ({
          chats: sortChats([...state.chats, chat]),
          messages: { ...state.messages, [chat.id]: [] },
        }));
        return chat;
      },

      createDirectChat: (userId) => {
        const existing = get().chats.find(
          (c) =>
            c.type === 'direct' &&
            c.participants.includes(userId) &&
            c.participants.includes(CURRENT_USER.id)
        );
        if (existing) return existing;
        const chat: Chat = {
          id: `chat_${Date.now()}`,
          type: 'direct',
          participants: [CURRENT_USER.id, userId],
          unreadCount: 0,
          isPinned: false,
          isMuted: false,
          createdAt: new Date(),
        };
        set((state) => ({
          chats: sortChats([...state.chats, chat]),
          messages: { ...state.messages, [chat.id]: [] },
        }));
        return chat;
      },

      setTyping: (chatId, userId, typing) => {
        set((state) => {
          const current = state.typingUsers[chatId] || [];
          const next = typing
            ? Array.from(new Set([...current, userId]))
            : current.filter((u) => u !== userId);
          return { typingUsers: { ...state.typingUsers, [chatId]: next } };
        });
      },

      recomputeUnread: () => {
        set((state) => ({ totalUnread: computeTotalUnread(state.chats) }));
      },
    }),
    {
      name: 'gchat-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        chats: state.chats,
        messages: state.messages,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          reviveDates(state.chats, state.messages);
          state.totalUnread = computeTotalUnread(state.chats);
        }
      },
    }
  )
);
