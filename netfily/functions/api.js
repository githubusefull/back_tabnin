const express = require("express");
const http = require("http");
const cors = require("cors");
const serverless = require("serverless-http");
const { Router } = require("express");

const app = express(); // Correctly initialize the Express app
const server = http.createServer(app);
const route = Router();
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket"],
});

// Middleware
app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.send("Running");
});

// Socket.io logic
io.on("connection", (socket) => {
  console.log("user connected:", socket.id);
  socket.emit("me", socket.id);

  socket.on("disconnect", (reason) => {
    console.log("User disconnected:", socket.id, "Reason:", reason);
    socket.broadcast.emit("callEnded");
  });

  socket.on("userCall", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("userCall", { signal: signalData, from, name });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

//const PORT = process.env.PORT || 5000;
//server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

app.use('/api', route)
export const handler = serverless(app);