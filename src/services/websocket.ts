// src/services/websocket.ts
import Stomp from 'stompjs';
import { IUser } from '@/types/backend';
import SockJS from 'sockjs-client';

export class WebSocketService {
  private client: any;
  private user: IUser | null = null;

  constructor() {
    const socket = new SockJS(`${import.meta.env.VITE_BACKEND_URL}/ws`);
    this.client = Stomp.over(socket);
  }

  connect(
    user: IUser,
    onConnect: () => void,
    onMessage: (message: any) => void
  ) {
    this.user = user;
    this.client.connect(
      {},
      () => {
        this.client.subscribe(
          `/user/${user.email}/queue/messages`,
          (msg: any) => onMessage(JSON.parse(msg.body))
        );
        this.client.send(
          '/app/user.addUser',
          {},
          JSON.stringify({ email: user.email, status: 'ONLINE' })
        );
        onConnect();
      },
      (error: any) => console.error('Connection error:', error)
    );
  }

  disconnect() {
    if (this.user && this.client.connected) {
      this.client.send(
        '/app/user.disconnectUser',
        {},
        JSON.stringify({ email: this.user.email, status: 'OFFLINE' })
      );
      this.client.disconnect(() => console.log('Disconnected'));
    }
  }

  sendMessage(message: { content: string; sender: IUser; receiver: IUser }) {
    this.client.send('/app/chat', {}, JSON.stringify(message));
  }
}