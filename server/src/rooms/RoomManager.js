export class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.playerRooms = new Map(); // Maps playerId to roomCode
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  createRoom(playerId, playerName, settings) {
    const code = this.generateRoomCode();
    
    const room = {
      code,
      hostId: playerId,
      status: 'waiting', // waiting, playing
      settings: {
        isPrivate: settings.isPrivate || false,
        mapId: settings.mapId || 'forest',
        duration: settings.duration || 300, // seconds
      },
      players: [
        {
          id: playerId,
          name: playerName,
          ready: true,
        },
      ],
      createdAt: Date.now(),
    };

    this.rooms.set(code, room);
    this.playerRooms.set(playerId, code);

    return room;
  }

  joinRoom(playerId, playerName, roomCode) {
    const room = this.rooms.get(roomCode);
    
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.status === 'playing') {
      throw new Error('Game already in progress');
    }

    if (room.players.length >= 8) {
      throw new Error('Room is full');
    }

    // Check if player already in room
    if (room.players.some(p => p.id === playerId)) {
      return room;
    }

    room.players.push({
      id: playerId,
      name: playerName,
      ready: false,
    });

    this.playerRooms.set(playerId, roomCode);

    return room;
  }

  removePlayer(playerId) {
    const roomCode = this.playerRooms.get(playerId);
    if (!roomCode) return;

    const room = this.rooms.get(roomCode);
    if (!room) return;

    // Remove player from room
    room.players = room.players.filter(p => p.id !== playerId);
    this.playerRooms.delete(playerId);

    // If room is empty, delete it
    if (room.players.length === 0) {
      this.rooms.delete(roomCode);
      return null;
    }

    // If host left, assign new host
    if (room.hostId === playerId && room.players.length > 0) {
      room.hostId = room.players[0].id;
    }

    return room;
  }

  getRoom(roomCode) {
    return this.rooms.get(roomCode);
  }

  getPlayerRoom(playerId) {
    const roomCode = this.playerRooms.get(playerId);
    return roomCode ? this.rooms.get(roomCode) : null;
  }

  updateRoomStatus(roomCode, status) {
    const room = this.rooms.get(roomCode);
    if (room) {
      room.status = status;
    }
  }

  getAllPublicRooms() {
    return Array.from(this.rooms.values())
      .filter(room => !room.settings.isPrivate && room.status === 'waiting');
  }
}
