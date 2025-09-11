import { io } from "socket.io-client";

export default class SocketService {
  constructor({ url, getAuth = () => null, onConnect = () => {} } = {}) {
    this.url = url;
    this.getAuth = getAuth;
    this.socket = null;
    this.onConnect = onConnect;
  }

  connect() {
    if (this.socket) return this.socket;
    const token = this.getAuth();
    this.socket = io(this.url, {
      autoConnect: true,
      transports: ["websocket"],
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      this.onConnect();
      console.log("socket connected", this.socket.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("socket disconnected", reason);
    });

    return this.socket;
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }

  emit(event, payload) {
    if (this.socket) this.socket.emit(event, payload);
  }

  on(event, cb) {
    if (!this.socket) return;
    this.socket.on(event, cb);
  }

  off(event, cb) {
    if (!this.socket) return;
    this.socket.off(event, cb);
  }
}
