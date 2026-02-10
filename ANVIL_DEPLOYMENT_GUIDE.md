# Anvil Deployment Walkthrough

## Prerequisites
- Foundry installed (`forge --version` should work)
- Node.js 18+ installed
- MetaMask browser extension installed

---

## Step 1: Start Anvil Local Blockchain

Open a terminal and run:
```bash
cd C:\Users\HP\Blockchain-Voting-System
anvil
```

**Expected output:**
```
                 _   _
                (_) | |
   __ _ _ __   ___ _| |
  / _` | '_ \ / __| | |
 | (_| | | | | (__| | |
  \__,_|_| |_|\___|_|_|

Listening on 127.0.0.1:8545
```

**Keep this terminal open** — Anvil must run continuously.

**Anvil provides:**
- 10 pre-funded test accounts with 10,000 ETH each
- Account 0: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (Default deployer)
- Private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb476c4b0ff4cc19f1c3760af4cdf`

---

## Step 2: Configure MetaMask for Local Anvil

1. Open MetaMask in your browser
2. Click network dropdown (top left)
3. Select "Add Network" → "Add Network Manually"
4. Fill in:
   - **Network name:** Anvil (or Local)
   - **RPC URL:** http://localhost:8545
   - **Chain ID:** 31337
   - **Currency:** ETH
   - **Block Explorer URL:** (leave blank)
5. Click "Save"
6. Switch to this network

---

## Step 3: Import Anvil Test Account (Optional)

To use Anvil's pre-funded account in MetaMask:

1. In MetaMask, click account icon → "Import account"
2. Paste Anvil private key:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb476c4b0ff4cc19f1c3760af4cdf
   ```
3. Click "Import"
4. Select this account

**Note:** This account has 10,000 test ETH on Anvil.

---

## Step 4: Deploy Smart Contract

Open a **new terminal** (keep Anvil running in first terminal):

```bash
cd C:\Users\HP\Blockchain-Voting-System

# Run deployment script
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

**Expected output:**
```
Deploying VotingSystem...
Transaction hash: 0x...
Contract deployed at: 0x5FbDB2315678afccb333f8a9c36c6b00ea2f86f...
```

**Copy the contract address** (starts with `0x5FbD...` or similar)

---

## Step 5: Update Frontend Environment

1. Open `my-vite-app/.env.local`
2. Replace the contract address:
   ```
   VITE_CONTRACT_ADDRESS=0x5FbDB2315678afccb333f8a9c36c6b00ea2f86f...
   VITE_RPC_URL=http://localhost:8545
   ```
3. Save the file
4. Restart Vite dev server (if running): `Ctrl+C` and `npm run dev`

---

## Step 6: Test Frontend Connection

1. Open http://localhost:5175/ in your browser
2. Click "Connect Wallet"
3. MetaMask will prompt — approve connection
4. You should see your account address in the header
5. Click "Admin" → Create an election:
   - Name: "Test Election"
   - Start Time: now
   - End Time: +1 hour
   - Click "Create Election"
6. Check Anvil terminal — you should see transaction receipt

---

## Troubleshooting

**"Contract not found" error:**
- ✅ Verify `.env.local` has correct contract address
- ✅ Verify Anvil is running on port 8545
- ✅ Check `VITE_RPC_URL=http://localhost:8545`

**"MetaMask: Chain ID mismatch":**
- ✅ MetaMask network chain ID should be 31337
- ✅ RPC URL should be http://localhost:8545 (not https)

**Anvil won't start:**
- ✅ Ensure port 8545 is not in use: `netstat -ano | findstr :8545`
- ✅ Try different port: `anvil --port 8546`

**Transaction failed in frontend:**
- ✅ Check Anvil terminal for error logs
- ✅ Ensure MetaMask account has ETH (should auto-have 10,000)
- ✅ Verify you're on Anvil network, not mainnet

---

## Common Commands

```bash
# Reset Anvil state
anvil --fork-block-number 1

# Use custom port
anvil --port 8546

# Persist state (save to file)
anvil --state-file ./anvil-state.json

# View accounts
anvil --accounts 20
```

---

## Next Steps
- Register candidates → vote → view results
- Test admin functions (create/finalize elections)
- Test voter registration (single/batch)
