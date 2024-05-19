"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    createRoom(user1, user2) {
        const roomId = Date.now().toString();
        this.rooms.set(roomId, {
            user1,
            user2,
        });
        user1.socket.emit("send-offer", {
            roomId,
            name: user1.name,
        });
        user2.socket.emit("send-offer", {
            roomId,
            name: user2.name,
        });
    }
    onOffer(roomId, sdp, senderSocketid) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const receiverUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        receiverUser === null || receiverUser === void 0 ? void 0 : receiverUser.socket.emit("offer", {
            sdp,
            roomId
        });
    }
    onEndCall(socketId, roomId) {
        console.log("room manager end call");
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const receiverUser = room.user1.socket.id === socketId ? room.user2 : room.user1;
        receiverUser.socket.emit("end-call");
    }
    onAnswer(roomId, sdp, senderSocketid) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const receiverUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        const senderUser = room.user1.socket.id === senderSocketid ? room.user1 : room.user2;
        receiverUser === null || receiverUser === void 0 ? void 0 : receiverUser.socket.emit("answer", {
            sdp,
            roomId,
            name: senderUser.name
        });
    }
    onIceCandidates(roomId, senderSocketid, candidate, type) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const receiverUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        receiverUser === null || receiverUser === void 0 ? void 0 : receiverUser.socket.emit("add-ice-candidate", ({ candidate, type }));
    }
}
exports.RoomManager = RoomManager;
