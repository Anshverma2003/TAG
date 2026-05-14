# Multiplayer Tag Game - Quick Start Guide

## 🚀 Getting Started

Follow these steps to run the game locally:

### 1. Install Dependencies

From the root directory, run:

```bash
npm run install:all
```

This will install dependencies for both the client and server.

### 2. Start the Game

From the root directory, run:

```bash
npm run dev
```

This starts both the backend server (port 3001) and frontend (port 5173) simultaneously.

**Or run them separately:**

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm run dev
```

### 3. Play the Game

Open your browser to: **http://localhost:5173**

To test multiplayer:
- Open multiple browser tabs/windows
- Or share your local IP with friends on the same network

## 🎮 How to Play

1. **Create a Room**
   - Enter your name
   - Choose a map (Forest, Maze, or Arena)
   - Set match duration (1-10 minutes)
   - Choose Public or Private room

2. **Invite Players**
   - Share the 6-digit room code with friends
   - Wait for at least 2 players to join

3. **Start the Game**
   - Host clicks "Start Game"
   - One random player becomes the tagger

4. **Survive or Tag**
   - **Controls**: WASD or Arrow Keys to move
   - **Taggers**: Touch other players to tag them
   - **Survivors**: Avoid taggers until time runs out

5. **Win Conditions**
   - **Players Win**: At least one survivor when timer ends
   - **Taggers Win**: All players get tagged before timer ends

## 🗺️ Maps

### Forest
- Dense forest with tree obstacles
- Good balance of hiding spots and open areas
- Medium difficulty

### Maze
- Tight corridors and walls
- Strategic gameplay required
- Hard difficulty - easy to get cornered!

### Arena
- Wide open space
- Minimal cover
- Fast-paced action
- Easy difficulty

## 🛠️ Technical Details

### Architecture

**Frontend (Client)**
- React with Vite
- HTML5 Canvas for game rendering
- Socket.IO Client for real-time communication
- Tailwind CSS for styling

**Backend (Server)**
- Node.js with Express
- Socket.IO for WebSocket connections
- In-memory game state management
- Real-time collision detection

### Game Mechanics

- **Player Speed**: 200 pixels/second
- **Tag Distance**: 30 pixels
- **Server Update Rate**: 60 FPS
- **Collision Detection**: Server-side (prevents cheating)

## 🐛 Troubleshooting

### Port Already in Use

If port 3001 or 5173 is taken:

**Backend**: Edit `server/.env` and change PORT
**Frontend**: Edit `vite.config.js` and change the server port

### Connection Issues

- Check both server and client are running
- Verify firewall settings
- Make sure URLs match in `.env` files

### Players Not Syncing

- Refresh all browser tabs
- Check console for errors
- Restart the server

## 📦 Project Structure

```
TAG/
├── client/              # Frontend React app
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── game/        # Game canvas logic
│   │   ├── socket/      # Socket.IO client
│   │   └── utils/       # Helper functions
│   └── package.json
│
├── server/              # Backend Node.js app
│   ├── src/
│   │   ├── controllers/ # Game controllers
│   │   ├── game/        # Game mechanics
│   │   ├── rooms/       # Room management
│   │   ├── socket/      # Socket.IO handlers
│   │   └── server.js    # Entry point
│   └── package.json
│
└── package.json         # Root workspace config
```

## 🚢 Deployment

### Backend (Server)

Deploy to:
- Heroku
- Railway
- Render
- DigitalOcean

Set environment variables:
```
PORT=3001
CLIENT_URL=https://your-frontend-domain.com
NODE_ENV=production
```

### Frontend (Client)

Deploy to:
- Vercel
- Netlify
- GitHub Pages

Set environment variable:
```
VITE_SERVER_URL=https://your-backend-domain.com
```

## 🎯 Future Enhancements

- [ ] Power-ups (speed boost, shield, etc.)
- [ ] Player statistics and leaderboard
- [ ] Spectator mode
- [ ] Mobile responsive controls
- [ ] Sound effects and music
- [ ] Custom player avatars
- [ ] Chat system
- [ ] Tournament mode
- [ ] Replay system
- [ ] Multiple game modes

## 📝 License

MIT License - Feel free to use and modify!

---

**Enjoy playing Tag! 🏃‍♂️💨**
