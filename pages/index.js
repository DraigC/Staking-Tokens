import { useState } from "react";
import { ethers } from "ethers";
import { getContracts, STAKING_ADDRESS } from "../utils/contract";

const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";
const SEPOLIA_ALCHEMY_RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/K2lKGKZBIa4E-fKk4f7gU";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [reward, setReward] = useState("0");

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        alert("MetaMask not found. Please install MetaMask.");
        return;
      }

      await ensureSepoliaNetwork();

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWalletAddress(accounts[0]);
      alert("Wallet connected successfully.");
    } catch (error) {
      if (error.code === 4001) {
        alert("Connection rejected by user.");
      } else {
        console.error(error);
        alert("Failed to connect wallet.");
      }
    }
  }

  async function getSignerAndContracts() {
    if (!window.ethereum) {
      alert("MetaMask not found.");
      return null;
    }

    await ensureSepoliaNetwork();

    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return null;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    let tokenContract;
    let stakingContract;

    try {
      ({ tokenContract, stakingContract } = getContracts(signer));
    } catch (error) {
      console.error(error);
      alert(error.message || "Invalid contract configuration.");
      return null;
    }

    return { signer, tokenContract, stakingContract };
  }

  async function ensureSepoliaNetwork() {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (chainId === SEPOLIA_CHAIN_ID_HEX) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }]
      });
    } catch (switchError) {
      if (switchError.code !== 4902) {
        throw switchError;
      }

      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: SEPOLIA_CHAIN_ID_HEX,
            chainName: "Sepolia",
            nativeCurrency: {
              name: "Sepolia ETH",
              symbol: "ETH",
              decimals: 18
            },
            rpcUrls: [SEPOLIA_ALCHEMY_RPC_URL],
            blockExplorerUrls: ["https://sepolia.etherscan.io"]
          }
        ]
      });
    }
  }

  function parseAmount(value) {
    if (!value || Number(value) <= 0) {
      alert("Enter a valid amount greater than 0.");
      return null;
    }

    try {
      return ethers.parseUnits(value, 18);
    } catch (error) {
      alert("Invalid amount format.");
      return null;
    }
  }

  function getReadableError(error) {
    if (!error) return "Unknown error.";
    return (
      error.reason ||
      error.shortMessage ||
      error.message ||
      "Transaction failed."
    );
  }

  async function getStakedAmount(stakingContract) {
    try {
      return await stakingContract.stakes(walletAddress);
    } catch (error) {
      console.error(error);
      return 0n;
    }
  }

  async function approveTokens() {
    try {
      const data = await getSignerAndContracts();
      if (!data) return;

      const parsedAmount = parseAmount(amount);
      if (!parsedAmount) return;

      const tx = await data.tokenContract.approve(STAKING_ADDRESS, parsedAmount);
      await tx.wait();
      alert("Tokens approved successfully.");
    } catch (error) {
      if (error.code === 4001) {
        alert("Transaction rejected by user.");
      } else if (String(error.message).toLowerCase().includes("insufficient")) {
        alert("Insufficient balance for approval.");
      } else {
        console.error(error);
        alert("Approve failed.");
      }
    }
  }

  async function stakeTokens() {
    try {
      const data = await getSignerAndContracts();
      if (!data) return;

      const parsedAmount = parseAmount(amount);
      if (!parsedAmount) return;

      const tx = await data.stakingContract.stake(parsedAmount);
      await tx.wait();
      alert("Tokens staked successfully.");
    } catch (error) {
      if (error.code === 4001) {
        alert("Transaction rejected by user.");
      } else if (String(error.message).toLowerCase().includes("insufficient")) {
        alert("Insufficient token balance.");
      } else {
        console.error(error);
        alert("Staking failed.");
      }
    }
  }

  async function getReward() {
    try {
      const data = await getSignerAndContracts();
      if (!data) return;

      const stakedAmount = await getStakedAmount(data.stakingContract);
      if (stakedAmount === 0n) {
        setReward("0");
        alert("No tokens staked yet.");
        return;
      }

      const rewardAmount = await data.stakingContract.calculateReward(walletAddress);
      const formatted = ethers.formatUnits(rewardAmount, 18);
      setReward(formatted);

      if (rewardAmount === 0n) {
        alert("No reward available yet.");
      }
    } catch (error) {
      console.error(error);
      alert(getReadableError(error));
    }
  }

  async function claimReward() {
    try {
      const data = await getSignerAndContracts();
      if (!data) return;

      const stakedAmount = await getStakedAmount(data.stakingContract);
      if (stakedAmount === 0n) {
        alert("No tokens staked yet.");
        return;
      }

      const pendingReward = await data.stakingContract.calculateReward(walletAddress);
      if (pendingReward === 0n) {
        alert("No reward to claim.");
        return;
      }

      const tx = await data.stakingContract.claimReward();
      await tx.wait();
      alert("Reward claimed successfully.");
      setReward("0");
    } catch (error) {
      if (error.code === 4001) {
        alert("Transaction rejected by user.");
      } else {
        console.error(error);
        alert(getReadableError(error));
      }
    }
  }

  async function withdrawTokens() {
    try {
      const data = await getSignerAndContracts();
      if (!data) return;

      const stakedAmount = await getStakedAmount(data.stakingContract);
      if (stakedAmount === 0n) {
        alert("No staked tokens to withdraw.");
        return;
      }

      const tx = await data.stakingContract.withdraw();
      await tx.wait();
      alert("Tokens withdrawn successfully.");
    } catch (error) {
      if (error.code === 4001) {
        alert("Transaction rejected by user.");
      } else {
        console.error(error);
        alert(getReadableError(error));
      }
    }
  }

  return (
    <div style={styles.page}>
      <h1>Simple Token Staking DApp</h1>

      <button onClick={connectWallet} style={styles.button}>Connect Wallet</button>
      <p>
        <strong>Wallet:</strong> {walletAddress || "Not connected"}
      </p>

      <input
        type="text"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={styles.input}
      />

      <div style={styles.buttonGroup}>
        <button onClick={approveTokens} style={styles.button}>Approve</button>
        <button onClick={stakeTokens} style={styles.button}>Stake</button>
        <button onClick={getReward} style={styles.button}>Check Reward</button>
        <button onClick={claimReward} style={styles.button}>Claim Reward</button>
        <button onClick={withdrawTokens} style={styles.button}>Withdraw</button>
      </div>

      <p>
        <strong>Current Reward:</strong> {reward}
      </p>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "600px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    border: "1px solid #ccc",
    borderRadius: "8px"
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px"
  },
  buttonGroup: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px"
  },
  button: {
    padding: "10px",
    cursor: "pointer"
  }
};
