import { useState, useEffect } from 'react';
import { socket } from './socket/socket';
import HomePage from './pages/HomePage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import ResultsPage from './pages/ResultsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // home, lobby, game, results
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [resultsData, setResultsData] = useState(null);

  useEffect(() => {
    // Socket connection events
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    // Room events
    socket.on('roomCreated', (data) => {
      setPlayerId(data.playerId);
      setRoomData(data.room);
      setCurrentPage('lobby');
    });

    socket.on('roomJoined', (data) => {
      setPlayerId(data.playerId);
      setRoomData(data.room);
      setCurrentPage('lobby');
    });

    socket.on('roomUpdated', (room) => {
      setRoomData(room);
    });

    socket.on('roomError', (error) => {
      alert(error.message);
    });

    // Game events
    socket.on('gameStarted', (data) => {
      setGameState(data);
      setCurrentPage('game');
    });

    socket.on('gameState', (state) => {
      setGameState(state);
    });

    socket.on('gameEnded', (results) => {
      setResultsData(results);
      setCurrentPage('results');
    });

    socket.on('playerDisconnected', (data) => {
      console.log('Player disconnected:', data.playerId);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('roomCreated');
      socket.off('roomJoined');
      socket.off('roomUpdated');
      socket.off('roomError');
      socket.off('gameStarted');
      socket.off('gameState');
      socket.off('gameEnded');
      socket.off('playerDisconnected');
    };
  }, []);

  const handleCreateRoom = (name, settings) => {
    setPlayerName(name);
    socket.emit('createRoom', { playerName: name, settings });
  };

  const handleJoinRoom = (name, roomCode) => {
    setPlayerName(name);
    socket.emit('joinRoom', { playerName: name, roomCode });
  };

  const handleLeaveRoom = () => {
    socket.emit('leaveRoom');
    setRoomData(null);
    setGameState(null);
    setCurrentPage('home');
  };

  const handleStartGame = () => {
    socket.emit('startGame');
  };

  const handlePlayAgain = () => {
    setResultsData(null);
    setGameState(null);
    setCurrentPage('lobby');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
          />
        );
      case 'lobby':
        return (
          <LobbyPage
            roomData={roomData}
            playerId={playerId}
            playerName={playerName}
            onLeaveRoom={handleLeaveRoom}
            onStartGame={handleStartGame}
          />
        );
      case 'game':
        return (
          <GamePage
            gameState={gameState}
            playerId={playerId}
            roomData={roomData}
          />
        );
      case 'results':
        return (
          <ResultsPage
            results={resultsData}
            playerId={playerId}
            onPlayAgain={handlePlayAgain}
            onLeaveRoom={handleLeaveRoom}
          />
        );
      default:
        return <HomePage onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {renderPage()}
    </div>
  );
}

export default App;
