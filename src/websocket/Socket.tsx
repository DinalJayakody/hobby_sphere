import { Client, StompSubscription } from "@stomp/stompjs";
import { API_BASE_URL } from "../config";

// chat-service registers a *raw* Spring WebSocket STOMP endpoint at "/ws"
// (WebSocketConfig.java calls registry.addEndpoint("/ws") with no
// .withSockJS()) — it does not speak the SockJS framing protocol at all.
// Connecting with the sockjs-client library here (as this file previously
// did) meant the client and server were speaking incompatible protocols;
// the handshake could silently never complete a real STOMP session. Native
// WebSocket, matching what the server actually implements, is the fix.
const WS_URL = `${API_BASE_URL.replace(/^http/, 'ws')}/ws`;

let stompClient: Client | null = null;
let connected = false;
// Actions requested before the STOMP handshake finishes (very plausible —
// a user can click a conversation within the first few hundred ms of
// landing on /chat) are queued here and flushed once onConnect fires,
// instead of throwing "There is no underlying STOMP connection".
let onConnectedQueue: Array<() => void> = [];

export type ConnectionState = "connecting" | "connected" | "disconnected";

const runWhenConnected = (fn: () => void) => {
  if (connected && stompClient?.connected) {
    fn();
  } else {
    onConnectedQueue.push(fn);
  }
};

export const connectSocket = (
  token: string,
  onMessage: (event: any) => void,
  onPresence: (event: any) => void,
  onInbox?: (event: any) => void,
  onError?: (event: any) => void,
  onStateChange?: (state: ConnectionState) => void
) => {
  // `token` already includes the "Bearer " prefix (AuthContext stores it as
  // `${type} ${token}`, e.g. "Bearer eyJ...") — do NOT prefix it again here,
  // or the header becomes "Bearer Bearer eyJ..." and chat-service's JWT
  // filter fails to authenticate the STOMP connection.
  const authHeader = token.startsWith("Bearer") ? token : `Bearer ${token}`;

  stompClient = new Client({
    brokerURL: WS_URL,
    connectHeaders: {
      Authorization: authHeader,
    },
    debug: () => {},
    reconnectDelay: 3000,
  });

  connected = false;
  onStateChange?.("connecting");

  stompClient.onConnect = () => {
    connected = true;
    onStateChange?.("connected");

    // Presence updates (online/offline/away for any user, not just this conversation)
    stompClient!.subscribe("/topic/presence", (msg) => {
      onPresence(JSON.parse(msg.body));
    });

    // Inbox-level updates: a message arrived in a conversation that may not
    // be the one currently open, so the conversation list can bump its
    // preview/unread badge without the user having that thread selected.
    if (onInbox) {
      stompClient!.subscribe("/user/queue/conversations", (msg) => {
        onInbox(JSON.parse(msg.body));
      });
    }

    // Server-rejected actions (e.g. sending into a conversation you're not
    // part of) come back here rather than as a thrown JS error.
    if (onError) {
      stompClient!.subscribe("/user/queue/errors", (msg) => {
        onError(JSON.parse(msg.body));
      });
    }

    // Flush anything requested while the handshake was still in flight.
    const queue = onConnectedQueue;
    onConnectedQueue = [];
    queue.forEach((fn) => fn());
  };

  stompClient.onWebSocketClose = () => {
    connected = false;
    onStateChange?.("disconnected");
  };
  stompClient.onStompError = () => {
    connected = false;
    onStateChange?.("disconnected");
  };

  stompClient.activate();
};

export const disconnectSocket = () => {
  connected = false;
  onConnectedQueue = [];
  stompClient?.deactivate();
  stompClient = null;
};

/**
 * Subscribes to a conversation's topic. Safe to call immediately after
 * `connectSocket` even before the handshake completes — the subscription is
 * queued and applied once connected. Returns a handle whose `unsubscribe()`
 * is always safe to call, whether or not the real subscription has happened
 * yet (it cancels the queued attempt if the connection isn't up yet).
 */
export const subscribeConversation = (convId: number, callback: (event: any) => void) => {
  let cancelled = false;
  let realSub: StompSubscription | undefined;

  runWhenConnected(() => {
    if (cancelled) return;
    realSub = stompClient?.subscribe(`/topic/conversation.${convId}`, (msg) => {
      callback(JSON.parse(msg.body));
    });
  });

  return {
    unsubscribe: () => {
      cancelled = true;
      realSub?.unsubscribe();
    },
  };
};

export const sendMessageWS = (payload: {
  conversationId: number;
  content: string;
  messageType?: string;
  replyToId?: number;
}) => {
  // Only the fields chat-service's WsEvent.SendMessageRequest actually
  // understands go over the wire — no client-generated id, since the
  // backend doesn't echo one back. Optimistic-send reconciliation on the
  // frontend matches by conversation + sender + content instead (see
  // ChatContext).
  runWhenConnected(() => {
    stompClient?.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(payload),
    });
  });
};

export const sendTypingWS = (conversationId: number, typing: boolean) => {
  runWhenConnected(() => {
    stompClient?.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify({ conversationId, typing }),
    });
  });
};

export const isSocketConnected = () => connected && !!stompClient?.connected;
