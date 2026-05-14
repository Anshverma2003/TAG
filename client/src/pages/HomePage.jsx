import { useState } from 'react';
import { MAPS } from '../utils/constants';

function HomePage({ onCreateRoom, onJoinRoom }) {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedMap, setSelectedMap] = useState('forest');
  const [duration, setDuration] = useState(5);

  const handleCreate = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    const settings = {
      isPrivate,
      mapId: selectedMap,
      duration: duration * 60, // Convert minutes to seconds
    };
    onCreateRoom(playerName, settings);
  };

  const handleJoin = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!roomCode.trim()) {
      alert('Please enter room code');
      return;
    }
    onJoinRoom(playerName, roomCode);
  };

  return (
    <div className="card max-w-2xl w-full">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">🏃‍♂️ TAG GAME</h1>
        <p className="text-gray-600 text-lg">
          Multiplayer online tag - Don't get caught!
        </p>
      </div>

      {!showCreateRoom && !showJoinRoom && (
        <div className="space-y-4">
          <button
            onClick={() => setShowCreateRoom(true)}
            className="btn btn-primary w-full text-xl py-4"
          >
            Create Room
          </button>
          <button
            onClick={() => setShowJoinRoom(true)}
            className="btn btn-secondary w-full text-xl py-4"
          >
            Join Room
          </button>
        </div>
      )}

      {showCreateRoom && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Room</h2>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="input"
              placeholder="Enter your name"
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Select Map</label>
            <select
              value={selectedMap}
              onChange={(e) => setSelectedMap(e.target.value)}
              className="input"
            >
              {Object.entries(MAPS).map(([key, map]) => (
                <option key={key} value={key}>
                  {map.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Match Duration: {duration} minute{duration !== 1 ? 's' : ''}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="private"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="mr-2 w-5 h-5"
            />
            <label htmlFor="private" className="text-gray-700 font-semibold">
              Private Room (requires code to join)
            </label>
          </div>

          <div className="flex gap-3">
            <button onClick={handleCreate} className="btn btn-success flex-1">
              Create
            </button>
            <button
              onClick={() => setShowCreateRoom(false)}
              className="btn bg-gray-300 hover:bg-gray-400 text-gray-800 flex-1"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {showJoinRoom && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Join Room</h2>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="input"
              placeholder="Enter your name"
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Room Code</label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="input"
              placeholder="Enter 6-digit room code"
              maxLength={6}
            />
          </div>

          <div className="flex gap-3">
            <button onClick={handleJoin} className="btn btn-success flex-1">
              Join
            </button>
            <button
              onClick={() => setShowJoinRoom(false)}
              className="btn bg-gray-300 hover:bg-gray-400 text-gray-800 flex-1"
            >
              Back
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold text-gray-800 mb-2">How to Play:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• One player starts as a tagger</li>
          <li>• Taggers try to tag other players</li>
          <li>• Tagged players become taggers too</li>
          <li>• Survive until time runs out to win!</li>
          <li>• Use A/D or Arrow keys to move left/right</li>
          <li>• Press SPACEBAR to jump</li>
        </ul>
      </div>
    </div>
  );
}

export default HomePage;
