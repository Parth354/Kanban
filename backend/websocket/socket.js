const { Server } = require("socket.io");
const redis = require("../config/redis");

function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  // Board rooms
  io.on("connection", (socket) => {
    console.log("⚡ New client connected:", socket.id);

    // Join board room
    socket.on("join-board", async ({ boardId, userId }) => {
      socket.join(boardId);
      console.log(`${userId} joined board ${boardId}`);
      await redis.addUserToBoard(boardId, userId);
      const users = await redis.getUsersInBoard(boardId);
      io.to(boardId).emit("presence-update", users);
    });

    // Leave board room
    socket.on("leave-board", async ({ boardId, userId }) => {
      socket.leave(boardId);
      console.log(`${userId} left board ${boardId}`);
      await redis.removeUserFromBoard(boardId, userId);
      const users = await redis.getUsersInBoard(boardId);
      io.to(boardId).emit("presence-update", users);
    });

    // Card events
    socket.on("card-created", (data) => io.to(data.boardId).emit("card-created", data));
    socket.on("card-updated", (data) => io.to(data.boardId).emit("card-updated", data));
    socket.on("card-moved", (data) => io.to(data.boardId).emit("card-moved", data));
    socket.on("card-deleted", (data) => io.to(data.boardId).emit("card-deleted", data));

    // User typing
    socket.on("user-typing", (data) => io.to(data.boardId).emit("user-typing", data));

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

module.exports = initSocket;
