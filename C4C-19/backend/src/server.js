const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

dotenv.config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const voiceRoutes = require("./routes/voiceRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const profileRoutes = require("./routes/profileRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const http = require("http");

const { Server } = require("socket.io");

const socketHandler =
  require("./socket/socketHandler");

const {
  initializeSocket
} = require("./services/realtimeService");
const app = express();

const logger = require("./utils/logger");

const errorHandler =
  require("./middleware/errorMiddleware");

const notFound =
  require("./middleware/notFoundMiddleware");

const {
  helmet,
  limiter
} = require("./config/security");

const awarenessRoutes =
  require("./routes/awarenessRoutes");

const languageRoutes =
  require("./routes/languageRoutes");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});


socketHandler(io);

initializeSocket(io);

connectDB();

app.use(cors());
app.use(helmet());

app.use(limiter);

app.use(logger);
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Arogya AI Backend Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/predict", predictionRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/awareness", awarenessRoutes);
app.use("/api/languages", languageRoutes);

const PORT = process.env.PORT || 5000;

app.use(notFound);

app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});