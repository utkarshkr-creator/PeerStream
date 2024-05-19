import { User } from "./UserManager";

interface Room {
  user1: User,
  user2: User,
}

export class RoomManager {
  private rooms: Map<string, Room>
  public constructor() {
    this.rooms = new Map<string, Room>();
  }

  createRoom(user1: User, user2: User) {
    const roomId = Date.now().toString();
    this.rooms.set(roomId, {
      user1,
      user2,
    })
    user1.socket.emit("send-offer", {
      roomId,
      name: user1.name,
    })

    user2.socket.emit("send-offer", {
      roomId,
      name: user2.name,
    })
  }
  onOffer(roomId: string, sdp: string, senderSocketid: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const receiverUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
    receiverUser?.socket.emit("offer", {
      sdp,
      roomId
    })
  }
  onEndCall(socketId: string, roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const receiverUser = room.user1.socket.id === socketId ? room.user2 : room.user1;

    receiverUser.socket.emit("end-call");
  }
  onAnswer(roomId: string, sdp: string, senderSocketid: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const receiverUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
    const senderUser = room.user1.socket.id === senderSocketid ? room.user1 : room.user2;
    receiverUser?.socket.emit("answer", {
      sdp,
      roomId,
      name: senderUser.name
    });
  }
  onIceCandidates(roomId: string, senderSocketid: string, candidate: any, type: "sender" | "receiver") {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const receiverUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
    receiverUser?.socket.emit("add-ice-candidate", ({ candidate, type }));
  }

}
