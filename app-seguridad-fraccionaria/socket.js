import { io } from 'socket.io-client';

const socket = io('http://192.168.0.103:3000', { autoConnect: true });

export default socket;