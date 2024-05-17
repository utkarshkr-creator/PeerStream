"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const UserManager_1 = require("./managers/UserManager");
const io = new socket_io_1.Server(8080, {
    cors: {
        origin: '*'
    }
});
const userManager = new UserManager_1.UserManager();
io.on('connection', (socket) => {
    socket.on('user-connected', (data) => {
        const { name } = data;
        // Add the user to the user manager
        userManager.addUser(socket, name);
    });
    socket.on("disconnect", () => {
        userManager.removeUser(socket.id);
    });
});
