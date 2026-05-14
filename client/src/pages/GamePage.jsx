import { useEffect, useRef } from 'react';
import GameCanvas from '../game/GameCanvas';

function GamePage({ gameState, playerId, roomData }) {
  const canvasRef = useRef(null);

  if (!gameState) {
    return (
      <div className="card">
        <p className="text-center text-xl">Loading game...</p>
      </div>
    );
  }

  const currentPlayer = gameState.players.find((p) => p.id === playerId);
  const timeLeft = Math.max(0, gameState.timeRemaining);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const taggers = gameState.players.filter((p) => p.isTagger);
  const survivors = gameState.players.filter((p) => !p.isTagger);

  return (
    <div className="w-full max-w-6xl">
      {/* Game HUD */}
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="card">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Time Remaining</p>
            <p className="text-3xl font-bold text-gray-800">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Your Status</p>
            <p
              className={`text-2xl font-bold ${
                currentPlayer?.isTagger ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {currentPlayer?.isTagger ? '🔴 TAGGER' : '🟢 SURVIVOR'}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Score</p>
            <p className="text-xl font-bold text-gray-800">
              <span className="text-red-600">{taggers.length}</span> /{' '}
              <span className="text-green-600">{survivors.length}</span>
            </p>
            <p className="text-xs text-gray-500">Taggers / Survivors</p>
          </div>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="card p-4">
        <GameCanvas
          ref={canvasRef}
          gameState={gameState}
          playerId={playerId}
          roomData={roomData}
        />
      </div>

      {/* Player List */}
      <div className="mt-4 card">
        <h3 className="font-bold text-gray-800 mb-3">Players</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {gameState.players.map((player) => (
            <div
              key={player.id}
              className={`p-2 rounded text-sm ${
                player.isTagger
                  ? 'bg-red-100 text-red-800 border-2 border-red-400'
                  : 'bg-green-100 text-green-800 border-2 border-green-400'
              } ${player.id === playerId ? 'ring-2 ring-blue-500' : ''}`}
            >
              <span className="font-semibold">{player.name}</span>
              {player.id === playerId && <span className="ml-1">(You)</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Controls Help */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
        <p className="text-gray-700 font-semibold">
          🎮 Controls: WASD or Arrow Keys to Move
        </p>
      </div>
    </div>
  );
}

export default GamePage;
