import { io } from 'socket.io-client';
import API_URL from './api';

const socket = io(API_URL, {
  transports: ['websocket'],
  path: '/socket.io',
});

export default socket;