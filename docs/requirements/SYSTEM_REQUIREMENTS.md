# System Requirements

## Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 2-core processor | 4+ core processor |
| **RAM** | 4 GB | 8+ GB |
| **Storage** | 1 GB | 5+ GB SSD |
| **Network** | Stable internet | High-speed connection |

## Software Requirements

### Operating System
- ✅ Windows 10/11 (x64)
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu 18.04+, Debian, CentOS)

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Foundry** | Latest | Smart contract development |
| **Git** | 2.30+ | Version control |
| **Node.js** | 16+ | JavaScript runtime (optional) |
| **Solidity** | ^0.8.20 | Smart contract language |
| **Rust** | (via Foundry) | Backend for Foundry |

### Project Dependencies

```toml
[dependencies]
Solidity = "^0.8.20"
OpenZeppelin-Contracts = "4.9.0+"
Solmate = "Latest"
```

## Installation Instructions

### 1. Foundry Installation

**Windows (WSL Recommended):**
```bash
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup
```

**macOS:**
```bash
brew install foundry
```

**Linux:**
```bash
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup
```

### 2. Git Installation

**Windows:**
- Download from https://git-scm.com/download/win

**macOS:**
```bash
brew install git
```

**Linux:**
```bash
sudo apt-get install git
```

### 3. Project Setup

```bash
# Clone repository
git clone <repository-url>
cd Blockchain-Voting-System

# Install Foundry libraries
forge install

# Verify installation
forge --version
anvil --version
cast --version
```

## Verification Checklist

- [ ] Foundry installed: `forge --version`
- [ ] Anvil working: `anvil --version`
- [ ] Cast available: `cast --version`
- [ ] Git configured: `git --version`
- [ ] Node.js installed: `node --version` (optional)
- [ ] Project dependencies: Check `lib/` folder has OpenZeppelin and Solmate

## System Specifications

### Solidity Compiler
```
Version: 0.8.20
Optimizer: Enabled
Optimizer Runs: 200
```

### Network Requirements
- **Local Testing**: Anvil (no network required)
- **Testnet**: Sepolia RPC endpoint required
- **Mainnet**: Full Ethereum RPC endpoint required

## Performance Benchmarks

| Operation | Gas | Time (Anvil) |
|-----------|-----|--------------|
| Deploy Contract | ~2,000,000 | <1s |
| Create Election | ~120,000 | <1s |
| Register Candidate | ~50,000 | <1s |
| Register Voter | ~60,000 | <1s |
| Cast Vote | ~70,000 | <1s |
| Query Results | 0 | <1s |

## Troubleshooting

### Foundry Not Found
- **Solution**: Ensure `~/.foundry/bin` is in PATH
- **Windows**: Add to PATH manually or use WSL

### Permission Denied on Linux
```bash
chmod +x ~/.foundry/bin/forge
chmod +x ~/.foundry/bin/anvil
```

### Out of Memory
- Increase system RAM or reduce test load
- Use `--jobs 1` flag for serial execution

## Browser Requirements

For interacting with contract via web interface (optional):
- Chrome 90+
- Firefox 88+
- Safari 14+
- MetaMask extension 10.1+

---

**Last Updated**: February 2026
