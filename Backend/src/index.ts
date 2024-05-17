import { Server, Socket } from "socket.io"
import { UserManager } from "./managers/UserManager";

const io = new Server(8080, {
  cors: {
    origin: '*'
  }
});

const userManager = new UserManager();
io.on('connection', (socket: Socket) => {
  socket.on('user-connected', (data) => {
    const { name } = data;
    // Add the user to the user manager
    userManager.addUser(socket, name);
  });
  socket.on("disconnect", () => {
    userManager.removeUser(socket.id);
  })
})
