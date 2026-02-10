import { useState } from 'react';
import { votingService } from '../services/VotingService';

export default function CandidateRegistration() {
  const [electionId, setElectionId] = useState('0');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await votingService.registerCandidate(parseInt(electionId), name);
      alert('Candidate registered');
      setName('');
    } catch (err) {
      alert(`Register failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded">
      <h4 className="font-semibold mb-2">Register Candidate</h4>
      <input
        type="number"
        min="0"
        className="w-full mb-2 p-2 border rounded"
        value={electionId}
        onChange={(e) => setElectionId(e.target.value)}
        placeholder="Election ID"
      />
      <input
        className="w-full mb-2 p-2 border rounded"
        placeholder="Candidate name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        onClick={handleRegister}
        disabled={loading || !name}
        className="bg-indigo-600 text-white py-2 px-4 rounded w-full"
      >
        {loading ? 'Registering...' : 'Register Candidate'}
      </button>
    </div>
  );
}
