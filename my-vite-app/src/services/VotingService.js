import { ethers } from 'ethers';
import votingSystemABI from '../contracts/VotingSystem.abi.json';

// Configuration - Update with your deployed contract address
const VOTING_SYSTEM_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

class VotingSystemService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
  }

  /**
   * Connect to wallet (MetaMask)
   */
  async connectWallet() {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.contract = new ethers.Contract(
        VOTING_SYSTEM_ADDRESS,
        votingSystemABI,
        this.signer
      );

      return accounts[0];
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  /**
   * Get current connected account
   */
  async getConnectedAccount() {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });
      return accounts[0] || null;
    } catch (error) {
      console.error('Failed to get connected account:', error);
      return null;
    }
  }

  /**
   * Check if wallet is connected
   */
  isConnected() {
    return this.contract !== null;
  }

  // ============ Election Functions ============

  /**
   * Create new election
   */
  async createElection(name, startTime, endTime) {
    if (!this.contract) throw new Error('Wallet not connected');

    try {
      const tx = await this.contract.createElection(name, startTime, endTime);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Failed to create election:', error);
      throw error;
    }
  }

  /**
   * Get election details
   */
  async getElection(electionId) {
    if (!this.contract) {
      // Use read-only provider
      const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
      const readOnlyContract = new ethers.Contract(
        VOTING_SYSTEM_ADDRESS,
        votingSystemABI,
        provider
      );
      return await readOnlyContract.getElection(electionId);
    }

    try {
      const election = await this.contract.getElection(electionId);
      return {
        electionId: election.electionId.toString(),
        electionName: election.electionName,
        startTime: election.startTime.toString(),
        endTime: election.endTime.toString(),
        isActive: election.isActive,
        isFinalized: election.isFinalized,
        creator: election.creator,
        totalVotes: election.totalVotes.toString(),
      };
    } catch (error) {
      console.error('Failed to get election:', error);
      throw error;
    }
  }

  /**
   * Finalize election
   */
  async finalizeElection(electionId) {
    if (!this.contract) throw new Error('Wallet not connected');

    try {
      const tx = await this.contract.finalizeElection(electionId);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Failed to finalize election:', error);
      throw error;
    }
  }

  // ============ Candidate Functions ============

  /**
   * Register candidate
   */
  async registerCandidate(electionId, candidateName) {
    if (!this.contract) throw new Error('Wallet not connected');

    try {
      const tx = await this.contract.registerCandidate(electionId, candidateName);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Failed to register candidate:', error);
      throw error;
    }
  }

  /**
   * Get all candidates
   */
  async getAllCandidates(electionId) {
    if (!this.contract) {
      const provider = new ethers.JsonRpcProvider(provider.env.VITE_RPC_URL);
      const readOnlyContract = new ethers.Contract(
        VOTING_SYSTEM_ADDRESS,
        votingSystemABI,
        provider
      );
      return await readOnlyContract.getAllCandidates(electionId);
    }

    try {
      const candidates = await this.contract.getAllCandidates(electionId);
      return candidates.map((c) => ({
        id: c.id.toString(),
        name: c.name,
        voteCount: c.voteCount.toString(),
        isActive: c.isActive,
        registrationTime: c.registrationTime.toString(),
      }));
    } catch (error) {
      console.error('Failed to get candidates:', error);
      throw error;
    }
  }

  /**
   * Get single candidate
   */
  async getCandidate(electionId, candidateId) {
    if (!this.contract) {
      const provider = new ethers.JsonRpcProvider(this.provider.env.VITE_RPC_URL);
      const readOnlyContract = new ethers.Contract(
        VOTING_SYSTEM_ADDRESS,
        votingSystemABI,
        provider
      );
      return await readOnlyContract.getCandidate(electionId, candidateId);
    }

    try {
      const candidate = await this.contract.getCandidate(electionId, candidateId);
      return {
        id: candidate.id.toString(),
        name: candidate.name,
        voteCount: candidate.voteCount.toString(),
        isActive: candidate.isActive,
        registrationTime: candidate.registrationTime.toString(),
      };
    } catch (error) {
      console.error('Failed to get candidate:', error);
      throw error;
    }
  }

  // ============ Voting Functions ============

  /**
   * Cast vote
   */
  async vote(electionId, candidateId) {
    if (!this.contract) throw new Error('Wallet not connected');

    try {
      const tx = await this.contract.vote(electionId, candidateId);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Failed to vote:', error);
      throw error;
    }
  }

  /**
   * Get voter info
   */
  async getVoter(electionId, voterAddress) {
    if (!this.contract) {
      const provider = new ethers.JsonRpcProvider(this.provider.env.VITE_RPC_URL);
      const readOnlyContract = new ethers.Contract(
        VOTING_SYSTEM_ADDRESS,
        votingSystemABI,
        provider
      );
      return await readOnlyContract.getVoter(electionId, voterAddress);
    }

    try {
      const voter = await this.contract.getVoter(electionId, voterAddress);
      return {
        voterAddress: voter.voterAddress,
        hasVoted: voter.hasVoted,
        votedFor: voter.votedFor.toString(),
        votingTime: voter.votingTime.toString(),
        isRegistered: voter.isRegistered,
      };
    } catch (error) {
      console.error('Failed to get voter:', error);
      throw error;
    }
  }

  // ============ Results Functions ============

  /**
   * Get election results
   */
  async getResults(electionId) {
    if (!this.contract) {
      const provider = new ethers.JsonRpcProvider(this.provider.env.VITE_RPC_URL);
      const readOnlyContract = new ethers.Contract(
        VOTING_SYSTEM_ADDRESS,
        votingSystemABI,
        provider
      );
      return await readOnlyContract.getResults(electionId);
    }

    try {
      const results = await this.contract.getResults(electionId);
      return results.map((r) => ({
        id: r.id.toString(),
        name: r.name,
        voteCount: r.voteCount.toString(),
        isActive: r.isActive,
        registrationTime: r.registrationTime.toString(),
      }));
    } catch (error) {
      console.error('Failed to get results:', error);
      throw error;
    }
  }

  /**
   * Get winner
   */
  async getWinner(electionId) {
    if (!this.contract) {
      const provider = new ethers.JsonRpcProvider(this.provider.env.VITE_RPC_URL);
      const readOnlyContract = new ethers.Contract(
        VOTING_SYSTEM_ADDRESS,
        votingSystemABI,
        provider
      );
      return await readOnlyContract.getWinner(electionId);
    }

    try {
      const winner = await this.contract.getWinner(electionId);
      return {
        id: winner.id.toString(),
        name: winner.name,
        voteCount: winner.voteCount.toString(),
        isActive: winner.isActive,
        registrationTime: winner.registrationTime.toString(),
      };
    } catch (error) {
      console.error('Failed to get winner:', error);
      throw error;
    }
  }

  // ============ Voter Registration Functions ============

  /**
   * Register voter (commissioner only)
   */
  async registerVoter(electionId, voterAddress) {
    if (!this.contract) throw new Error('Wallet not connected');

    try {
      const tx = await this.contract.registerVoter(electionId, voterAddress);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Failed to register voter:', error);
      throw error;
    }
  }

  /**
   * Batch register voters (commissioner only)
   */
  async batchRegisterVoters(electionId, voterAddresses) {
    if (!this.contract) throw new Error('Wallet not connected');

    try {
      const tx = await this.contract.batchRegisterVoters(electionId, voterAddresses);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Failed to batch register voters:', error);
      throw error;
    }
  }

  /**
   * Get registered voters count
   */
  async getRegisteredVotersCount(electionId) {
    if (!this.contract) {
      const provider = new ethers.JsonRpcProvider(this.provider.env.VITE_RPC_URL);
      const readOnlyContract = new ethers.Contract(
        VOTING_SYSTEM_ADDRESS,
        votingSystemABI,
        provider
      );
      return await readOnlyContract.getRegisteredVotersCount(electionId);
    }

    try {
      const count = await this.contract.getRegisteredVotersCount(electionId);
      return count.toString();
    } catch (error) {
      console.error('Failed to get voters count:', error);
      throw error;
    }
  }

  /**
   * Get candidates count
   */
  async getCandidatesCount(electionId) {
    if (!this.contract) {
      const provider = new ethers.JsonRpcProvider(this.provider.env.VITE_RPC_URL);
      const readOnlyContract = new ethers.Contract(
        VOTING_SYSTEM_ADDRESS,
        votingSystemABI,
        provider
      );
      return await readOnlyContract.getCandidatesCount(electionId);
    }

    try {
      const count = await this.contract.getCandidatesCount(electionId);
      return count.toString();
    } catch (error) {
      console.error('Failed to get candidates count:', error);
      throw error;
    }
  }

  // ============ Event Listeners ============

  /**
   * Listen to vote recorded events
   */
  onVoteRecorded(callback) {
    if (!this.contract) {
      console.warn('Contract not connected for event listening');
      return;
    }

    this.contract.on('VoteRecorded', (electionId, voter, candidateId, timestamp) => {
      callback({
        electionId: electionId.toString(),
        voter,
        candidateId: candidateId.toString(),
        timestamp: timestamp.toString(),
      });
    });
  }

  /**
   * Stop listening to events
   */
  removeAllListeners() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }
}

// Export singleton instance
export const votingService = new VotingSystemService();
export default VotingSystemService;
