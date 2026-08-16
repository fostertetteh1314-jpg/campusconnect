require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const createApp = require('./app');
const { buildCorsOptions } = require('./config/cors');
const initSocket = require('./socket/socket');

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: buildCorsOptions(),
  maxHttpBufferSize: 100_000,
});
initSocket(io);
app.set('io', io);

const PORT = process.env.PORT || 5000;

const start = async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters');
  }
  await connectDB();
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start().catch((error) => {
  console.error('Server startup failed', error);
  process.exit(1);
});

module.exports = { app, server };
