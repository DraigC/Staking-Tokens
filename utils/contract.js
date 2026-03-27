import { ethers } from "ethers";

// Paste your deployed Sepolia contract addresses here.
export const TOKEN_ADDRESS = "0x89409C7d8ECC82EC6617caCd123E13b6B75373C6";
export const STAKING_ADDRESS = "0x2F5A0F689Fb5a66FA09758CAF4b8efF42D3FA6dE";

// Minimal ERC20 ABI required for this DApp.
export const tokenABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

// Minimal staking ABI required for this DApp.
export const stakingABI = [
  "function stake(uint256 amount) external",
  "function stakes(address user) external view returns (uint256)",
  "function calculateReward(address user) external view returns (uint256)",
  "function claimReward() external",
  "function withdraw() external"
];

function validateConfiguredAddresses() {
  const tokenIsValid = ethers.isAddress(TOKEN_ADDRESS);
  const stakingIsValid = ethers.isAddress(STAKING_ADDRESS);

  if (!tokenIsValid || !stakingIsValid) {
    throw new Error("Invalid contract address config. Update TOKEN_ADDRESS and STAKING_ADDRESS in utils/contract.js.");
  }
}

export function getContracts(signer) {
  validateConfiguredAddresses();

  const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenABI, signer);
  const stakingContract = new ethers.Contract(STAKING_ADDRESS, stakingABI, signer);

  return { tokenContract, stakingContract };
}
