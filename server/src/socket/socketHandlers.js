import { RoomManager } from '../rooms/RoomManager.js';
import { GameController } from '../controllers/GameController.js';

const roomManager = new RoomManager();
const gameController = new GameController();

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`✅ Player connected: ${socket.id}`);

    // Room management events
    socket.on('createRoom', (data) => {
      handleCreateRoom(socket, data);
    });

    socket.on('joinRoom', (data) => {
      handleJoinRoom(socket, data);
    });

    socket.on('leaveRoom', () => {
      handleLeaveRoom(socket);
    });

    // Game events
    socket.on('startGame', () => {
      handleStartGame(socket);
    });

    socket.on('playerMove', (data) => {
      handlePlayerMove(socket, data);
    });

    // Disconnect
    socket.on('disconnect', () => {
      handleDisconnect(socket);
    });
  });
}

function handleCreateRoom(socket, data) {
  try {
    const { playerName, settings } = data;
    const room = roomManager.createRoom(socket.id, playerName, settings);
    
    socket.join(room.code);
    socket.emit('roomCreated', {
      playerId: socket.id,
      room: room,
    });

    console.log(`📦 Room created: ${room.code} by ${playerName}`);
  } catch (error) {
    socket.emit('roomError', { message: error.message });
  }
}

function handleJoinRoom(socket, data) {
  try {
    const { playerName, roomCode } = data;
    const room = roomManager.joinRoom(socket.id, playerName, roomCode);
    
    socket.join(room.code);
    socket.emit('roomJoined', {
      playerId: socket.id,
      room: room,
    });

    // Notify all players in the room
    socket.to(room.code).emit('roomUpdated', room);

    console.log(`👤 ${playerName} joined room: ${roomCode}`);
  } catch (error) {
    socket.emit('roomError', { message: error.message });
  }
}

function handleLeaveRoom(socket) {
  try {
    const room = roomManager.getPlayerRoom(socket.id);
    if (!room) return;

    roomManager.removePlayer(socket.id);
    socket.leave(room.code);

    // If room is empty or game is active, clean up
    const updatedRoom = roomManager.getRoom(room.code);
    if (updatedRoom) {
      socket.to(room.code).emit('roomUpdated', updatedRoom);
      socket.to(room.code).emit('playerDisconnected', { playerId: socket.id });
    }

    console.log(`👋 Player left room: ${room.code}`);
  } catch (error) {
    console.error('Error leaving room:', error);
  }
}

function handleStartGame(socket) {
  try {
    const room = roomManager.getPlayerRoom(socket.id);
    if (!room) {
      socket.emit('roomError', { message: 'Room not found' });
      return;
    }

    if (room.hostId !== socket.id) {
      socket.emit('roomError', { message: 'Only host can start the game' });
      return;
    }

    if (room.players.length < 2) {
      socket.emit('roomError', { message: 'Need at least 2 players' });
      return;
    }

    const gameState = gameController.startGame(room);
    roomManager.updateRoomStatus(room.code, 'playing');

    // Send initial game state to all players
    socket.to(room.code).emit('gameStarted', gameState);
    socket.emit('gameStarted', gameState);

    // Start game loop
    gameController.startGameLoop(room.code, (state) => {
      socket.to(room.code).emit('gameState', state);
      socket.emit('gameState', state);
    }, (results) => {
      // Game ended
      socket.to(room.code).emit('gameEnded', results);
      socket.emit('gameEnded', results);
      roomManager.updateRoomStatus(room.code, 'waiting');
      gameController.stopGame(room.code);
    });

    console.log(`🎮 Game started in room: ${room.code}`);
  } catch (error) {
    socket.emit('roomError', { message: error.message });
  }
}

function handlePlayerMove(socket, data) {
  try {
    const room = roomManager.getPlayerRoom(socket.id);
    if (!room || room.status !== 'playing') return;

    const { dx, dy } = data;
    gameController.updatePlayerMovement(room.code, socket.id, dx, dy);
  } catch (error) {
    console.error('Error handling player move:', error);
  }
}

function handleDisconnect(socket) {
  try {
    const room = roomManager.getPlayerRoom(socket.id);
    if (room) {
      roomManager.removePlayer(socket.id);
      
      const updatedRoom = roomManager.getRoom(room.code);
      if (updatedRoom) {
        socket.to(room.code).emit('roomUpdated', updatedRoom);
        socket.to(room.code).emit('playerDisconnected', { playerId: socket.id });
      } else {
        // Room was deleted
        gameController.stopGame(room.code);
      }
    }

    console.log(`❌ Player disconnected: ${socket.id}`);
  } catch (error) {
    console.error('Error handling disconnect:', error);
  }
}
