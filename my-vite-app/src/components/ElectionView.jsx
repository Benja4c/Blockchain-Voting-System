import { useState, useEffect, useCallback } from 'react';
import { useVotingSystem } from '../hooks/useVotingSystem';
import AdminDashboard from './AdminDashboard';

export default function ElectionView() {
  const { account, connected, loading, error, connectWallet, vote, getElection, getCandidates, getVoterInfo } = useVotingSystem();
  const [electionId, setElectionId] = useState(0);
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [voterInfo, setVoterInfo] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [electionLoading, setElectionLoading] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // Load election details on mount or when electionId or connection changes
  const loadElection = useCallback(async () => {
    setElectionLoading(true);
    try {
      const electionData = await getElection(electionId);
      setElection(electionData);

      const candidatesData = await getCandidates(electionId);
      setCandidates(candidatesData);

      if (account) {
        const voter = await getVoterInfo(electionId, account);
        setVoterInfo(voter);
      }
    } catch (err) {
      console.error('Failed to load election:', err);
    } finally {
      setElectionLoading(false);
    }
  }, [electionId, account, getElection, getCandidates, getVoterInfo]);

  useEffect(() => {
    if (electionId !== null && connected) {
      loadElection();
    }
  }, [loadElection, connected, electionId]);

  const handleVote = async () => {
    if (!selectedCandidate) {
      alert('Please select a candidate');
      return;
    }

    try {
      await vote(electionId, selectedCandidate);
      alert('Vote cast successfully!');
      setSelectedCandidate(null);
      loadElection(); // Refresh data
    } catch (err) {
      alert(`Failed to vote: ${err.message}`);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full border-2 border-indigo-200">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            🗳️ Blockchain Voting System
          </h1>
          <p className="text-gray-500 text-center text-sm mb-6">
            Decentralized Elections on Ethereum
          </p>
          <p className="text-gray-600 text-center mb-8">
            Connect your wallet to participate in elections
          </p>
          <button
            onClick={connectWallet}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span> Connecting...
              </>
            ) : (
              <>🔐 Connect MetaMask</>
            )}
          </button>
          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 text-sm font-semibold">⚠️ Connection Error</p>
              <p className="text-red-600 text-sm mt-1 break-words">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-b-4 border-indigo-500">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                🗳️ Blockchain Voting System
              </h1>
              <p className="text-sm text-gray-500 mt-1">Decentralized Elections on Ethereum</p>
            </div>
            <div className="text-right flex items-center gap-4">
              <button
                onClick={() => setShowAdmin((s) => !s)}
                className={`font-semibold py-2 px-4 rounded-lg transition ${
                  showAdmin
                    ? 'bg-yellow-500 text-white'
                    : 'bg-yellow-400 hover:bg-yellow-500 text-white'
                }`}
              >
                {showAdmin ? '👤 Close Admin' : '⚙️ Admin'}
              </button>
              
              <div className="border-l border-gray-300 pl-4">
                <p className="text-sm text-gray-600">Connected:</p>
                <p className="text-sm font-mono bg-indigo-50 px-3 py-1 rounded border border-indigo-200">
                  {account?.substring(0, 6)}...{account?.substring(-4)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Dashboard */}
        {showAdmin && (
          <div className="mb-6">
            <AdminDashboard />
          </div>
        )}

        {/* Election Selection */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Election
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              value={electionId}
              onChange={(e) => setElectionId(parseInt(e.target.value))}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter election ID"
            />
            <button
              onClick={loadElection}
              disabled={electionLoading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              {electionLoading ? 'Loading...' : 'Load'}
            </button>
          </div>
        </div>

        {/* Election Info */}
        {election && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-indigo-500">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {election.electionName}
              </h2>
              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between">
                  <span className="font-semibold">Status:</span>
                  <span className={`font-bold ${election.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {election.isActive ? '🟢 Active' : '🔴 Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Total Votes:</span>
                  <span className="font-mono">{election.totalVotes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Registered Voters:</span>
                  <span className="font-mono">{candidates.length}</span>
                </div>
              </div>
            </div>

            {/* Voter Status */}
            {voterInfo && (
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Your Voting Status</h3>
                <div className="space-y-3 text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-semibold">Registered:</span>
                    <span className={`font-bold ${voterInfo.isRegistered ? 'text-green-600' : 'text-red-600'}`}>
                      {voterInfo.isRegistered ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Has Voted:</span>
                    <span className={`font-bold ${voterInfo.hasVoted ? 'text-red-600' : 'text-green-600'}`}>
                      {voterInfo.hasVoted ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  {voterInfo.hasVoted && (
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <p className="flex justify-between">
                        <span className="font-semibold">Voted For:</span>
                        <span className="font-mono">Candidate #{voterInfo.votedFor}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Candidates & Voting */}
        {candidates.length > 0 && !voterInfo?.hasVoted && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              🗳️ Cast Your Vote
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(candidate.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition transform ${
                    selectedCandidate === candidate.id
                      ? 'border-indigo-600 bg-indigo-50 scale-105 shadow-md'
                      : 'border-gray-200 hover:border-indigo-400 hover:shadow-md'
                  }`}
                >
                  <h3 className="text-lg font-bold text-gray-800">
                    {candidate.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Votes: <span className="font-mono font-bold text-indigo-600">{candidate.voteCount}</span>
                  </p>
                  {selectedCandidate === candidate.id && (
                    <p className="text-sm text-indigo-600 font-semibold mt-2">✓ Selected</p>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={handleVote}
              disabled={loading || !selectedCandidate}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span> Voting...
                </>
              ) : (
                <>✅ Cast Vote</>
              )}
            </button>
          </div>
        )}

        {/* Results */}
        {candidates.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              📊 Live Results
            </h2>
            {election?.totalVotes === '0' ? (
              <p className="text-center text-gray-500 py-8">No votes cast yet</p>
            ) : (
              <div className="space-y-4">
                {candidates
                  .sort((a, b) => parseInt(b.voteCount) - parseInt(a.voteCount))
                  .map((candidate) => {
                    const percentage =
                      election
                        ? (parseInt(candidate.voteCount) / parseInt(election.totalVotes) || 0) * 100
                        : 0;
                    return (
                      <div key={candidate.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-800">{candidate.name}</span>
                          <span className="text-sm font-bold text-indigo-600">
                            {candidate.voteCount} votes ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full transition-all duration-300 flex items-center justify-center"
                            style={{
                              width: `${percentage}%`,
                            }}
                          >
                            {percentage > 10 && (
                              <span className="text-xs font-bold text-white">{percentage.toFixed(0)}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {electionLoading && (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-semibold">Loading election...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded-lg">
            <p className="font-bold text-red-700">⚠️ Error:</p>
            <p className="text-red-600 text-sm mt-1 break-words">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
