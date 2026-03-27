# Token Staking DApp (College Mini Project)

A beginner-friendly Web3 DApp built with Next.js and ethers.js to interact with deployed Sepolia smart contracts.

This app lets a user:
- Connect MetaMask
- Approve ERC20 tokens
- Stake tokens
- Check rewards
- Claim rewards
- Withdraw staked tokens

## Tech Stack

- Frontend: Next.js (Pages Router), React, JavaScript
- Web3 Library: ethers.js v6
- Network: Ethereum Sepolia Testnet
- Wallet: MetaMask

## Project Structure

```text
.
├─ pages/
│  └─ index.js
├─ utils/
│  └─ contract.js
├─ package.json
├─ package-lock.json
└─ README.md
```

## Smart Contract Configuration

Contract addresses and ABIs are defined in `utils/contract.js`.

Current configured addresses:
- TOKEN_ADDRESS: `0x89409C7d8ECC82EC6617caCd123E13b6B75373C6`
- STAKING_ADDRESS: `0x2F5A0F689Fb5a66FA09758CAF4b8efF42D3FA6dE`

If you redeploy contracts, replace both addresses in `utils/contract.js`.

## Staking Contract Functions Used by Frontend

The frontend currently calls these staking methods:
- `stake(uint256 amount)`
- `stakes(address user)`
- `calculateReward(address user)`
- `claimReward()`
- `withdraw()`

Important:
- `withdraw()` is used without an amount argument.
- Reward read is done via `calculateReward(address)`.

## MetaMask and Sepolia Setup

1. Install MetaMask browser extension.
2. Enable test networks in MetaMask.
3. Select Sepolia network.
4. Add test ETH from a Sepolia faucet for gas.

The app also includes Sepolia network switch/add logic in `pages/index.js`.

## Local Setup and Run

From project root:

```powershell
npm install
npm run dev
```

Open:
- `http://localhost:3000`

## How to Use the DApp

1. Click **Connect Wallet**
2. Enter amount in input
3. Click **Approve**
4. Click **Stake**
5. Click **Check Reward**
6. Click **Claim Reward**
7. Click **Withdraw**

## Error Handling Included

The app handles common cases with alerts:
- Wallet not connected
- User rejected MetaMask request/transaction
- Invalid amount
- No tokens staked
- No reward to claim
- Contract config/address issues
- Revert messages shown in readable format where available

## Build Command

```powershell
npm run build
```

## Stop the Dev Server

In terminal running the app:
- Press `Ctrl + C`

If prompted:
- Type `Y` and press Enter

## Common Troubleshooting

### 1) ENS/UNCONFIGURED_NAME error
Usually caused by invalid placeholder address or stale build.

Fix:
- Ensure real addresses are in `utils/contract.js`
- Restart dev server
- Hard refresh browser (`Ctrl + F5`)

### 2) Claim/Withdraw/Check Reward fails
Likely causes:
- Wallet has no staked amount
- Wrong ABI function name/signature
- Wrong network/account in MetaMask

Fix:
- Confirm wallet is same one that staked
- Confirm network is Sepolia
- Confirm ABI in `utils/contract.js` matches deployed contract

### 3) Git push large file error
If `node_modules` or `.next` were committed accidentally:
- Keep `.gitignore` with `node_modules/` and `.next/`
- Remove cached tracked files and recommit

## Security Notes

- This is a college mini project and not production-hardened.
- Do not use real funds.
- The Alchemy RPC key is currently in frontend code for simplicity.
  - Rotate or restrict this key if repository is public.

## GitHub Repository

Project was pushed to:
- `https://github.com/DraigC/Staking-Tokens`

## License

This project is for academic learning/demo use.
