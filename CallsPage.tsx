import { useState } from 'react';
import { Phone, Video, PhoneMissed, PhoneIncoming, PhoneOutgoing, QrCode, Plus, Search } from 'lucide-react';
import CallModal from '@/components/features/CallModal';
import { MOCK_CALL_RECORDS, getUserById, formatTime, formatDuration } from '@/constants/mockData';
import type { User } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const CallsPage = () => {
  const [activeCall, setActiveCall] = useState<{ user: User; type: 'voice' | 'video' } | null>(null);
  const [filter, setFilter] = useState<'all' | 'missed'>('all');

  const filtered = MOCK_CALL_RECORDS.filter(r => filter === 'all' || r.direction === 'missed');

  const isEmpty = filtered.length === 0;

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <div className="px-5 pt-12 pb-3 flex items-center justify-between">
        <h1 className="text-white text-xl font-bold">Calls</h1>
        <div className="flex items-center gap-2">
          <button
            className="p-2 text-white/60 hover:text-white transition-colors"
            onClick={() => toast.info('Search calls coming soon!')}
          >
            <Search size={20} />
          </button>
          <button
            className="p-2 text-white/60 hover:text-white transition-colors"
            onClick={() => toast.info('New call coming soon!')}
          >
            <Plus size={22} />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex px-5 gap-1 mb-2">
        {(['all', 'missed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
              filter === f
                ? 'bg-white/15 text-white'
                : 'text-white/40 hover:text-white/60'
            )}
          >
            {f === 'all' ? 'All' : 'Missed'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {isEmpty ? (
          /* Empty State — matches LINE's design */
          <div className="flex flex-col items-center justify-center h-full px-8 text-center pb-20">
            <h2 className="text-white text-[22px] font-bold mb-2">
              Make a call anytime, anywhere
            </h2>
            <p className="text-white/40 text-[15px] leading-relaxed">
              Talk to your friends whenever{'\n'}with LINE voice calls.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map(record => {
              const user = getUserById(record.userId);
              if (!user) return null;

              const DirectionIcon =
                record.direction === 'missed'
                  ? PhoneMissed
                  : record.direction === 'incoming'
                  ? PhoneIncoming
                  : PhoneOutgoing;

              return (
                <div
                  key={record.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/5 transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                    <div
                      className={cn(
                        'absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-black flex items-center justify-center',
                        record.type === 'video' ? 'bg-blue-500' : 'bg-[#00CC00]'
                      )}
                    >
                      {record.type === 'video' ? (
                        <Video size={10} className="text-white" />
                      ) : (
                        <Phone size={10} className="text-white" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'font-semibold text-[15px] truncate',
                        record.direction === 'missed' ? 'text-red-400' : 'text-white'
                      )}
                    >
                      {user.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <DirectionIcon
                        size={12}
                        className={cn(
                          record.direction === 'missed'
                            ? 'text-red-400'
                            : record.direction === 'incoming'
                            ? 'text-emerald-400'
                            : 'text-blue-400'
                        )}
                      />
                      <span className="text-[13px] text-white/40 capitalize">
                        {record.direction}
                        {record.duration ? ` · ${formatDuration(record.duration)}` : ''}
                      </span>
                      <span className="text-white/20 text-xs">·</span>
                      <span className="text-[13px] text-white/40">{formatTime(record.timestamp)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveCall({ user, type: record.type })}
                    className="p-2.5 rounded-full text-white/60 hover:bg-white/10 hover:text-white transition-colors flex-shrink-0"
                  >
                    {record.type === 'video' ? <Video size={20} /> : <Phone size={20} />}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Call Modal */}
      {activeCall && (
        <CallModal user={activeCall.user} type={activeCall.type} onEnd={() => setActiveCall(null)} />
      )}
    </div>
  );
};

export default CallsPage;
