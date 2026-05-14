import { MAPS } from '../utils/constants';

function LobbyPage({ roomData, playerId, playerName, onLeaveRoom, onStartGame }) {
  if (!roomData) return null;

  const isHost = roomData.hostId === playerId;
  const mapData = MAPS[roomData.settings.mapId];
  const canStart = roomData.players.length >= 2;

  return (
    <div className="card max-w-4xl w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Game Lobby</h1>
        <button onClick={onLeaveRoom} className="btn btn-danger">
          Leave Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Room Info</h2>
          <div className="space-y-2 text-gray-700">
            <p>
              <span className="font-semibold">Room Code:</span>{' '}
              <span className="text-2xl font-mono bg-white px-3 py-1 rounded">
                {roomData.code}
              </span>
            </p>
            <p>
              <span className="font-semibold">Type:</span>{' '}
              {roomData.settings.isPrivate ? '🔒 Private' : '🌍 Public'}
            </p>
            <p>
              <span className="font-semibold">Map:</span> {mapData.name}
            </p>
            <p>
              <span className="font-semibold">Duration:</span>{' '}
              {Math.floor(roomData.settings.duration / 60)} minutes
            </p>
            <p>
              <span className="font-semibold">Players:</span> {roomData.players.length}
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Players</h2>
          <div className="space-y-2">
            {roomData.players.map((player) => (
              <div
                key={player.id}
                className={`p-3 rounded-lg ${
                  player.id === playerId ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white'
                }`}
              >
                <span className="font-semibold">{player.name}</span>
                {player.id === roomData.hostId && (
                  <span className="ml-2 text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded">
                    HOST
                  </span>
                )}
                {player.id === playerId && (
                  <span className="ml-2 text-xs bg-blue-400 text-blue-900 px-2 py-1 rounded">
                    YOU
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 bg-purple-50 rounded-lg">
        <h3 className="font-bold text-gray-800 mb-2">Map Preview: {mapData.name}</h3>
        <p className="text-gray-700 text-sm mb-3">{mapData.description}</p>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="bg-white p-2 rounded">
            <span className="font-semibold">Size:</span> {mapData.width} x {mapData.height}
          </div>
          <div className="bg-white p-2 rounded">
            <span className="font-semibold">Obstacles:</span> {mapData.obstacles.length}
          </div>
          <div className="bg-white p-2 rounded">
            <span className="font-semibold">Spawn Points:</span> {mapData.spawnPoints.length}
          </div>
        </div>
      </div>

      {isHost ? (
        <div>
          {!canStart && (
            <p className="text-center text-red-600 font-semibold mb-4">
              ⚠️ Need at least 2 players to start
            </p>
          )}
          <button
            onClick={onStartGame}
            disabled={!canStart}
            className={`btn w-full text-xl py-4 ${
              canStart ? 'btn-success' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {canStart ? 'Start Game' : 'Waiting for Players...'}
          </button>
        </div>
      ) : (
        <div className="text-center p-6 bg-yellow-50 rounded-lg">
          <p className="text-gray-800 font-semibold text-lg">
            Waiting for host to start the game...
          </p>
        </div>
      )}
    </div>
  );
}

export default LobbyPage;
