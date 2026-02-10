# Foundry Installation Guide for Windows

## ⚠️ Current Status
`anvil` and `forge` are not installed on your system.

---

## Installation Options

### Option 1: Using PowerShell (Easiest)
```powershell
# Run PowerShell as Administrator and execute:
irm https://foundry.paradigm.xyz | iex

# This will install:
# - forge (compiler)
# - cast (CLI tool)
# - anvil (local blockchain)
```

**If the above fails**, try Option 2 below.

---

### Option 2: Download Pre-built Binary (Manual)

1. **Download from GitHub:**
   - Go to: https://github.com/foundry-rs/foundry/releases
   - Download: `foundry_nightly_win32_gnu.zip` (or latest Windows x86_64 version)

2. **Extract and Setup:**
   - Extract the `.zip` to a folder, e.g., `C:\foundry\`
   - You'll have: `anvil.exe`, `forge.exe`, `cast.exe`

3. **Add to PATH:**
   - Open System Properties:
     - Right-click "This PC" → Properties
     - Click "Advanced system settings"
     - Click "Environment Variables"
   - Under "System variables", find `Path` and click "Edit"
   - Click "New" and add: `C:\foundry\`
   - Click OK and restart terminals

4. **Verify Installation:**
   ```bash
   forge --version
   anvil --version
   ```

---

### Option 3: Using WSL (Windows Subsystem for Linux)

If you have WSL2 with Ubuntu:

```bash
# In WSL terminal:
curl -L https://foundry.paradigm.xyz | bash

# Then:
$HOME/.foundry/bin/foundryup
```

---

## Verify Installation

After installing, run in a terminal:

```bash
forge --version
anvil --version
cast --version
```

Expected output:
```
forge 0.2.0
anvil 0.2.0
cast 0.2.0
```

---

## Once Installed: Local Deployment

### Terminal 1: Start Anvil
```bash
cd C:\Users\HP\Blockchain-Voting-System
anvil
```

You should see:
```
                 _   _
                (_) | |
   __ _ _ __   ___ _| |
  / _` | '_ \ / __| | |
 | (_| | | | | (__| | |
  \__,_|_| |_|\___|_|_|

Listening on 127.0.0.1:8545
```

### Terminal 2: Deploy Contract
```bash
cd C:\Users\HP\Blockchain-Voting-System
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

You'll see output like:
```
Deploying VotingSystem...
Transaction hash: 0x...
Contract deployed at: 0x5FbDB2315678afccb333f8a9c36c6b00ea2f86f...
```

---

## Troubleshooting

**Issue: "anvil: command not found"**
- ✅ Verify Foundry is installed: `forge --version`
- ✅ Check PATH was added correctly
- ✅ Restart your terminal/VS Code

**Issue: "port 8545 is already in use"**
- ✅ Kill existing process: `netstat -ano | findstr :8545`
- ✅ Or use different port: `anvil --port 8546`

**Issue: PowerShell script execution policy error**
- ✅ Run PowerShell as Admin
- ✅ Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- ✅ Then retry the installation script

---

## Next Steps After Installation

See [ANVIL_DEPLOYMENT_GUIDE.md](./ANVIL_DEPLOYMENT_GUIDE.md) for complete local deployment walkthrough.
