# Smart Contract API Reference

## Contract: BlockchainVotingSystem

### Overview
Complete voting system smart contract for managing elections, candidates, voters, and votes on the blockchain.

**Network**: Ethereum-compatible blockchains
**Language**: Solidity ^0.8.20
**License**: MIT

---

## Admin Functions

### `addCommissioner(address _commissioner)`

Adds a new election commissioner with election management permissions.

**Parameters:**
- `_commissioner` (address): Address of the new commissioner

**Modifiers:**
- `onlyAdmin`: Only administrator can call

**Reverts:**
- "Invalid commissioner address" - If address is zero

**Events Emitted:**
- None

**Example:**
```solidity
votingSystem.addCommissioner(0x1234567890123456789012345678901234567890);
```

---

### `removeCommissioner(address _commissioner)`

Removes election commissioner permissions from an address.

**Parameters:**
- `_commissioner` (address): Address of commissioner to remove

**Modifiers:**
- `onlyAdmin`: Only administrator can call

**Reverts:**
- "Cannot remove administrator" - If trying to remove admin

**Events Emitted:**
- None

**Example:**
```solidity
votingSystem.removeCommissioner(0x1234567890123456789012345678901234567890);
```

---

### `transferAdmin(address _newAdmin)`

Transfers administrator role to a new address.

**Parameters:**
- `_newAdmin` (address): Address of new administrator

**Modifiers:**
- `onlyAdmin`: Only current admin can call

**Reverts:**
- "Invalid address" - If address is zero

**Events Emitted:**
- None

**Effects:**
- New admin gains commissioner role automatically

**Example:**
```solidity
votingSystem.transferAdmin(0x9876543210987654321098765432109876543210);
```

---

## Election Management Functions

### `createElection(string memory _electionName, uint256 _startTime, uint256 _endTime)`

Creates a new election for voting.

**Parameters:**
- `_electionName` (string): Name/title of the election
- `_startTime` (uint256): Unix timestamp for voting start
- `_endTime` (uint256): Unix timestamp for voting end

**Returns:**
- `uint256`: Election ID for reference

**Modifiers:**
- `onlyCommissioner`: Only commissioners can create elections

**Reverts:**
- "Election name cannot be empty" - If name is empty
- "Invalid time range" - If startTime >= endTime
- "Start time must be in future" - If startTime is in past

**Events Emitted:**
- `ElectionCreated(electionId, name, startTime, endTime, creator)`

**Example:**
```solidity
uint256 electionId = votingSystem.createElection(
    "Presidential Election 2024",
    block.timestamp + 1 days,
    block.timestamp + 8 days
);
```

---

### `registerCandidate(uint256 _electionId, string memory _candidateName)`

Registers a candidate for an election.

**Parameters:**
- `_electionId` (uint256): ID of the election
- `_candidateName` (string): Name of the candidate

**Returns:**
- `uint256`: Candidate ID

**Modifiers:**
- `electionExists`: Election must exist

**Reverts:**
- "Candidate name cannot be empty" - If name is empty
- "Only commissioners can register candidates" - If not authorized
- "Election is finalized" - If election already finalized

**Events Emitted:**
- `CandidateRegistered(electionId, candidateId, candidateName)`

**Example:**
```solidity
uint256 candidateId = votingSystem.registerCandidate(
    electionId,
    "Alice Johnson"
);
```

---

### `registerVoter(uint256 _electionId, address _voterAddress)`

Registers a single voter for an election.

**Parameters:**
- `_electionId` (uint256): ID of the election
- `_voterAddress` (address): Address of the voter

**Modifiers:**
- `electionExists`: Election must exist

**Reverts:**
- "Invalid voter address" - If address is zero
- "Only commissioners can register voters" - If not authorized
- "Voter already registered" - If voter already registered

**Events Emitted:**
- `VoterRegistered(electionId, voterAddress)`

**Example:**
```solidity
votingSystem.registerVoter(
    electionId,
    0x1234567890123456789012345678901234567890
);
```

---

### `batchRegisterVoters(uint256 _electionId, address[] calldata _voterAddresses)`

Registers multiple voters at once (gas efficient).

**Parameters:**
- `_electionId` (uint256): ID of the election
- `_voterAddresses` (address[]): Array of voter addresses

**Modifiers:**
- `electionExists`: Election must exist

**Reverts:**
- "Only commissioners can register voters" - If not authorized

**Events Emitted:**
- `VoterRegistered(electionId, voterAddress)` for each voter

**Gas Efficiency:**
- More efficient than calling `registerVoter` multiple times

**Example:**
```solidity
address[] memory voters = new address[](3);
voters[0] = 0x1111111111111111111111111111111111111111;
voters[1] = 0x2222222222222222222222222222222222222222;
voters[2] = 0x3333333333333333333333333333333333333333;

votingSystem.batchRegisterVoters(electionId, voters);
```

---

### `finalizeElection(uint256 _electionId)`

Locks election results and prevents further changes.

**Parameters:**
- `_electionId` (uint256): ID of the election to finalize

**Modifiers:**
- `electionExists`: Election must exist

**Reverts:**
- "Only commissioners can finalize elections" - If not authorized
- "Voting period not ended" - If endTime not reached
- "Election already finalized" - If already finalized

**Events Emitted:**
- `ElectionFinalized(electionId, timestamp)`

**Effects:**
- Sets `isFinalized = true`
- Sets `isActive = false`
- Results are immutable after this

**Example:**
```solidity
votingSystem.finalizeElection(electionId);
```

---

### `endVotingEarly(uint256 _electionId)`

Terminates voting period before scheduled end time.

**Parameters:**
- `_electionId` (uint256): ID of the election

**Modifiers:**
- `electionExists`: Election must exist

**Reverts:**
- "Only commissioners can end voting" - If not authorized
- "Election is not active" - If already inactive

**Events Emitted:**
- `ElectionStatusChanged(electionId, isActive, timestamp)`

**Example:**
```solidity
votingSystem.endVotingEarly(electionId);
```

---

### `deactivateCandidate(uint256 _electionId, uint256 _candidateId)`

Deactivates a candidate from voting options.

**Parameters:**
- `_electionId` (uint256): ID of the election
- `_candidateId` (uint256): ID of the candidate

**Modifiers:**
- `electionExists`: Election must exist

**Reverts:**
- "Only commissioners can deactivate candidates" - If not authorized
- "Invalid candidate ID" - If candidate doesn't exist
- "Election is finalized" - If election already finalized

**Example:**
```solidity
votingSystem.deactivateCandidate(electionId, candidateId);
```

---

## Voting Functions

### `vote(uint256 _electionId, uint256 _candidateId)`

Casts a vote for a candidate in an election.

**Parameters:**
- `_electionId` (uint256): ID of the election
- `_candidateId` (uint256): ID of the candidate to vote for

**Modifiers:**
- `electionActive`: Election must be active and in voting period
- `voterNotVoted`: Voter must be registered and not have voted

**Reverts:**
- "Election is not active" - If election inactive
- "Election is not in voting period" - If outside voting window
- "Voter has already voted" - If voter already cast vote
- "Voter is not registered" - If voter not registered
- "Invalid candidate ID" - If candidate doesn't exist
- "Candidate is not active" - If candidate deactivated

**Events Emitted:**
- `VoteRecorded(electionId, voter, candidateId, timestamp)`

**Effects:**
- Records voter's vote
- Increments candidate vote count
- Increments election total votes
- Marks voter as voted with timestamp

**Gas Cost:** ~70,000 gas

**Example:**
```solidity
votingSystem.vote(electionId, candidateId);
```

---

## Query Functions

### `getElection(uint256 _electionId)`

Retrieves election details.

**Parameters:**
- `_electionId` (uint256): ID of the election

**Returns:**
```solidity
struct Election {
    uint256 electionId;
    string electionName;
    uint256 startTime;
    uint256 endTime;
    bool isActive;
    bool isFinalized;
    address creator;
    uint256 totalVotes;
}
```

**Gas Cost:** ~5,000 gas (read-only)

**Example:**
```solidity
BlockchainVotingSystem.Election memory election = 
    votingSystem.getElection(electionId);
console.log(election.electionName);
console.log(election.totalVotes);
```

---

### `getCandidate(uint256 _electionId, uint256 _candidateId)`

Retrieves candidate details.

**Parameters:**
- `_electionId` (uint256): ID of the election
- `_candidateId` (uint256): ID of the candidate

**Returns:**
```solidity
struct Candidate {
    uint256 id;
    string name;
    uint256 voteCount;
    bool isActive;
    uint256 registrationTime;
}
```

**Reverts:**
- "Invalid candidate ID" - If candidate doesn't exist

**Example:**
```solidity
BlockchainVotingSystem.Candidate memory candidate = 
    votingSystem.getCandidate(electionId, candidateId);
console.log(candidate.name);
console.log(candidate.voteCount);
```

---

### `getAllCandidates(uint256 _electionId)`

Retrieves all candidates for an election.

**Parameters:**
- `_electionId` (uint256): ID of the election

**Returns:**
- `Candidate[]`: Array of all candidates

**Example:**
```solidity
BlockchainVotingSystem.Candidate[] memory candidates = 
    votingSystem.getAllCandidates(electionId);

for (uint256 i = 0; i < candidates.length; i++) {
    console.log(candidates[i].name, candidates[i].voteCount);
}
```

---

### `getVoter(uint256 _electionId, address _voterAddress)`

Retrieves voter information.

**Parameters:**
- `_electionId` (uint256): ID of the election
- `_voterAddress` (address): Address of the voter

**Returns:**
```solidity
struct Voter {
    address voterAddress;
    bool hasVoted;
    uint256 votedFor;
    uint256 votingTime;
    bool isRegistered;
}
```

**Example:**
```solidity
BlockchainVotingSystem.Voter memory voter = 
    votingSystem.getVoter(electionId, voterAddress);
    
require(voter.isRegistered, "Voter not registered");
console.log("Has voted:", voter.hasVoted);
```

---

### `getWinner(uint256 _electionId)`

Retrieves the winning candidate.

**Parameters:**
- `_electionId` (uint256): ID of the election

**Returns:**
- `Candidate`: Candidate with highest vote count

**Reverts:**
- "Election is not finalized" - If election not finalized
- "No candidates in this election" - If no candidates

**Example:**
```solidity
BlockchainVotingSystem.Candidate memory winner = 
    votingSystem.getWinner(electionId);
console.log("Winner:", winner.name);
console.log("Votes:", winner.voteCount);
```

---

### `getResults(uint256 _electionId)`

Retrieves all candidates with their vote counts.

**Parameters:**
- `_electionId` (uint256): ID of the election

**Returns:**
- `Candidate[]`: All candidates sorted by registration order

**Example:**
```solidity
BlockchainVotingSystem.Candidate[] memory results = 
    votingSystem.getResults(electionId);

for (uint256 i = 0; i < results.length; i++) {
    console.log(results[i].name, results[i].voteCount);
}
```

---

### `getRegisteredVotersCount(uint256 _electionId)`

Gets total registered voters for an election.

**Parameters:**
- `_electionId` (uint256): ID of the election

**Returns:**
- `uint256`: Number of registered voters

**Example:**
```solidity
uint256 voterCount = votingSystem.getRegisteredVotersCount(electionId);
console.log("Total voters:", voterCount);
```

---

### `getCandidatesCount(uint256 _electionId)`

Gets total candidates for an election.

**Parameters:**
- `_electionId` (uint256): ID of the election

**Returns:**
- `uint256`: Number of candidates

**Example:**
```solidity
uint256 candidateCount = votingSystem.getCandidatesCount(electionId);
console.log("Total candidates:", candidateCount);
```

---

## Events

### `VoteRecorded`

Emitted when a vote is recorded.

```solidity
event VoteRecorded(
    indexed uint256 electionId,
    indexed address voter,
    indexed uint256 candidateId,
    uint256 timestamp
);
```

**Parameters:**
- `electionId`: Election ID
- `voter`: Address of voter (indexed)
- `candidateId`: ID of voted candidate
- `timestamp`: Block timestamp

---

### `ElectionCreated`

Emitted when election is created.

```solidity
event ElectionCreated(
    indexed uint256 electionId,
    string electionName,
    uint256 startTime,
    uint256 endTime,
    address creator
);
```

---

### Other Events

- `CandidateRegistered(electionId, candidateId, candidateName)`
- `VoterRegistered(electionId, voterAddress)`
- `ElectionFinalized(electionId, timestamp)`
- `ElectionStatusChanged(electionId, isActive, timestamp)`

---

## Error Codes

| Error | Cause | Solution |
|-------|-------|----------|
| "Only administrator" | Not admin | Use admin account |
| "Only commissioners" | Not commissioner | Request commissioner role |
| "Election not found" | Invalid ID | Check election ID |
| "Already voted" | Duplicate vote | Each address votes once |
| "Not registered" | No voter record | Register as voter |
| "Voting period ended" | Outside time window | Check election times |
| "Invalid candidate" | Bad candidate ID | Use valid candidate ID |

---

**Last Updated**: February 2026
**Version**: 1.0.0
