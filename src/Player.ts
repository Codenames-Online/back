import WebSocket = require('ws')

export class Player {
  id: string;
  name: string;
  socket: WebSocket;
  
  constructor(id: string, name: string, socket: WebSocket) {
    this.name = name;
    this.id = id;
    this.socket = socket;
  }

  toJSON() {
    return { id: this.id, name: this.name };
  }
}
