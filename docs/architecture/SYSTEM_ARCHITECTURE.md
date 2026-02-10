# Voting System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   BlockchainVotingSystem                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Smart Contract Layer                      │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │         VotingSystem.sol (Core)              │   │   │
│  │  │  - Election Management                       │   │   │
│  │  │  - Voter Registration                        │   │   │
│  │  │  - Candidate Management                      │   │   │
│  │  │  - Vote Casting & Recording                  │   │   │
│  │  │  - Results Calculation                       │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ▲                                   │
│                           │                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Ethereum Blockchain                        │   │
│  │  - Distributed Ledger                               │   │
│  │  - Immutable Records                                │   │
│  │  - Consensus Mechanism                              │   │
│  │  - Transaction Finality                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Contract Architecture

### Main Components

```
BlockchainVotingSystem
├── State Management
│   ├── Elections mapping
│   ├── Candidates mapping
│   ├── Voters mapping
│   └── Registries
│
├── Access Control
│   ├── Administrator
│   ├── Commissioners
│   └── Voters
│
├── Business Logic
│   ├── Election Lifecycle
│   ├── Registration Process
│   ├── Voting Engine
│   └── Results Processing
│
└── Event Logging
    ├── VoteRecorded
    ├── ElectionCreated
    ├── CandidateRegistered
    ├── VoterRegistered
    ├── ElectionFinalized
    └── ElectionStatusChanged
```

## Data Flow Architecture

### Election Lifecycle Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. SETUP PHASE                                          │
│    - Administrator creates election                     │
│    - Commissioners register candidates                  │
│    - Commissioners register voters                      │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│ 2. VOTING PHASE                                         │
│    - Voters cast votes (within time window)             │
│    - Each vote is recorded immutably                    │
│    - Vote counts updated in real-time                   │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│ 3. FINALIZATION PHASE                                   │
│    - Voting period ends                                 │
│    - Results locked and finalized                       │
│    - Winner calculated and verified                     │
└─────────────────────────────────────────────────────────┘
```

## Module Architecture

### 1. Election Management Module
```
Functions:
- createElection()           - Initialize new election
- finalizeElection()         - Lock results
- endVotingEarly()          - Terminate voting period
- getElection()             - Retrieve election data
```

### 2. Registration Module
```
Functions:
- registerCandidate()       - Add candidate
- registerVoter()           - Register single voter
- batchRegisterVoters()     - Bulk voter registration
- getRegisteredVotersCount()- Voter statistics
```

### 3. Voting Module
```
Functions:
- vote()                    - Cast vote
- voterNotVoted()          - Prevent double voting
- getVoter()               - Check voter status
```

### 4. Query Module
```
Functions:
- getResults()             - Get all candidates with votes
- getWinner()              - Determine winner
- getAllCandidates()       - List all candidates
- getCandidatesCount()     - Count statistics
```

### 5. Access Control Module
```
Functions:
- addCommissioner()        - Add administrator
- removeCommissioner()     - Remove administrator
- transferAdmin()          - Transfer admin role
- Modifiers: onlyAdmin(), onlyCommissioner()
```

## State Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    ELECTION STATES                       │
└──────────────────────────────────────────────────────────┘

     ┌─────────────────────────────────────┐
     │       CREATED                       │
     │   isActive = true                   │
     │   isFinalized = false               │
     │   startTime > now                   │
     └──────────────┬──────────────────────┘
                    │
                    ▼
     ┌─────────────────────────────────────┐
     │       IN_VOTING                     │
     │   isActive = true                   │
     │   isFinalized = false               │
     │   now >= startTime                  │
     │   now < endTime                     │
     └──────────────┬──────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
     FINALIZED            CANCELLED
   (time ends)         (early end)
     
   isActive = false
   isFinalized = true
```

## Data Structures

### Election Structure
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

### Candidate Structure
```solidity
struct Candidate {
    uint256 id;
    string name;
    uint256 voteCount;
    bool isActive;
    uint256 registrationTime;
}
```

### Voter Structure
```solidity
struct Voter {
    address voterAddress;
    bool hasVoted;
    uint256 votedFor;
    uint256 votingTime;
    bool isRegistered;
}
```

## Storage Layout

```
Election Management:
├── electionCounter          (uint256) - Election ID generator
├── elections mapping        (Election[]) - All elections
├── candidateIds mapping     (uint256[][]) - Candidate arrays per election
└── registeredVoters mapping (address[][]) - Voter arrays per election

Candidate Management:
├── candidates mapping       (Candidate[][]) - Candidates per election

Voter Management:
├── voters mapping           (Voter mapping) - Voter records per election

Access Control:
├── administrator            (address) - Admin address
└── isElectionCommissioner   (bool[]) - Commissioner flags
```

## Event Architecture

### Event Hierarchy

```
┌─────────────────────────────────────────────────────┐
│           System Events (Audit Trail)               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ElectionCreated                                    │
│  ├── electionId, name, startTime, endTime, creator│
│  └── Emitted when: New election created            │
│                                                     │
│  CandidateRegistered                                │
│  ├── electionId, candidateId, candidateName       │
│  └── Emitted when: Candidate registered            │
│                                                     │
│  VoterRegistered                                    │
│  ├── electionId, voterAddress                      │
│  └── Emitted when: Voter registered                │
│                                                     │
│  VoteRecorded ⭐ (Most Important)                   │
│  ├── electionId, voter, candidateId, timestamp    │
│  └── Emitted when: Vote cast                       │
│                                                     │
│  ElectionFinalized                                  │
│  ├── electionId, timestamp                         │
│  └── Emitted when: Election locked                 │
│                                                     │
│  ElectionStatusChanged                              │
│  ├── electionId, isActive, timestamp               │
│  └── Emitted when: Status change                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌──────────────────────────────────────────────────────┐
│          SECURITY LAYERS                             │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Layer 1: Access Control                             │
│ ├── Role-based permissions                          │
│ ├── Function modifiers (onlyAdmin, onlyCommissioner)│
│ └── Voter registration requirements                 │
│                                                      │
│ Layer 2: Input Validation                           │
│ ├── Address verification                            │
│ ├── String length validation                        │
│ ├── Time range checks                               │
│ └── Candidate existence verification                │
│                                                      │
│ Layer 3: Vote Integrity                             │
│ ├── One-vote-per-voter enforcement                  │
│ ├── Time-locked voting windows                      │
│ ├── Active candidate verification                   │
│ └── Double-voting prevention                        │
│                                                      │
│ Layer 4: Immutability                               │
│ ├── Blockchain security                             │
│ ├── Finalized election locking                      │
│ └── Cryptographic hashing                           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Integration Points

### External Integrations
- **Ethereum Network**: For deployment and execution
- **Etherscan**: For contract verification and monitoring
- **MetaMask**: For user interaction (web front-end)

### Internal Integrations
- **OpenZeppelin Contracts**: For standard patterns (if used)
- **Foundry Framework**: For development and testing
- **Solidity Language**: Core implementation

## Deployment Architecture

```
Development
    ↓
Local Testing (Anvil)
    ↓
Testnet (Sepolia)
    ↓
Mainnet (Ethereum)
    ↓
Monitoring & Maintenance
```

---

**Last Updated**: February 2026
