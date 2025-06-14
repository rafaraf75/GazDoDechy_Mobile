import { createContext, useEffect } from 'react';
import socket from '../socket';

export const SocketContext = createContext(socket);

export function SocketProvider({ children }) {
  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      console.log('Socket.IO connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}