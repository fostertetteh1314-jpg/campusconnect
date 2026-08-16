import { useEffect, useState } from 'react';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import ChatBox from '../components/ChatBox';
import { useAuth } from '../context/AuthContext';
import { formatRelativeTime, getInitials } from '../utils/helpers';

export default function Messages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const conversationId = searchParams.get('conversation');

  const otherParticipant = (conversation) => conversation.participants?.find((participant) => String(participant._id || participant) !== String(user?._id));
  const select = (conversation) => { setSelected(conversation); setSearchParams({ conversation: conversation._id }); };

  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      try {
        let list = (await api.get('/v1/conversations')).data.conversations || [];
        const toId = searchParams.get('to');
        if (toId) {
          const created = (await api.post('/v1/conversations', { participantId: toId, contextType: searchParams.get('contextType') || 'general', contextId: searchParams.get('contextId') || undefined })).data;
          if (!list.some((conversation) => conversation._id === created._id)) list = [created, ...list];
          if (!cancelled) { setConversations(list); select(created); }
        } else if (!cancelled) {
          setConversations(list);
          const requested = list.find((conversation) => conversation._id === conversationId);
          if (requested) setSelected(requested);
        }
      } finally { if (!cancelled) setLoading(false); }
    };
    bootstrap();
    return () => { cancelled = true; };
  // URL bootstrap should run once; selection updates locally.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-0 py-0 md:px-8 md:py-10"><div className="overflow-hidden bg-paper-bright shadow-card md:rounded-[14px]" style={{ height: 'calc(100vh - 72px)', minHeight: 560 }}><div className="flex h-full"><aside className={`${selected ? 'hidden md:flex' : 'flex'} w-full flex-col border-r border-ink/10 md:w-80`}><div className="p-5"><h1 className="display-type text-4xl">Messages</h1><p className="mt-1 text-xs text-muted">Conversations and offers in one place.</p></div><div className="flex-1 overflow-y-auto">{loading ? <div className="space-y-3 p-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-[12px] bg-ink/10" />)}</div> : conversations.length === 0 ? <div className="px-6 py-12 text-center"><MessageCircle className="mx-auto h-8 w-8 text-ink/30" /><p className="mt-4 text-sm font-bold">No conversations yet</p><p className="mt-2 text-xs leading-5 text-muted">Open an item or service and choose Message to start.</p></div> : conversations.map((conversation) => { const other = otherParticipant(conversation); return <button key={conversation._id} onClick={() => select(conversation)} className={`flex min-h-20 w-full items-center gap-3 px-4 text-left transition hover:bg-ink/5 ${selected?._id === conversation._id ? 'bg-lime/25' : ''}`}><span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-xs font-extrabold text-paper">{other?.profileImage ? <img src={other.profileImage} alt="" className="h-full w-full object-cover" /> : getInitials(other?.name || '?')}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{other?.name || 'KOBO user'}</strong><span className="mt-1 block text-xs capitalize text-muted">{conversation.contextType === 'general' ? 'Direct message' : `About a ${conversation.contextType}`}</span></span><span className="text-[10px] text-ink/35">{formatRelativeTime(conversation.lastMessageAt)}</span></button>; })}</div></aside><main className={`${selected ? 'flex' : 'hidden md:flex'} min-w-0 flex-1 flex-col`}>{selected ? <><div className="border-b border-ink/10 p-2 md:hidden"><button onClick={() => { setSelected(null); setSearchParams({}); }} className="btn-ghost"><ArrowLeft className="h-4 w-4" />Back</button></div><ChatBox key={selected._id} conversation={selected} /></> : <div className="flex flex-1 items-center justify-center text-center"><div><MessageCircle className="mx-auto h-10 w-10 text-ink/25" /><p className="mt-4 text-sm font-bold text-muted">Choose a conversation</p></div></div>}</main></div></div></div>
  );
}
