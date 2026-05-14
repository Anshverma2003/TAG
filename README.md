# Multiplayer Tag Game 🏃‍♂️

A real-time multiplayer online game where players join rooms and try to survive against taggers!

## Features

- **Real-time Multiplayer**: Play with friends in real-time using WebSockets
- **Room System**: Create public or private rooms with custom game settings
- **Multiple Maps**: Choose from 3 different maps (Forest, Maze, Open Arena)
- **Tag Mechanics**: Avoid being tagged or become a tagger yourself!
- **Timed Matches**: Customizable match duration (1-10 minutes)
- **Win Conditions**: Survive until time runs out or tag everyone!

## Tech Stack

**Frontend:**
- React + Vite
- HTML5 Canvas for game rendering
- Tailwind CSS for styling
- Socket.IO Client for real-time communication

**Backend:**
- Node.js + Express
- Socket.IO for WebSocket connections
- In-memory game state management

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd TAG
```

2. Install all dependencies
```bash
npm run install:all
```

### Running the Game

Run both client and server concurrently:
```bash
npm run dev
```

Or run them separately:

**Server:**
```bash
cd server
npm run dev
```

**Client:**
```bash
cd client
npm run dev
```

The game will be available at `http://localhost:5173`

## How to Play

1. **Create or Join Room**: Start by creating a new room or joining an existing one
2. **Configure Settings**: Room creator selects map and match duration
3. **Game Starts**: One random player becomes the initial tagger
4. **Avoid Being Tagged**: Move around using WASD or Arrow keys
5. **Tag Others**: If you're a tagger, touch other players to tag them
6. **Win Conditions**:
   - **Players Win**: At least one player survives until timer ends
   - **Taggers Win**: All players become taggers

## Controls

- **WASD** or **Arrow Keys**: Move your character
- **Mouse**: Navigate UI

## Project Structure

```
/client
  /src
    /components    - React UI components
    /pages        - Main page components
    /game         - Game canvas and rendering logic
    /socket       - Socket.IO client configuration
    /utils        - Helper functions

/server
  /src
    /rooms        - Room management logic
    /game         - Game state and mechanics
    /socket       - Socket.IO event handlers
    /controllers  - Game controllers
```

## Game Mechanics

- **Tagging**: When a tagger collides with a player, that player becomes a tagger
- **Movement**: Smooth real-time movement synchronized across all clients
- **Collision Detection**: Server-side collision detection prevents cheating
- **Maps**: Each map has unique layouts with obstacles and spawn points

## Future Enhancements

- Power-ups (speed boost, invisibility, etc.)
- Leaderboard and player stats
- Spectator mode
- Mobile device support
- Voice chat integration
- Custom avatars
- Sound effects and animations
- Matchmaking system

## License

MIT
