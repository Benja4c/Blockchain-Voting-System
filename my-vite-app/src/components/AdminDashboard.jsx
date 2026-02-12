import { useState } from 'react';
import CandidateRegistration from './CandidateRegistration';
import VoterRegistration from './VoterRegistration';
import { votingService } from '../services/VotingService';

export default function AdminDashboard() {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [electionId, setElectionId] = useState('0');

  const handleCreate = async () => {
    setCreating(true);
    try {
      const start = Math.floor(new Date(startTime).getTime() / 1000);
      const end = Math.floor(new Date(endTime).getTime() / 1000);
      await votingService.createElection(name, start, end);
      alert('Election created successfully — check transaction');
      setName('');
      setStartTime('');
      setEndTime('');
    } catch (err) {
      alert(`Create failed: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleFinalize = async () => {
    try {
      await votingService.finalizeElection(parseInt(electionId));
      alert('Election finalized');
    } catch (err) {
      alert(`Finalize failed: ${err.message}`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg shadow-lg p-6 border-2 border-yellow-400">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h2>
        <p className="text-sm text-gray-600">Manage elections, candidates, and voters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Create Election */}
        
        <div className="bg-white rounded-lg p-5 border-l-4 border-blue-500">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Create Election</h3>
          <input
            className="w-full mb-3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Election name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="grid grid-cols-1 gap-2 mb-3">
            <input
              type="datetime-local"
              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <input
              type="datetime-local"
              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded font-semibold transition"
          >
            {creating ? 'Creating...' : 'Create Election'}
          </button>
        </div>

        {/* Finalize Election */}
        <div className="bg-white rounded-lg p-5 border-l-4 border-red-500">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Finalize Election</h3>
          <p className="text-sm text-gray-600 mb-3">Once finalized, no more votes can be cast</p>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              className="p-2 border border-gray-300 rounded flex-1 focus:ring-2 focus:ring-red-500"
              value={electionId}
              onChange={(e) => setElectionId(e.target.value)}
              placeholder="Election ID"
            />
            <button
              onClick={handleFinalize}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-semibold transition whitespace-nowrap"
            >
              Finalize
            </button>
          </div>
        </div>
      </div>

      {/* Registration Components */}
      <div className="border-t border-gray-300 pt-6">
        <h3 className="font-bold text-lg mb-4 text-gray-800">Voter & Candidate Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CandidateRegistration />
          <VoterRegistration />
        </div>
      </div>
    </div>
  );
}
