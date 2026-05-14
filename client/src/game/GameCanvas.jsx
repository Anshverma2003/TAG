import { useEffect, useRef, forwardRef } from 'react';
import { socket } from '../socket/socket';
import { MAPS, PLAYER_SPEED, JUMP_FORCE, GRAVITY } from '../utils/constants';

const GameCanvas = forwardRef(({ gameState, playerId, roomData }, ref) => {
  const canvasRef = useRef(null);
  const keysPressed = useRef({});
  const lastUpdateTime = useRef(Date.now());
  const gameStateRef = useRef(gameState);
  const animationFrameId = useRef(null);
  const localPlayerPos = useRef({ x: 0, y: 0, vy: 0 }); // Client-side prediction with vertical velocity
  const interpolatedPlayers = useRef(new Map()); // Smooth interpolation for other players

  const mapData = MAPS[roomData.settings.mapId];

  // Update gameState ref and interpolation targets when it changes
  useEffect(() => {
    gameStateRef.current = gameState;
    
    // Update interpolation targets for all players
    if (gameState && gameState.players) {
      gameState.players.forEach((player) => {
        if (player.id === playerId) {
          // Sync with server position periodically
          const currentPlayer = gameState.players.find(p => p.id === playerId);
          if (currentPlayer) {
            // Soft sync to avoid jitter
            const distX = Math.abs(localPlayerPos.current.x - currentPlayer.x);
            const distY = Math.abs(localPlayerPos.current.y - currentPlayer.y);
            if (distX > 50 || distY > 50) {
              localPlayerPos.current.x = currentPlayer.x;
              localPlayerPos.current.y = currentPlayer.y;
              localPlayerPos.current.vy = currentPlayer.vy || 0;
            }
          }
        } else {
          // Set interpolation target for other players
          if (!interpolatedPlayers.current.has(player.id)) {
            interpolatedPlayers.current.set(player.id, { x: player.x, y: player.y });
          }
        }
      });
    }
  }, [gameState, playerId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = mapData.width;
    canvas.height = mapData.height;

    // Initialize local player position
    if (gameState && gameState.players) {
      const localPlayer = gameState.players.find(p => p.id === playerId);
      if (localPlayer) {
        localPlayerPos.current = { 
          x: localPlayer.x, 
          y: localPlayer.y,
          vy: localPlayer.vy || 0
        };
      }
    }

    // Handle keyboard input - Only left/right and jump
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (['a', 'd', 'arrowleft', 'arrowright', ' '].includes(key)) {
        e.preventDefault();
        keysPressed.current[key] = true;
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      keysPressed.current[key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Check if player is on ground (standing on a platform)
    const isOnGround = (x, y, radius) => {
      const feet = y + radius;
      
      for (const obstacle of mapData.obstacles) {
        // Check if feet are touching top of platform
        if (x + radius > obstacle.x && 
            x - radius < obstacle.x + obstacle.width &&
            feet >= obstacle.y &&
            feet <= obstacle.y + 5) {
          return { onGround: true, groundY: obstacle.y - radius };
        }
      }
      
      // Check bottom boundary
      if (feet >= mapData.height) {
        return { onGround: true, groundY: mapData.height - radius };
      }
      
      return { onGround: false, groundY: null };
    };

    // Check horizontal collision
    const checkHorizontalCollision = (x, y, radius, direction) => {
      for (const obstacle of mapData.obstacles) {
        // Simple box collision for sides
        if (y + radius > obstacle.y && 
            y - radius < obstacle.y + obstacle.height) {
          if (direction > 0 && x + radius >= obstacle.x && x - radius < obstacle.x) {
            return true; // Hitting right side
          }
          if (direction < 0 && x - radius <= obstacle.x + obstacle.width && x + radius > obstacle.x + obstacle.width) {
            return true; // Hitting left side
          }
        }
      }
      return false;
    };

    const renderGame = (ctx, deltaTime) => {
      // Clear canvas
      ctx.fillStyle = mapData.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid (lighter for platformer feel)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw obstacles (platforms)
      mapData.obstacles.forEach((obstacle) => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Add 3D border effect
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 3;
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Top highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(obstacle.x, obstacle.y);
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y);
        ctx.stroke();
      });

      // Draw players
      const currentGameState = gameStateRef.current;
      if (currentGameState && currentGameState.players) {
        currentGameState.players.forEach((player) => {
          const isMe = player.id === playerId;
          const isTagger = player.isTagger;
          
          let renderX, renderY;
          
          if (isMe) {
            // Use client-side predicted position for local player
            renderX = localPlayerPos.current.x;
            renderY = localPlayerPos.current.y;
          } else {
            // Interpolate other players for smooth movement
            const currentPos = interpolatedPlayers.current.get(player.id) || { x: player.x, y: player.y };
            const targetX = player.x;
            const targetY = player.y;
            
            // Smooth interpolation (lerp)
            const lerpFactor = Math.min(deltaTime * 10, 1);
            renderX = currentPos.x + (targetX - currentPos.x) * lerpFactor;
            renderY = currentPos.y + (targetY - currentPos.y) * lerpFactor;
            
            // Update interpolated position
            interpolatedPlayers.current.set(player.id, { x: renderX, y: renderY });
          }

          // Player shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.beginPath();
          ctx.arc(renderX + 2, renderY + 2, mapData.playerSize / 2, 0, Math.PI * 2);
          ctx.fill();

          // Player body
          ctx.fillStyle = isTagger ? '#ef4444' : '#10b981';
          ctx.beginPath();
          ctx.arc(renderX, renderY, mapData.playerSize / 2, 0, Math.PI * 2);
          ctx.fill();

          // Player outline
          ctx.strokeStyle = isMe ? '#fbbf24' : '#ffffff';
          ctx.lineWidth = isMe ? 4 : 2;
          ctx.beginPath();
          ctx.arc(renderX, renderY, mapData.playerSize / 2, 0, Math.PI * 2);
          ctx.stroke();

          // Player eyes (for direction indication)
          if (!isTagger) {
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(renderX - 3, renderY - 2, 2, 0, Math.PI * 2);
            ctx.arc(renderX + 3, renderY - 2, 2, 0, Math.PI * 2);
            ctx.fill();
          }

          // Player name
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          
          // Name background
          const nameWidth = ctx.measureText(player.name).width;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(
            renderX - nameWidth / 2 - 4,
            renderY + mapData.playerSize / 2 + 4,
            nameWidth + 8,
            16
          );
          
          // Name text
          ctx.fillStyle = '#ffffff';
          ctx.fillText(player.name, renderX, renderY + mapData.playerSize / 2 + 6);

          // Status indicator
          if (isMe) {
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 10px Arial';
            ctx.fillText('YOU', renderX, renderY - mapData.playerSize / 2 - 8);
          }
        });
      }
    };

    // Game loop using requestAnimationFrame
    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = Math.min((now - lastUpdateTime.current) / 1000, 0.1); // Cap delta time
      lastUpdateTime.current = now;

      // Horizontal movement only
      let dx = 0;
      
      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) dx -= 1;
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) dx += 1;

      const playerRadius = mapData.playerSize / 2;
      
      // Apply horizontal movement
      if (dx !== 0) {
        const speed = PLAYER_SPEED * deltaTime;
        let newX = localPlayerPos.current.x + dx * speed;
        
        // Check boundaries
        newX = Math.max(playerRadius, Math.min(mapData.width - playerRadius, newX));
        
        // Check horizontal collision
        if (!checkHorizontalCollision(newX, localPlayerPos.current.y, playerRadius, dx)) {
          localPlayerPos.current.x = newX;
        }
      }

      // Apply gravity
      localPlayerPos.current.vy += GRAVITY * deltaTime;
      
      // Apply vertical velocity
      let newY = localPlayerPos.current.y + localPlayerPos.current.vy * deltaTime;
      
      // Check ground collision
      const { onGround, groundY } = isOnGround(localPlayerPos.current.x, newY, playerRadius);
      
      if (onGround) {
        localPlayerPos.current.y = groundY;
        localPlayerPos.current.vy = 0;
        
        // Jump with spacebar
        if (keysPressed.current[' ']) {
          localPlayerPos.current.vy = -JUMP_FORCE;
          keysPressed.current[' '] = false; // Prevent continuous jumping
        }
      } else {
        localPlayerPos.current.y = newY;
      }

      // Send movement to server
      if (dx !== 0 || keysPressed.current[' ']) {
        socket.emit('playerMove', { dx, jump: keysPressed.current[' '] });
      }

      // Render game
      renderGame(ctx, deltaTime);

      // Continue loop
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    // Start game loop
    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playerId, roomData, mapData]);

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        className="border-4 border-gray-700"
        style={{ imageRendering: 'crisp-edges' }}
      />
    </div>
  );
});

GameCanvas.displayName = 'GameCanvas';

export default GameCanvas;
