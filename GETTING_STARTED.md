# Getting Started with Blockchain Voting System

## System Requirements

- **OS**: Windows, macOS, or Linux
- **Node.js**: v16+ (optional, for web3 interactions)
- **Foundry**: Latest version
- **Git**: For version control
- **RAM**: 4GB minimum
- **Disk**: 500MB for dependencies

## Installation Steps

### Step 1: Install Foundry

**Windows (PowerShell):**
```powershell
# Download and run the installation script
irm https://foundry.paradigm.xyz | iex
```

**macOS/Linux (Bash):**
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Verify installation:
```bash
forge --version
anvil --version
cast --version
```

### Step 2: Clone and Setup Project

```bash
# Clone repository
git clone <repository-url>
cd Blockchain-Voting-System

# Install Foundry dependencies
forge install OpenZeppelin/openzeppelin-contracts
```

### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
# For local testing, you can leave defaults
```

## Development Workflow

### 1. Compile Smart Contracts

```bash
# Standard build
forge build

# With optimization
forge build --optimize

# Check for warnings
forge build --warn
```

### 2. Run Tests

```bash
# Run all tests
forge test

# Verbose output (shows all logs)
forge test -vv

# Very verbose (shows stack traces)
forge test -vvv

# Run specific test
forge test --match testVote -vv

# Run specific file
forge test test/VotingSystem.t.sol

# Generate gas report
forge test --gas-report > gas-report.txt

# With coverage (requires forge-coverage)
forge coverage
```

### 3. Local Deployment with Anvil

**Terminal 1: Start Local Blockchain**
```bash
# Start Anvil with default settings
anvil

# Or with custom port
anvil --port 8546

# With specific block time
anvil --block-time 1
```

**Terminal 2: Deploy Contract**
```bash
# Deploy to local Anvil
forge script script/Deploy.s.sol:DeployVotingSystem \
    --rpc-url http://localhost:8545 \
    --broadcast

# With private key
forge script script/Deploy.s.sol:DeployVotingSystem \
    --rpc-url http://localhost:8545 \
    --broadcast \
    --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb476c6b8d6c1f02b57413b5efdc7
```

### 4. Format Code

```bash
# Format all files
forge fmt

# Format specific file
forge fmt src/VotingSystem.sol

# Check formatting without changes
forge fmt --check
```

### 5. Lint and Analysis

```bash
# Check for issues
forge build --warn

# Use Slither for security analysis
slither src/

# Use Mythril for deeper analysis
myth analyze src/VotingSystem.sol
```

## Testnet Deployment

### Sepolia Testnet

```bash
# Set environment variables
export PRIVATE_KEY=<your-private-key>
export ETHERSCAN_API_KEY=<your-etherscan-key>

# Deploy to Sepolia
forge script script/Deploy.s.sol:DeployVotingSystem \
    --rpc-url https://sepolia.infura.io/v3/<YOUR_KEY> \
    --broadcast \
    --verify \
    --etherscan-api-key $ETHERSCAN_API_KEY

# Verify contract on Etherscan
forge verify-contract <contract-address> VotingSystem \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --chain-id 11155111
```

### Other Testnets

```bash
# Goerli (Deprecated but still available)
forge script script/Deploy.s.sol:DeployVotingSystem \
    --rpc-url https://goerli.infura.io/v3/<KEY> \
    --broadcast

# Amoy (Polygon)
forge script script/Deploy.s.sol:DeployVotingSystem \
    --rpc-url https://rpc-amoy.polygon.technology \
    --broadcast
```

## Mainnet Deployment

⚠️ **CRITICAL**: Only deploy after:
- Comprehensive testing
- Security audit
- Testnet validation
- Team review

```bash
# Set secure environment variables
export PRIVATE_KEY=<mainnet-private-key>
export ETHERSCAN_API_KEY=<etherscan-key>

# Simulate deployment first
forge script script/Deploy.s.sol:DeployVotingSystem \
    --rpc-url <mainnet-rpc> \
    --gas-price 50 \
    --simulate

# Actual deployment
forge script script/Deploy.s.sol:DeployVotingSystem \
    --rpc-url <mainnet-rpc> \
    --broadcast \
    --verify \
    --slow \
    --etherscan-api-key $ETHERSCAN_API_KEY
```

## Testing Best Practices

### Writing Tests

```solidity
// Good test structure
function testVoteSucceeds() public {
    _setupElection();
    uint256 candidateId = votingSystem.registerCandidate(electionId, "Alice");
    votingSystem.registerVoter(electionId, voter1);
    
    vm.warp(block.timestamp + 1.5 days); // Move to voting period
    vm.prank(voter1);
    votingSystem.vote(electionId, candidateId);
    
    BlockchainVotingSystem.Voter memory v = votingSystem.getVoter(electionId, voter1);
    assertTrue(v.hasVoted);
}

// Test error cases
function testVoteFailsIfNotRegistered() public {
    _setupElection();
    vm.warp(block.timestamp + 1.5 days);
    
    vm.prank(attacker);
    vm.expectRevert("Voter is not registered");
    votingSystem.vote(electionId, 0);
}
```

### Running Test Suites

```bash
# Run everything
forge test

# Run with specific verbosity
forge test -v      # Normal
forge test -vv     # Verbose
forge test -vvv    # Very verbose

# Filter tests
forge test --match "*Candidate*"
forge test --match-contract "VotingSystemTest"
forge test --match-path "test/VotingSystem.t.sol"

# Gas optimization checks
forge test --gas-report | head -50
```

## Debugging Tips

### Using Cheatcodes

```solidity
// Time manipulation
vm.warp(block.timestamp + 1 days);
vm.roll(block.number + 1000);

// Account manipulation
vm.prank(otherAddress);  // Next call from otherAddress
vm.startPrank(address);  // All calls from address until stopPrank
vm.stopPrank();

// Event testing
vm.expectEmit(true, true, false, true);
emit VoteRecorded(electionId, voter1, 0, block.timestamp);
votingSystem.vote(electionId, 0);

// Error testing
vm.expectRevert("Error message");
votingSystem.vote(electionId, 0);
```

### Debug Output

```solidity
// Add logs to understand flow
console.log("Vote count:", voteCount);
console.log("Voter:", voter);
console.log("Election ID:", electionId);

// In tests, run with -vv to see logs
forge test -vv
```

## Common Issues & Solutions

### Issue: "Contract not found"
```bash
# Solution: Rebuild
forge clean
forge build
```

### Issue: "Insufficient balance" during deployment
```bash
# Solution: Check account has funds
cast balance <address> --rpc-url <rpc>
# Or use funded Anvil account
```

### Issue: Tests failing locally
```bash
# Solutions:
# 1. Check Solidity version
solc --version

# 2. Clear build cache
forge clean

# 3. Rebuild and test
forge build && forge test -vvv
```

### Issue: "Private key not found"
```bash
# Solution: Set environment variable
export PRIVATE_KEY=0x...
# Or use --private-key flag
forge script ... --private-key 0x...
```

## Useful Commands Reference

```bash
# Building & Compilation
forge build                          # Compile contracts
forge build --optimize              # With optimization
forge inspect VotingSystem           # Show contract details

# Testing
forge test                           # Run all tests
forge test -vv                       # Verbose output
forge test --gas-report              # Gas usage
forge coverage                       # Code coverage

# Deployment
forge script script/Deploy.s.sol ... # Deploy contract
forge verify-contract ...            # Verify on Etherscan
forge flatten src/VotingSystem.sol   # Flatten contract

# Development
forge fmt                            # Format code
forge clean                          # Clean build
forge tree                           # Show dependency tree
cast <command>                       # CLI utilities

# Anvil (Local Blockchain)
anvil                                # Start local chain
anvil --fork-url <rpc>              # Fork existing network
anvil --accounts 10                  # Create 10 accounts
```

## Performance Tips

### Gas Optimization
- ✅ Use batch operations (batchRegisterVoters)
- ✅ Avoid loops in views
- ✅ Cache storage reads
- ✅ Use events for audit logs

### Testing Performance
```bash
# Parallel test execution
forge test --jobs 4

# Skip slow tests
forge test --no-match-contract SlowTests
```

## Security Checklist

Before deployment:

- [ ] All tests passing
- [ ] Gas report reviewed
- [ ] No compiler warnings
- [ ] Security analysis done (Slither)
- [ ] Code reviewed by team
- [ ] Testnet deployment successful
- [ ] 24 hour review period complete
- [ ] Mainnet parameters correct

## Resources

- **Foundry Book**: https://book.getfoundry.sh/
- **Solidity Docs**: https://docs.soliditylang.org/
- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts/
- **Ethereum.org**: https://ethereum.org/en/developers/

## Support

For issues:
1. Check documentation
2. Review test cases
3. Check contract comments
4. Run with -vvv verbosity

---

**Happy Building! 🚀**
