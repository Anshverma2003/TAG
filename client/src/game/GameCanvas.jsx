import { useEffect, useRef, forwardRef } from 'react';
import { socket } from '../socket/socket';
import { MAPS, PLAYER_SPEED } from '../utils/constants';

const GameCanvas = forwardRef(({ gameState, playerId, roomData }, ref) => {
  const canvasRef = useRef(null);
  const keysPressed = useRef({});
  const lastUpdateTime = useRef(Date.now());
  const gameStateRef = useRef(gameState);
  const animationFrameId = useRef(null);

  const mapData = MAPS[roomData.settings.mapId];

  // Update gameState ref when it changes
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = mapData.width;
    canvas.height = mapData.height;

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

    const renderGame = (ctx) => {
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

      // Draw players using ref
      const currentGameState = gameStateRef.current;
      if (currentGameState && currentGameState.players) {
        currentGameState.players.forEach((player) => {
          const isMe = player.id === playerId;
          const isTagger = player.isTagger;

          // Player shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.beginPath();
          ctx.arc(player.x + 3, player.y + 3, mapData.playerSize / 2, 0, Math.PI * 2);
          ctx.fill();

          // Player body
          ctx.fillStyle = isTagger ? '#ef4444' : '#10b981';
          ctx.beginPath();
          ctx.arc(player.x, player.y, mapData.playerSize / 2, 0, Math.PI * 2);
          ctx.fill();

          // Player outline
          ctx.strokeStyle = isMe ? '#fbbf24' : '#ffffff';
          ctx.lineWidth = isMe ? 4 : 2;
          ctx.beginPath();
          ctx.arc(player.x, player.y, mapData.playerSize / 2, 0, Math.PI * 2);
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
            player.x - nameWidth / 2 - 4,
            player.y + mapData.playerSize / 2 + 4,
            nameWidth + 8,
            16
          );
          
          // Name text
          ctx.fillStyle = '#ffffff';
          ctx.fillText(player.name, player.x, player.y + mapData.playerSize / 2 + 6);

          // Status indicator
          if (isMe) {
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 10px Arial';
            ctx.fillText('YOU', player.x, player.y - mapData.playerSize / 2 - 8);
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

      // Send movement to server if moving
      if (dx !== 0 || dy !== 0) {
        socket.emit('playerMove', { dx, dy });
      }

      // Render game
      renderGame(ctx);

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
