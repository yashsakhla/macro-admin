import { io } from 'socket.io-client';
import { getToken } from './session';
import { BASE_URL } from './client';

// BASE_URL is like "http://localhost:3000/api" — the socket server lives on
// the same host, one level up from the /api prefix.
const SOCKET_URL = BASE_URL.replace(/\/api\/?$/, '');

// Support chat was merged into connect's existing EventsGateway — it now
// connects on the default namespace instead of /macropage-connect/support-chat,
// and the join/send events were renamed to the ticket:* convention.
// Returns a handle to send messages and tear the connection down.
export function connectSupportChat(ticketId, { onHistory, onMessage, onError } = {}) {
  const socket = io(SOCKET_URL, {
    auth: { token: getToken() },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    socket.emit('ticket:join', { ticketId });
  });

  if (onHistory) socket.on('history', onHistory);
  if (onMessage) socket.on('newMessage', onMessage);
  if (onError) socket.on('connect_error', onError);

  function sendMessage({ senderType, senderId, message }) {
    socket.emit('ticket:message', { ticketId, senderType, senderId, message });
  }

  function disconnect() {
    socket.disconnect();
  }

  return { socket, sendMessage, disconnect };
}
