import { useState, useEffect } from 'react';
import { votingService } from '../services/VotingService';

/**
 * Custom React hook for voting system interaction
 */
export const useVotingSystem = () => {
  const [account, setAccount] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Connect wallet
  const connectWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const acc = await votingService.connectWallet();
      setAccount(acc);
      setConnected(true);
    } catch (err) {
      setError(err.message);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    votingService.removeAllListeners();
    setAccount(null);
    setConnected(false);
  };

  // Check if wallet already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      const acc = await votingService.getConnectedAccount();
      if (acc) {
        setAccount(acc);
        setConnected(true);
      }
    };
    checkConnection();
  }, []);

  // Cast vote
  const vote = async (electionId, candidateId) => {
    setLoading(true);
    setError(null);
    try {
      const receipt = await votingService.vote(electionId, candidateId);
      return receipt;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get election
  const getElection = async (electionId) => {
    setError(null);
    try {
      return await votingService.getElection(electionId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Get candidates
  const getCandidates = async (electionId) => {
    setError(null);
    try {
      return await votingService.getAllCandidates(electionId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Get results
  const getResults = async (electionId) => {
    setError(null);
    try {
      return await votingService.getResults(electionId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Get voter info
  const getVoterInfo = async (electionId, voterAddress) => {
    setError(null);
    try {
      return await votingService.getVoter(electionId, voterAddress);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    account,
    connected,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    vote,
    getElection,
    getCandidates,
    getResults,
    getVoterInfo,
  };
};
