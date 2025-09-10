const { Server } = require("socket.io");
const {
  addUserToBoard,
  removeUserFromBoard,
  getUsersInBoard,
} = require("../services/boardRedisService");

function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log("⚡ New client connected:", socket.id);

    // ----- Join Board Room -----
    socket.on("join-board", async ({ boardId, userId }) => {
      try {
        socket.join(boardId);
        console.log(`${userId} joined board ${boardId}`);

        // Update Redis presence
        await addUserToBoard(boardId, userId);

        // Broadcast updated presence
        const users = await getUsersInBoard(boardId);
        io.to(boardId).emit("presence-update", users);
      } catch (err) {
        console.error("Error joining board:", err);
      }
    });

    // ----- Leave Board Room -----
    socket.on("leave-board", async ({ boardId, userId }) => {
      try {
        socket.leave(boardId);
        console.log(`${userId} left board ${boardId}`);

        // Update Redis presence
        await removeUserFromBoard(boardId, userId);

        // Broadcast updated presence
        const users = await getUsersInBoard(boardId);
        io.to(boardId).emit("presence-update", users);
      } catch (err) {
        console.error("Error leaving board:", err);
      }
    });

    // ----- Card Events -----
    socket.on("card-created", (data) => {
      io.to(data.boardId).emit("card-created", data);
    });

    socket.on("card-updated", (data) => {
      io.to(data.boardId).emit("card-updated", data);
    });

    socket.on("card-moved", (data) => {
      io.to(data.boardId).emit("card-moved", data);
    });

    socket.on("card-deleted", (data) => {
      io.to(data.boardId).emit("card-deleted", data);
    });

    // ----- User Typing -----
    socket.on("user-typing", (data) => {
      io.to(data.boardId).emit("user-typing", data);
    });

    // ----- Disconnect -----
    socket.on("disconnect", async () => {
      console.log("Client disconnected:", socket.id);
      // Optional: handle cleanup here if you store socket-user mapping
    });
  });
}

module.exports = initSocket;
