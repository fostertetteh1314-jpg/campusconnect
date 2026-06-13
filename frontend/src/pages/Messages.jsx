import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import ChatBox from '../components/ChatBox';
import { useAuth } from '../context/AuthContext';
import { getInitials, formatRelativeTime } from '../utils/helpers';

export default function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const toId = searchParams.get('to');
  const toName = searchParams.get('name');

  useEffect(() => {
    api.get('/messages/conversations')
      .then((r) => setConversations(r.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (toId && toName) {
      setSelectedUser({ _id: toId, name: decodeURIComponent(toName), profileImage: null });
    }
  }, [toId, toName]);

  const getOther = (msg) => {
    if (!msg) return null;
    const sender = msg.senderId;
    const receiver = msg.receiverId;
    if ((sender?._id || sender) === user?._id) return receiver;
    return sender;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      <div className="card overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className={`w-full md:w-72 border-r border-gray-200 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-600">Conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(4)].map((_, i) => <div key={i} className="flex gap-3 animate-pulse"><div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" /><div className="flex-1 space-y-2"><div className="h-3 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div></div>)}
                </div>
              ) : conversations.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8 px-4">No conversations yet</p>
              ) : (
                conversations.map((msg) => {
                  const other = getOther(msg);
                  if (!other) return null;
                  const otherId = other?._id || other;
                  const isSelected = selectedUser?._id === otherId;
                  return (
                    <button
                      key={msg._id}
                      onClick={() => setSelectedUser(other)}
                      className={`w-full text-left px-3 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                    >
                      {other?.profileImage ? (
                        <img src={other.profileImage} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {getInitials(other?.name || '?')}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{other?.name || 'User'}</p>
                        <p className="text-xs text-gray-400 truncate">{msg.message}</p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{formatRelativeTime(msg.createdAt)}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
            {selectedUser ? (
              <>
                <div className="md:hidden px-4 py-3 border-b border-gray-200">
                  <button onClick={() => setSelectedUser(null)} className="text-sm text-blue-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                </div>
                <ChatBox
                  key={selectedUser._id}
                  recipientId={selectedUser._id || selectedUser}
                  recipientName={selectedUser.name || 'User'}
                  recipientImage={selectedUser.profileImage}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="text-4xl mb-3">💬</p>
                  <p>Select a conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
