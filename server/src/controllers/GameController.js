import { MAPS } from '../game/maps.js';

const PLAYER_SPEED = 200; // pixels per second
const TAG_DISTANCE = 30; // distance to tag
const UPDATE_RATE = 1000 / 60; // 60 FPS

export class GameController {
  constructor() {
    this.games = new Map(); // roomCode -> gameState
    this.gameLoops = new Map(); // roomCode -> intervalId
  }

  startGame(room) {
    const mapData = MAPS[room.settings.mapId];
    
    // Initialize player positions
    const players = room.players.map((player, index) => {
      const spawnPoint = mapData.spawnPoints[index % mapData.spawnPoints.length];
      return {
        id: player.id,
        name: player.name,
        x: spawnPoint.x,
        y: spawnPoint.y,
        vx: 0,
        vy: 0,
        isTagger: false,
      };
    });

    // Select random initial tagger
    const randomIndex = Math.floor(Math.random() * players.length);
    players[randomIndex].isTagger = true;
    const initialTagger = players[randomIndex].id;

    const gameState = {
      roomCode: room.code,
      mapId: room.settings.mapId,
      players,
      startTime: Date.now(),
      timeRemaining: room.settings.duration,
      status: 'playing',
      initialTagger,
    };

    this.games.set(room.code, gameState);
    return gameState;
  }

  startGameLoop(roomCode, onUpdate, onGameEnd) {
    const gameState = this.games.get(roomCode);
    if (!gameState) return;

    const mapData = MAPS[gameState.mapId];
    let lastUpdate = Date.now();

    const gameLoop = setInterval(() => {
      const now = Date.now();
      const deltaTime = (now - lastUpdate) / 1000;
      lastUpdate = now;

      // Update time remaining
      gameState.timeRemaining = Math.max(
        0,
        gameState.timeRemaining - deltaTime
      );

      // Update player positions
      this.updatePlayerPositions(gameState, mapData, deltaTime);

      // Check for collisions/tags
      this.checkTagCollisions(gameState);

      // Check win conditions
      const gameEnded = this.checkWinConditions(gameState);

      if (gameEnded) {
        clearInterval(gameLoop);
        this.gameLoops.delete(roomCode);
        
        const results = this.generateResults(gameState);
        onGameEnd(results);
        this.games.delete(roomCode);
      } else {
        onUpdate(gameState);
      }
    }, UPDATE_RATE);

    this.gameLoops.set(roomCode, gameLoop);
  }

  updatePlayerMovement(roomCode, playerId, dx, dy) {
    const gameState = this.games.get(roomCode);
    if (!gameState) return;

    const player = gameState.players.find(p => p.id === playerId);
    if (player) {
      player.vx = dx * PLAYER_SPEED;
      player.vy = dy * PLAYER_SPEED;
    }
  }

  updatePlayerPositions(gameState, mapData, deltaTime) {
    gameState.players.forEach(player => {
      // Calculate new position
      let newX = player.x + player.vx * deltaTime;
      let newY = player.y + player.vy * deltaTime;

      // Check map boundaries
      const playerRadius = mapData.playerSize / 2;
      newX = Math.max(playerRadius, Math.min(mapData.width - playerRadius, newX));
      newY = Math.max(playerRadius, Math.min(mapData.height - playerRadius, newY));

      // Check obstacle collisions
      let collided = false;
      for (const obstacle of mapData.obstacles) {
        if (this.checkRectCircleCollision(obstacle, newX, newY, playerRadius)) {
          collided = true;
          break;
        }
      }

      // Only update position if no collision
      if (!collided) {
        player.x = newX;
        player.y = newY;
      }

      // Apply friction
      player.vx *= 0.9;
      player.vy *= 0.9;

      // Stop if velocity is very small
      if (Math.abs(player.vx) < 1) player.vx = 0;
      if (Math.abs(player.vy) < 1) player.vy = 0;
    });
  }

  checkRectCircleCollision(rect, cx, cy, radius) {
    // Find closest point on rectangle to circle center
    const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));

    // Calculate distance
    const distanceX = cx - closestX;
    const distanceY = cy - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;

    return distanceSquared < radius * radius;
  }

  checkTagCollisions(gameState) {
    const taggers = gameState.players.filter(p => p.isTagger);
    const survivors = gameState.players.filter(p => !p.isTagger);

    taggers.forEach(tagger => {
      survivors.forEach(survivor => {
        const distance = Math.sqrt(
          Math.pow(tagger.x - survivor.x, 2) +
          Math.pow(tagger.y - survivor.y, 2)
        );

        if (distance < TAG_DISTANCE) {
          survivor.isTagger = true;
          console.log(`🏷️ ${tagger.name} tagged ${survivor.name}!`);
        }
      });
    });
  }

  checkWinConditions(gameState) {
    // Time's up
    if (gameState.timeRemaining <= 0) {
      return true;
    }

    // All players are taggers
    const allTaggers = gameState.players.every(p => p.isTagger);
    if (allTaggers) {
      return true;
    }

    return false;
  }

  generateResults(gameState) {
    const taggers = gameState.players.filter(p => p.isTagger);
    const survivors = gameState.players.filter(p => !p.isTagger);
    
    const allTagged = survivors.length === 0;
    const winningTeam = allTagged ? 'taggers' : 'players';
    
    const winners = allTagged 
      ? taggers.map(p => p.id)
      : survivors.map(p => p.id);

    return {
      winningTeam,
      winners,
      taggers: taggers.map(p => ({ id: p.id, name: p.name })),
      survivors: survivors.map(p => ({ id: p.id, name: p.name })),
      initialTagger: gameState.initialTagger,
      duration: Math.floor((Date.now() - gameState.startTime) / 1000),
      totalPlayers: gameState.players.length,
    };
  }

  stopGame(roomCode) {
    const intervalId = this.gameLoops.get(roomCode);
    if (intervalId) {
      clearInterval(intervalId);
      this.gameLoops.delete(roomCode);
    }
    this.games.delete(roomCode);
  }

  getGameState(roomCode) {
    return this.games.get(roomCode);
  }
}
