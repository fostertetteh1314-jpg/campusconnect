import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import api from '../api';
import { formatRelativeTime, getInitials } from '../utils/helpers';

export default function ChatBox({ recipientId, recipientName, recipientImage }) {
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/messages/${recipientId}`)
      .then((r) => setMessages(r.data))
      .finally(() => setLoading(false));
  }, [recipientId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    const handleNew = (msg) => {
      if (
        (msg.senderId._id === recipientId || msg.senderId === recipientId) &&
        msg.receiverId === user._id
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    const handleTyping = ({ senderId }) => {
      if (senderId === recipientId) setTyping(true);
    };
    const handleStop = ({ senderId }) => {
      if (senderId === recipientId) setTyping(false);
    };
    socket.on('newMessage', handleNew);
    socket.on('userTyping', handleTyping);
    socket.on('userStoppedTyping', handleStop);
    return () => {
      socket.off('newMessage', handleNew);
      socket.off('userTyping', handleTyping);
      socket.off('userStoppedTyping', handleStop);
    };
  }, [socket, recipientId, user._id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const msgText = text.trim();
    setText('');

    if (socket) {
      socket.emit('sendMessage', { receiverId: recipientId, message: msgText, senderId: user._id });
      socket.on('messageSent', (msg) => {
        setMessages((prev) => {
          if (prev.find((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        socket.off('messageSent');
      });
    } else {
      const res = await api.post('/messages', { receiverId: recipientId, message: msgText });
      setMessages((prev) => [...prev, res.data]);
    }
  };

  const handleTypingInput = (e) => {
    setText(e.target.value);
    if (!socket) return;
    socket.emit('typing', { receiverId: recipientId, senderId: user._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('stopTyping', { receiverId: recipientId, senderId: user._id });
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
        {recipientImage ? (
          <img src={recipientImage} alt={recipientName} className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
            {getInitials(recipientName)}
          </div>
        )}
        <div>
          <p className="font-semibold text-sm">{recipientName}</p>
          {typing && <p className="text-xs text-gray-400 animate-pulse">typing...</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => {
            const mine = (msg.senderId?._id || msg.senderId) === user._id;
            return (
              <div key={msg._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${mine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-gray-900 shadow-sm rounded-bl-sm'}`}>
                  <p>{msg.message}</p>
                  <p className={`text-xs mt-0.5 ${mine ? 'text-blue-200' : 'text-gray-400'}`}>
                    {formatRelativeTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="px-4 py-3 border-t border-gray-200 bg-white flex gap-2">
        <input
          value={text}
          onChange={handleTypingInput}
          placeholder="Type a message..."
          className="flex-1 input-field py-2 text-sm"
        />
        <button type="submit" disabled={!text.trim()} className="btn-primary py-2 px-4 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}
