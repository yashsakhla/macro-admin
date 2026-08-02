import { io } from 'socket.io-client';
import { getToken } from './session';
import { BASE_URL } from './client';

// BASE_URL is like "http://localhost:3000/api" — the socket server lives on
// the same host, one level up from the /api prefix.
const SOCKET_URL = BASE_URL.replace(/\/api\/?$/, '');

// Opens a connection to the /support-chat namespace scoped to one ticket.
// Returns a handle to send messages and tear the connection down.
export function connectSupportChat(ticketId, { onHistory, onMessage, onError } = {}) {
  const socket = io(`${SOCKET_URL}/macropage-connect/support-chat`, {
    auth: { token: getToken() },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    socket.emit('joinTicket', { ticketId });
  });

  if (onHistory) socket.on('history', onHistory);
  if (onMessage) socket.on('newMessage', onMessage);
  if (onError) socket.on('connect_error', onError);

  function sendMessage({ senderType, senderId, message }) {
    socket.emit('sendMessage', { ticketId, senderType, senderId, message });
  }

  function disconnect() {
    socket.disconnect();
  }

  return { socket, sendMessage, disconnect };
}
