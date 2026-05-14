import { MAPS } from '../game/maps.js';

const PLAYER_SPEED = 250; // pixels per second
const JUMP_FORCE = 500; // Jump velocity
const GRAVITY = 1400; // Gravity acceleration
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
        onGround: false,
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

      // Update player positions with platformer physics
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

  updatePlayerMovement(roomCode, playerId, dx, jump) {
    const gameState = this.games.get(roomCode);
    if (!gameState) return;

    const player = gameState.players.find(p => p.id === playerId);
    if (player) {
      // Horizontal movement
      player.vx = dx * PLAYER_SPEED;
      
      // Jump (only if on ground)
      if (jump && player.onGround) {
        player.vy = -JUMP_FORCE;
        player.onGround = false;
      }
    }
  }

  // Check if player is standing on a platform
  isPlayerOnGround(player, mapData) {
    // Only check ground when falling or stationary (not when jumping up)
    if (player.vy < -5) return { onGround: false, groundY: null };
    
    const playerRadius = mapData.playerSize / 2;
    const feet = player.y + playerRadius;
    
    for (const obstacle of mapData.obstacles) {
      // Check if feet are touching top of platform
      if (player.x + playerRadius > obstacle.x && 
          player.x - playerRadius < obstacle.x + obstacle.width &&
          feet >= obstacle.y - 2 &&
          feet <= obstacle.y + 8 &&
          player.vy >= 0) {
        return { onGround: true, groundY: obstacle.y - playerRadius };
      }
    }
    
    // Check bottom boundary
    if (feet >= mapData.height - 2) {
      return { onGround: true, groundY: mapData.height - playerRadius };
    }
    
    return { onGround: false, groundY: null };
  }

  // Check horizontal collision with obstacles
  checkHorizontalCollision(player, newX, mapData) {
    const playerRadius = mapData.playerSize / 2;
    
    for (const obstacle of mapData.obstacles) {
      // Check if player is at same height as obstacle (not standing on top)
      if (player.y + playerRadius > obstacle.y + 5 && 
          player.y - playerRadius < obstacle.y + obstacle.height) {
        
        // Check right side collision
        if (player.vx > 0 && newX + playerRadius >= obstacle.x && newX + playerRadius <= obstacle.x + 5) {
          return obstacle.x - playerRadius;
        }
        
        // Check left side collision
        if (player.vx < 0 && newX - playerRadius <= obstacle.x + obstacle.width && newX - playerRadius >= obstacle.x + obstacle.width - 5) {
          return obstacle.x + obstacle.width + playerRadius;
        }
      }
    }
    
    return newX;
  }

  // Check ceiling collision
  checkCeilingCollision(player, mapData) {
    if (player.vy >= 0) return false; // Only check when moving up
    
    const playerRadius = mapData.playerSize / 2;
    const head = player.y - playerRadius;
    
    for (const obstacle of mapData.obstacles) {
      if (player.x + playerRadius > obstacle.x && 
          player.x - playerRadius < obstacle.x + obstacle.width &&
          head <= obstacle.y + obstacle.height &&
          head >= obstacle.y + obstacle.height - 8) {
        return true;
      }
    }
    return false;
  }

  updatePlayerPositions(gameState, mapData, deltaTime) {
    const playerRadius = mapData.playerSize / 2;
    
    gameState.players.forEach(player => {
      // Apply gravity
      player.vy += GRAVITY * deltaTime;
      
      // Cap falling speed
      player.vy = Math.min(player.vy, 800);
      
      // Check ceiling collision
      if (this.checkCeilingCollision(player, mapData)) {
        player.vy = 0; // Stop upward movement
      }
      
      // Update horizontal position
      let newX = player.x + player.vx * deltaTime;
      
      // Check map boundaries
      newX = Math.max(playerRadius, Math.min(mapData.width - playerRadius, newX));
      
      // Check horizontal collision with obstacles
      newX = this.checkHorizontalCollision(player, newX, mapData);
      player.x = newX;
      
      // Update vertical position
      let newY = player.y + player.vy * deltaTime;
      
      // Check ground collision
      const { onGround, groundY } = this.isPlayerOnGround(
        { ...player, y: newY }, 
        mapData
      );
      
      if (onGround) {
        player.y = groundY;
        player.vy = 0;
        player.onGround = true;
      } else {
        player.y = newY;
        player.onGround = false;
      }
      
      // Apply friction to horizontal movement
      player.vx *= 0.88;
      
      // Stop if velocity is very small
      if (Math.abs(player.vx) < 3) player.vx = 0;
    });
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
