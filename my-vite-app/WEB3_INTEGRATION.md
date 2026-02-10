# Web3 Integration Setup

## Environment Configuration

Create a `.env.local` file in the `my-vite-app` directory:

```env
# Smart Contract Address (deploy and add here)
VITE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# RPC Provider URL
VITE_RPC_URL=http://localhost:8545

# Network
VITE_NETWORK=localhost
```

## Files Created

### 1. `src/contracts/VotingSystem.abi.json`
- Complete contract ABI for ethers.js integration
- All functions, events, and types defined

### 2. `src/services/VotingService.js`
- Service layer for contract interaction
- Handles:
  - Wallet connection (MetaMask)
  - Election management
  - Candidate registration
  - Voting
  - Results querying
  - Event listeners

**Usage Example:**
```javascript
import { votingService } from './services/VotingService';

// Connect wallet
await votingService.connectWallet();

// Cast vote
await votingService.vote(electionId, candidateId);

// Get results
const results = await votingService.getResults(electionId);
```

### 3. `src/hooks/useVotingSystem.js`
- Custom React hook for component integration
- Manages state (account, connected, loading, error)
- Provides functions to interact with contract

**Usage Example:**
```javascript
import { useVotingSystem } from './hooks/useVotingSystem';

function MyComponent() {
  const { 
    account, 
    connected, 
    connectWallet, 
    vote, 
    getResults 
  } = useVotingSystem();

  return (
    <>
      {connected ? (
        <button onClick={() => vote(0, 1)}>Vote</button>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </>
  );
}
```

### 4. `src/components/ElectionView.jsx`
- Complete voting UI component
- Features:
  - Wallet connection
  - Election selection
  - Candidate voting
  - Real-time results display
  - Voter status tracking

**Features:**
- ✅ MetaMask wallet integration
- ✅ Election selection and loading
- ✅ Candidate voting interface
- ✅ Live vote counting
- ✅ Voter status display
- ✅ Error handling
- ✅ Loading states

## Integration Steps

### 1. Update App.jsx

```javascript
import ElectionView from './components/ElectionView';
import './App.css';

function App() {
  return <ElectionView />;
}

export default App;
```

### 2. Set Contract Address

1. Deploy contract to local/testnet/mainnet
2. Copy contract address
3. Update `.env.local`:
   ```
   VITE_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
   ```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` and connect your wallet!

## Testing the Integration

### Local Testing with Anvil

**Terminal 1 - Start Anvil:**
```bash
cd c:\Users\HP\Blockchain-Voting-System
anvil
```

**Terminal 2 - Deploy Contract:**
```bash
forge script script/Deploy.s.sol:DeployVotingSystem \
  --rpc-url http://localhost:8545 \
  --broadcast
```

**Terminal 3 - Start Vite App:**
```bash
cd my-vite-app
npm run dev
```

**Browser:**
1. Open `http://localhost:5173`
2. Add Anvil to MetaMask:
   - Network: `localhost`
   - RPC: `http://localhost:8545`
   - Chain ID: `31337`
3. Import Anvil account (private key from Terminal 1)
4. Update `.env.local` with deployed contract address
5. Connect wallet and vote!

## Component Structure

```
App
└── ElectionView
    ├── useVotingSystem (hook)
    ├── Header (account display)
    ├── Election Selection
    ├── Election Info
    ├── Voter Status
    ├── Candidates (voting interface)
    └── Results (vote counts)
```

## Available Functions

### VotingService

**Connection:**
- `connectWallet()` - Connect MetaMask wallet
- `getConnectedAccount()` - Get current account
- `isConnected()` - Check connection status

**Elections:**
- `createElection(name, startTime, endTime)` - Create new election
- `getElection(electionId)` - Get election details
- `finalizeElection(electionId)` - Lock results

**Candidates:**
- `registerCandidate(electionId, name)` - Register candidate
- `getAllCandidates(electionId)` - Get candidates
- `getCandidate(electionId, candidateId)` - Get single candidate

**Voting:**
- `vote(electionId, candidateId)` - Cast vote
- `getVoter(electionId, voterAddress)` - Get voter info
- `getResults(electionId)` - Get results

**Utilities:**
- `onVoteRecorded(callback)` - Listen to vote events
- `removeAllListeners()` - Stop listening

## Error Handling

All functions wrap errors gracefully:

```javascript
try {
  const results = await votingService.getResults(electionId);
} catch (error) {
  console.error('Failed to get results:', error);
  // Handle error in UI
}
```

## Network Configuration

**Local (Anvil):**
```env
VITE_RPC_URL=http://localhost:8545
VITE_NETWORK=localhost
```

**Sepolia Testnet:**
```env
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
VITE_NETWORK=sepolia
```

**Mainnet:**
```env
VITE_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
VITE_NETWORK=mainnet
```

---

**Ready to vote on blockchain!** 🚀
