import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

let socketInstance = null;

export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (user && !socketInstance) {
      const socketUrl = import.meta.env.PROD ? 'https://campusconnect-1a9b.onrender.com' : '/';
      socketInstance = io(socketUrl, {
        query: { userId: user._id },
        transports: ['websocket'],
      });
    }
    socketRef.current = socketInstance;

    return () => {
      // keep socket alive across navigation
    };
  }, [user]);

  return socketRef.current;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
