export const MAPS = {
  forest: {
    name: 'Forest',
    description: 'Dense forest with trees as obstacles',
    width: 800,
    height: 600,
    backgroundColor: '#2d5016',
    playerSize: 20,
    obstacles: [
      { x: 100, y: 100, width: 60, height: 60, color: '#1a3310' },
      { x: 250, y: 150, width: 50, height: 50, color: '#1a3310' },
      { x: 450, y: 100, width: 70, height: 70, color: '#1a3310' },
      { x: 650, y: 120, width: 55, height: 55, color: '#1a3310' },
      { x: 150, y: 300, width: 60, height: 60, color: '#1a3310' },
      { x: 350, y: 280, width: 80, height: 80, color: '#1a3310' },
      { x: 550, y: 320, width: 50, height: 50, color: '#1a3310' },
      { x: 200, y: 480, width: 65, height: 65, color: '#1a3310' },
      { x: 450, y: 460, width: 55, height: 55, color: '#1a3310' },
      { x: 650, y: 450, width: 70, height: 70, color: '#1a3310' },
    ],
    spawnPoints: [
      { x: 50, y: 50 },
      { x: 750, y: 50 },
      { x: 50, y: 550 },
      { x: 750, y: 550 },
      { x: 400, y: 50 },
      { x: 400, y: 550 },
      { x: 50, y: 300 },
      { x: 750, y: 300 },
    ],
  },
  maze: {
    name: 'Maze',
    description: 'Navigate through tight corridors',
    width: 800,
    height: 600,
    backgroundColor: '#1e3a5f',
    playerSize: 20,
    obstacles: [
      // Horizontal walls
      { x: 50, y: 100, width: 300, height: 20, color: '#0f1f3f' },
      { x: 450, y: 100, width: 300, height: 20, color: '#0f1f3f' },
      { x: 150, y: 200, width: 200, height: 20, color: '#0f1f3f' },
      { x: 450, y: 200, width: 250, height: 20, color: '#0f1f3f' },
      { x: 50, y: 300, width: 250, height: 20, color: '#0f1f3f' },
      { x: 450, y: 300, width: 200, height: 20, color: '#0f1f3f' },
      { x: 150, y: 400, width: 300, height: 20, color: '#0f1f3f' },
      { x: 550, y: 400, width: 200, height: 20, color: '#0f1f3f' },
      { x: 50, y: 500, width: 350, height: 20, color: '#0f1f3f' },
      // Vertical walls
      { x: 200, y: 50, width: 20, height: 150, color: '#0f1f3f' },
      { x: 400, y: 120, width: 20, height: 200, color: '#0f1f3f' },
      { x: 600, y: 50, width: 20, height: 150, color: '#0f1f3f' },
      { x: 300, y: 220, width: 20, height: 180, color: '#0f1f3f' },
      { x: 500, y: 320, width: 20, height: 200, color: '#0f1f3f' },
    ],
    spawnPoints: [
      { x: 30, y: 30 },
      { x: 770, y: 30 },
      { x: 30, y: 570 },
      { x: 770, y: 570 },
      { x: 400, y: 30 },
      { x: 100, y: 300 },
      { x: 700, y: 300 },
      { x: 400, y: 550 },
    ],
  },
  arena: {
    name: 'Open Arena',
    description: 'Wide open space with minimal cover',
    width: 800,
    height: 600,
    backgroundColor: '#4a4a4a',
    playerSize: 20,
    obstacles: [
      // Central platform
      { x: 350, y: 250, width: 100, height: 100, color: '#2a2a2a' },
      // Corner blocks
      { x: 50, y: 50, width: 80, height: 80, color: '#2a2a2a' },
      { x: 670, y: 50, width: 80, height: 80, color: '#2a2a2a' },
      { x: 50, y: 470, width: 80, height: 80, color: '#2a2a2a' },
      { x: 670, y: 470, width: 80, height: 80, color: '#2a2a2a' },
      // Side pillars
      { x: 200, y: 180, width: 40, height: 40, color: '#2a2a2a' },
      { x: 560, y: 180, width: 40, height: 40, color: '#2a2a2a' },
      { x: 200, y: 380, width: 40, height: 40, color: '#2a2a2a' },
      { x: 560, y: 380, width: 40, height: 40, color: '#2a2a2a' },
    ],
    spawnPoints: [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 100 },
      { x: 400, y: 500 },
      { x: 100, y: 300 },
      { x: 700, y: 300 },
    ],
  },
  platformer: {
    name: 'Sky Platformer',
    description: 'Jump between floating platforms in the sky',
    width: 800,
    height: 600,
    backgroundColor: '#87CEEB',
    playerSize: 20,
    obstacles: [
      // Ground level platforms
      { x: 0, y: 560, width: 200, height: 20, color: '#10b981' },
      { x: 260, y: 520, width: 300, height: 20, color: '#10b981' },
      { x: 650, y: 560, width: 150, height: 20, color: '#10b981' },
      
      // Mid-low platforms
      { x: 380, y: 430, width: 290, height: 20, color: '#10b981' },
      { x: 0, y: 430, width: 100, height: 20, color: '#10b981' },
      
      // Middle platforms
      { x: 320, y: 340, width: 340, height: 20, color: '#10b981' },
      { x: 0, y: 340, width: 180, height: 20, color: '#10b981' },
      
      // Mid-high platforms
      { x: 0, y: 250, width: 280, height: 20, color: '#10b981' },
      { x: 450, y: 250, width: 250, height: 20, color: '#10b981' },
      
      // Top platforms
      { x: 630, y: 130, width: 170, height: 20, color: '#10b981' },
      { x: 320, y: 130, width: 200, height: 20, color: '#10b981' },
      
      // Trees (decorative vertical obstacles)
      { x: 100, y: 500, width: 30, height: 60, color: '#059669' },
      { x: 500, y: 370, width: 30, height: 60, color: '#059669' },
      { x: 140, y: 280, width: 30, height: 60, color: '#059669' },
      { x: 720, y: 70, width: 30, height: 60, color: '#059669' },
      
      // Small blocks/obstacles
      { x: 240, y: 280, width: 50, height: 50, color: '#10b981' },
      { x: 580, y: 470, width: 40, height: 40, color: '#f59e0b' },
    ],
    spawnPoints: [
      { x: 100, y: 540 },
      { x: 450, y: 500 },
      { x: 120, y: 230 },
      { x: 580, y: 230 },
      { x: 480, y: 320 },
      { x: 700, y: 110 },
      { x: 400, y: 110 },
      { x: 550, y: 410 },
    ],
  },
};

export const PLAYER_SPEED = 250; // pixels per second (horizontal movement)
export const JUMP_FORCE = 500; // Jump velocity (increased for better feel)
export const GRAVITY = 1400; // Gravity acceleration
export const TAG_DISTANCE = 30; // distance to tag another player
export const SERVER_UPDATE_RATE = 1000 / 60; // 60 FPS
