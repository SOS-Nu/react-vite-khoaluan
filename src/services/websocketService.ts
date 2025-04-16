// src/services/websocketService.ts
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface Message {
  id: number;
  senderEmail: string;
  receiverEmail: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

export class WebSocketService {
  private client: Client;
  private connected: boolean = false;
  private onMessageReceived: (message: Message) => void;

  constructor(private userEmail: string, onMessageReceived: (message: Message) => void) {
    this.onMessageReceived = onMessageReceived;
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        this.connected = true;
        console.log('Connected to WebSocket');
        this.subscribeToMessages();
      },
      onDisconnect: () => {
        this.connected = false;
        console.log('Disconnected from WebSocket');
      },
    });
  }

  connect() {
    this.client.activate();
  }

  disconnect() {
    this.client.deactivate();
  }

  private subscribeToMessages() {
    this.client.subscribe(`/topic/messages`, (message) => {
      const newMessage: Message = JSON.parse(message.body);
      this.onMessageReceived(newMessage);
    });
  }

  sendMessage(message: { senderEmail: string; receiverEmail: string; content: string }) {
    if (this.connected) {
      this.client.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(message),
      });
    }
  }

  markAsRead(messageId: number) {
    if (this.connected) {
      this.client.publish({
        destination: '/app/chat.markAsRead',
        body: JSON.stringify({ id: messageId }),
      });
    }
  }
}