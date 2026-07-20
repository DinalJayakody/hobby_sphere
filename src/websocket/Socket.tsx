// import SockJS from "sockjs-client";
// @ts-ignore
import SockJS from 'sockjs-client/dist/sockjs';
import { Client } from "@stomp/stompjs";
import { API_BASE_URL } from "../config";

let stompClient: Client;

export const connectSocket = (token: string, onMessage: any, onPresence: any) => {
  const socket = new SockJS(`${API_BASE_URL}/ws/websocket`);

  stompClient = new Client({
    webSocketFactory: () => socket,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    debug: () => {},
    reconnectDelay: 3000,
  });

  stompClient.onConnect = () => {
    // Presence updates
    stompClient.subscribe("/topic/presence", (msg) => {
      onPresence(JSON.parse(msg.body));
    });
  };

  stompClient.activate();
};

export const subscribeConversation = (convId: number, callback: any) => {
  stompClient.subscribe(`/topic/conversation.${convId}`, (msg) => {
    callback(JSON.parse(msg.body));
  });
};

export const sendMessageWS = (payload: any) => {
  stompClient.publish({
    destination: "/app/chat.send",
    body: JSON.stringify(payload),
  });
};