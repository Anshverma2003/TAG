import { useEffect, useRef, forwardRef } from 'react';
import { socket } from '../socket/socket';
import { MAPS, PLAYER_SPEED } from '../utils/constants';

const GameCanvas = forwardRef(({ gameState, playerId, roomData }, ref) => {
  const canvasRef = useRef(null);
  const keysPressed = useRef({});
  const lastUpdateTime = useRef(Date.now());
  const gameStateRef = useRef(gameState);
  const animationFrameId = useRef(null);
  const localPlayerPos = useRef({ x: 0, y: 0 }); // Client-side prediction
  const interpolatedPlayers = useRef(new Map()); // Smooth interpolation for other players

  const mapData = MAPS[roomData.settings.mapId];

  // Update gameState ref and interpolation targets when it changes
  useEffect(() => {
    gameStateRef.current = gameState;
    
    // Update interpolation targets for all players
    if (gameState && gameState.players) {
      gameState.players.forEach((player) => {
        if (player.id === playerId) {
          // Only update local player if not moving (sync with server)
          if (!keysPressed.current['w'] && !keysPressed.current['a'] && 
              !keysPressed.current['s'] && !keysPressed.current['d'] &&
              !keysPressed.current['arrowup'] && !keysPressed.current['arrowleft'] &&
              !keysPressed.current['arrowdown'] && !keysPressed.current['arrowright']) {
            localPlayerPos.current = { x: player.x, y: player.y };
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
        localPlayerPos.current = { x: localPlayer.x, y: localPlayer.y };
      }
    }

    // Handle keyboard input
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
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

    // Check collision with obstacles
    const checkCollision = (x, y, radius) => {
      for (const obstacle of mapData.obstacles) {
        const closestX = Math.max(obstacle.x, Math.min(x, obstacle.x + obstacle.width));
        const closestY = Math.max(obstacle.y, Math.min(y, obstacle.y + obstacle.height));
        const distanceX = x - closestX;
        const distanceY = y - closestY;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;
        if (distanceSquared < radius * radius) {
          return true;
        }
      }
      return false;
    };

    const renderGame = (ctx, deltaTime) => {
      // Clear canvas
      ctx.fillStyle = mapData.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
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

      // Draw obstacles
      mapData.obstacles.forEach((obstacle) => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Add border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
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
            const lerpFactor = Math.min(deltaTime * 10, 1); // Adjust speed of interpolation
            renderX = currentPos.x + (targetX - currentPos.x) * lerpFactor;
            renderY = currentPos.y + (targetY - currentPos.y) * lerpFactor;
            
            // Update interpolated position
            interpolatedPlayers.current.set(player.id, { x: renderX, y: renderY });
          }

          // Player shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.beginPath();
          ctx.arc(renderX + 3, renderY + 3, mapData.playerSize / 2, 0, Math.PI * 2);
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
      const deltaTime = (now - lastUpdateTime.current) / 1000;
      lastUpdateTime.current = now;

      // Calculate movement
      let dx = 0;
      let dy = 0;

      if (keysPressed.current['w'] || keysPressed.current['arrowup']) dy -= 1;
      if (keysPressed.current['s'] || keysPressed.current['arrowdown']) dy += 1;
      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) dx -= 1;
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) dx += 1;

      // Normalize diagonal movement
      if (dx !== 0 && dy !== 0) {
        dx *= 0.707;
        dy *= 0.707;
      }

      // Client-side prediction: Update local player position immediately
      if (dx !== 0 || dy !== 0) {
        const speed = PLAYER_SPEED * deltaTime;
        let newX = localPlayerPos.current.x + dx * speed;
        let newY = localPlayerPos.current.y + dy * speed;

        // Check boundaries
        const playerRadius = mapData.playerSize / 2;
        newX = Math.max(playerRadius, Math.min(mapData.width - playerRadius, newX));
        newY = Math.max(playerRadius, Math.min(mapData.height - playerRadius, newY));

        // Check collision with obstacles
        if (!checkCollision(newX, newY, playerRadius)) {
          localPlayerPos.current.x = newX;
          localPlayerPos.current.y = newY;
        }

        // Send movement to server (server is authoritative)
        socket.emit('playerMove', { dx, dy });
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
