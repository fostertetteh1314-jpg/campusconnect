import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { getAccessToken } from '../api';

let socketInstance = null;

export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (user && !socketInstance) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || '/';
      socketInstance = io(socketUrl, {
        auth: (callback) => callback({ token: getAccessToken() }),
        transports: ['websocket'],
        reconnectionDelayMax: 5_000,
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
