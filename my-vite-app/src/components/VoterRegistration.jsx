import { useState } from 'react';
import { votingService } from '../services/VotingService';

export default function VoterRegistration() {
  const [electionId, setElectionId] = useState('0');
  const [voterAddress, setVoterAddress] = useState('');
  const [batch, setBatch] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await votingService.registerVoter(parseInt(electionId), voterAddress);
      alert('Voter registered');
      setVoterAddress('');
    } catch (err) {
      alert(`Register failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBatch = async () => {
    setLoading(true);
    try {
      const addresses = batch.split(/[,\n\s]+/).filter(Boolean);
      await votingService.batchRegisterVoters(parseInt(electionId), addresses);
      alert('Batch registration completed');
      setBatch('');
    } catch (err) {
      alert(`Batch failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded">
      <h4 className="font-semibold mb-2">Register Voter</h4>
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
        placeholder="Voter address (0x...)"
        value={voterAddress}
        onChange={(e) => setVoterAddress(e.target.value)}
      />
      <button
        onClick={handleRegister}
        disabled={loading || !voterAddress}
        className="bg-green-600 text-white py-2 px-4 rounded w-full mb-3"
      >
        {loading ? 'Registering...' : 'Register Voter'}
      </button>

      <h5 className="font-semibold mt-2 mb-2">Batch Register (one per line or comma-separated)</h5>
      <textarea
        className="w-full mb-2 p-2 border rounded h-28"
        value={batch}
        onChange={(e) => setBatch(e.target.value)}
        placeholder="0xabc..., 0xdef..., or one per line"
      />
      <button
        onClick={handleBatch}
        disabled={loading || !batch}
        className="bg-blue-600 text-white py-2 px-4 rounded w-full"
      >
        {loading ? 'Submitting...' : 'Batch Register'}
      </button>
    </div>
  );
}
