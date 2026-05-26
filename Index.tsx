import { useState } from 'react';
import BottomNav from '@/components/layout/BottomNav';
import ChatsPage from './ChatsPage';
import ChatRoomPage from './ChatRoomPage';
import ContactsPage from './ContactsPage';
import TimelinePage from './TimelinePage';
import CallsPage from './CallsPage';
import MorePage from './MorePage';
import { useChatStore } from '@/hooks/useChatStore';
import { MOCK_USERS } from '@/constants/mockData';
import type { Chat } from '@/types';

type Tab = 'chats' | 'contacts' | 'timeline' | 'calls' | 'more';

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('chats');
  const [activeChatRoom, setActiveChatRoom] = useState<Chat | null>(null);

  const {
    chats,
    messages,
    sendMessage,
    addReaction,
    markAsRead,
    pinChat,
    muteChat,
    deleteChat,
    createGroupChat,
    totalUnread,
    setActiveChat,
  } = useChatStore();

  const handleChatSelect = (chat: Chat) => {
    setActiveChatRoom(chat);
    setActiveChat(chat);
    markAsRead(chat.id);
  };

  const handleBackFromChat = () => {
    setActiveChatRoom(null);
    setActiveChat(null);
  };

  const handleStartChatFromContacts = (userId: string) => {
    const existingChat = chats.find(c =>
      c.type === 'direct' && c.participants.includes(userId) && c.participants.includes('me')
    );
    if (existingChat) {
      setActiveChatRoom(existingChat);
      setActiveChat(existingChat);
      setActiveTab('chats');
    } else {
      const user = MOCK_USERS.find(u => u.id === userId);
      if (user) {
        const newChatId = `chat_${Date.now()}`;
        const newChat: Chat = {
          id: newChatId,
          type: 'direct',
          participants: ['me', userId],
          unreadCount: 0,
          isPinned: false,
          isMuted: false,
          createdAt: new Date(),
        };
        setActiveChatRoom(newChat);
        setActiveChat(newChat);
        setActiveTab('chats');
      }
    }
  };

  return (
    <div className="flex justify-center items-stretch min-h-screen bg-black">
      <div className="relative w-full max-w-md bg-black flex flex-col min-h-screen shadow-2xl overflow-hidden">
        {/* Main Content */}
        <div className={activeChatRoom ? 'h-screen overflow-hidden' : 'flex-1 overflow-hidden pb-[60px]'}>
          {activeChatRoom ? (
            <div className="h-full">
              <ChatRoomPage
                chat={activeChatRoom}
                messages={messages[activeChatRoom.id] || []}
                onBack={handleBackFromChat}
                onSend={sendMessage}
                onReact={addReaction}
                onMarkRead={markAsRead}
              />
            </div>
          ) : (
            <div className="h-full overflow-hidden">
              {activeTab === 'chats' && (
                <ChatsPage
                  chats={chats}
                  onChatSelect={handleChatSelect}
                  onPin={pinChat}
                  onMute={muteChat}
                  onDelete={deleteChat}
                  onCreateGroup={createGroupChat}
                />
              )}
              {activeTab === 'contacts' && (
                <ContactsPage onStartChat={handleStartChatFromContacts} />
              )}
              {activeTab === 'timeline' && <TimelinePage />}
              {activeTab === 'calls' && <CallsPage />}
              {activeTab === 'more' && <MorePage />}
            </div>
          )}
        </div>

        {/* Bottom Navigation — hidden inside chat room */}
        {!activeChatRoom && (
          <BottomNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            unreadCount={totalUnread}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
