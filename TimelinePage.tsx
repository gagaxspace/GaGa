import { useState } from 'react';
import { Search, X, Heart, MessageCircle, Share2, Globe, Lock, Users2, MoreHorizontal, Send, Camera, Image } from 'lucide-react';
import TimelinePostCard from '@/components/features/TimelinePostCard';
import { MOCK_TIMELINE_POSTS, CURRENT_USER, MOCK_USERS } from '@/constants/mockData';
import type { TimelinePost, Comment } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Visibility = 'public' | 'friends' | 'private';

const VisibilityOptions: { value: Visibility; label: string; icon: React.ReactNode }[] = [
  { value: 'public', label: 'Public', icon: <Globe size={14} /> },
  { value: 'friends', label: 'Friends only', icon: <Users2 size={14} /> },
  { value: 'private', label: 'Only me', icon: <Lock size={14} /> },
];

const TimelinePage = () => {
  const [posts, setPosts] = useState<TimelinePost[]>(MOCK_TIMELINE_POSTS);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [activeFilter, setActiveFilter] = useState<'all' | 'mine'>('all');

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;
      const isLiked = post.likes.includes('me');
      return {
        ...post,
        likes: isLiked ? post.likes.filter(id => id !== 'me') : [...post.likes, 'me'],
      };
    }));
  };

  const handleComment = (postId: string, content: string) => {
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      userId: 'me',
      content,
      timestamp: new Date(),
      likes: [],
    };
    setPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post
    ));
  };

  const handleNewPost = () => {
    if (!newContent.trim()) return;
    const newPost: TimelinePost = {
      id: `p_${Date.now()}`,
      userId: 'me',
      content: newContent.trim(),
      images: [],
      likes: [],
      comments: [],
      timestamp: new Date(),
      visibility,
    };
    setPosts(prev => [newPost, ...prev]);
    setNewContent('');
    setShowNewPost(false);
    toast.success('Post shared!');
  };

  const visiblePosts = posts.filter(p =>
    activeFilter === 'mine' ? p.userId === 'me' : true
  );

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <div className="px-5 pt-12 pb-3 flex items-center justify-between bg-black">
        <h1 className="text-white text-xl font-bold">Timeline</h1>
        <button
          onClick={() => setShowNewPost(true)}
          className="p-2 text-white/60 hover:text-white transition-colors"
        >
          <Camera size={22} />
        </button>
      </div>

      {/* Profile Banner */}
      <div className="bg-[#111] border-b border-white/10">
        {/* Cover */}
        <div className="h-24 relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, #00CC00 0%, #00FF00 55%, #ADFF2F 100%)', opacity: 0.6 }}
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url(${CURRENT_USER.avatar})`,
              backgroundSize: 'cover',
              filter: 'blur(20px) brightness(0.4)',
            }}
          />
        </div>

        {/* Avatar + Post button */}
        <div className="px-4 pb-3">
          <div className="flex items-end justify-between -mt-8">
            <div className="story-ring">
              <img
                src={CURRENT_USER.avatar}
                alt="Me"
                className="w-16 h-16 rounded-full border-3 border-black shadow-lg object-cover"
              />
            </div>
            <button
              onClick={() => setShowNewPost(true)}
              className="mb-1 flex items-center gap-2 gchat-btn text-xs font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              <Image size={14} />
              Post
            </button>
          </div>
          <div className="mt-2">
            <p className="font-bold text-white">{CURRENT_USER.name}</p>
            <p className="text-sm text-white/40 italic">{CURRENT_USER.statusMessage}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex border-t border-white/10">
          {[
            { label: 'Posts', value: posts.filter(p => p.userId === 'me').length },
            { label: 'Friends', value: MOCK_USERS.length },
            { label: 'Likes', value: posts.reduce((sum, p) => sum + (p.userId === 'me' ? p.likes.length : 0), 0) },
          ].map(stat => (
            <div
              key={stat.label}
              className="flex-1 flex flex-col items-center py-2.5 border-r border-white/10 last:border-0 cursor-pointer hover:bg-white/5 transition-colors"
            >
              <span className="text-base font-bold text-white">{stat.value}</span>
              <span className="text-xs text-white/40">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex px-5 py-2 gap-1 border-b border-white/10 bg-black">
        {[
          { id: 'all', label: 'All posts' },
          { id: 'mine', label: 'My posts' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id as 'all' | 'mine')}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
              activeFilter === f.id ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/60'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="flex-1 overflow-y-auto scrollbar-hide bg-black">
        {visiblePosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-white/30">
            <Camera size={40} className="mb-3 opacity-30" />
            <p className="font-medium">No posts yet</p>
            <p className="text-sm mt-1">Share your first moment!</p>
            <button
              onClick={() => setShowNewPost(true)}
              className="mt-4 gchat-btn px-6 py-2.5 rounded-full text-sm font-semibold"
            >
              Create Post
            </button>
          </div>
        ) : (
          visiblePosts.map(post => (
            <TimelinePostCard key={post.id} post={post} onLike={handleLike} onComment={handleComment} />
          ))
        )}
        <div className="h-6" />
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div
          className="fixed inset-0 z-50 bg-black/70 animate-fade-in"
          onClick={e => { if (e.target === e.currentTarget) setShowNewPost(false); }}
        >
          <div className="bg-[#111] h-full flex flex-col animate-slide-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <button onClick={() => setShowNewPost(false)}>
                <X size={22} className="text-white/60" />
              </button>
              <h3 className="font-bold text-white">New Post</h3>
              <button
                onClick={handleNewPost}
                disabled={!newContent.trim()}
                className="text-sm font-semibold disabled:text-white/20 transition-colors"
                style={{ color: newContent.trim() ? '#00FF00' : undefined }}
              >
                Share
              </button>
            </div>

            <div className="flex items-start gap-3 px-4 py-4">
              <img src={CURRENT_USER.avatar} alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-white mb-1">{CURRENT_USER.name}</p>
                <textarea
                  autoFocus
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full text-sm text-white outline-none resize-none min-h-[140px] placeholder-white/30 bg-transparent leading-relaxed"
                />
              </div>
            </div>

            {/* Attachment options */}
            <div className="border-t border-white/10 px-4 py-3">
              <div className="flex gap-4">
                <button
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                  onClick={() => toast.info('Photo upload coming soon!')}
                >
                  <Image size={20} style={{ color: '#00FF00' }} /> Photo
                </button>
                <button
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                  onClick={() => toast.info('Camera coming soon!')}
                >
                  <Camera size={20} className="text-blue-400" /> Camera
                </button>
              </div>
            </div>

            {/* Visibility */}
            <div className="px-4 py-3 border-t border-white/10">
              <p className="text-xs text-white/30 mb-2 font-medium">POST VISIBILITY</p>
              <div className="flex gap-2">
                {VisibilityOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setVisibility(opt.value)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                      visibility === opt.value
                        ? 'gchat-btn'
                        : 'bg-white/10 text-white/60 hover:bg-white/15'
                    )}
                  >
                    {opt.icon}
                    {opt.label}
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

export default TimelinePage;
