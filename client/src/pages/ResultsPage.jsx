function ResultsPage({ results, playerId, onPlayAgain, onLeaveRoom }) {
  if (!results) return null;

  const didIWin = results.winners.includes(playerId);
  const wasITagger = results.taggers.includes(playerId);

  return (
    <div className="card max-w-2xl w-full">
      <div className="text-center mb-8">
        <h1
          className={`text-5xl font-bold mb-4 ${
            didIWin ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {didIWin ? '🎉 VICTORY!' : '😢 DEFEATED!'}
        </h1>
        <p className="text-2xl text-gray-700 font-semibold">
          {results.winningTeam === 'players' ? 'Players Survived!' : 'All Tagged!'}
        </p>
      </div>

      <div className="mb-6 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Game Statistics
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600">{results.duration}s</p>
            <p className="text-gray-600">Game Duration</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-purple-600">{results.totalPlayers}</p>
            <p className="text-gray-600">Total Players</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-bold text-green-800 mb-3 text-center">
            🟢 Survivors ({results.survivors.length})
          </h3>
          <div className="space-y-2">
            {results.survivors.map((player) => (
              <div
                key={player.id}
                className={`p-2 rounded text-center ${
                  player.id === playerId
                    ? 'bg-green-200 border-2 border-green-500 font-bold'
                    : 'bg-white'
                }`}
              >
                {player.name}
                {player.id === playerId && ' (You)'}
              </div>
            ))}
            {results.survivors.length === 0 && (
              <p className="text-center text-gray-500 italic">None</p>
            )}
          </div>
        </div>

        <div className="p-4 bg-red-50 rounded-lg">
          <h3 className="font-bold text-red-800 mb-3 text-center">
            🔴 Taggers ({results.taggers.length})
          </h3>
          <div className="space-y-2">
            {results.taggers.map((player) => (
              <div
                key={player.id}
                className={`p-2 rounded text-center ${
                  player.id === playerId
                    ? 'bg-red-200 border-2 border-red-500 font-bold'
                    : 'bg-white'
                }`}
              >
                {player.name}
                {player.id === playerId && ' (You)'}
                {player.id === results.initialTagger && (
                  <span className="ml-1 text-xs">(Initial)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button onClick={onPlayAgain} className="btn btn-success w-full text-xl py-4">
          Play Again
        </button>
        <button
          onClick={onLeaveRoom}
          className="btn bg-gray-300 hover:bg-gray-400 text-gray-800 w-full text-xl py-4"
        >
          Leave Room
        </button>
      </div>
    </div>
  );
}

export default ResultsPage;
