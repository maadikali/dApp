// Import necessary dependencies
import abi from './WriteToEarn.json';
import { ethers } from "ethers";
import Head from 'next/head';
import React, { useEffect, useState } from "react";
import styles from '../styles/Home.module.css';

// Set the contract address and ABI
const contractAddress = "0x7868A4757667f900A6D16AF851B0642034BD509D";
const contractABI = abi;

export default function Home() {
  // State variables
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  // Helper functions for handling form input changes
  const onNameChange = (event) => {
    setName(event.target.value);
  }

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }

  // Function to check if MetaMask wallet is connected
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length > 0) {
        const account = accounts[0];
        setCurrentAccount(account);
      } else {
        console.log("Make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  // Function to connect MetaMask wallet
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Please install MetaMask");
      } else {
        const accounts = await ethereum.request({
          method: 'eth_requestAccounts'
        });

        setCurrentAccount(accounts[0]);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Function to register as a writer
  const registerAsWriter = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const writeToEarn = new ethers.Contract(contractAddress, contractABI, signer);

        await writeToEarn.registerWriter();
        console.log("Registered as a writer!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to earn tokens
  const earnTokens = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const writeToEarn = new ethers.Contract(contractAddress, contractABI, signer);

        await writeToEarn.earn();
        console.log("Earned tokens!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch memos from the blockchain
  const fetchMemos = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const writeToEarn = new ethers.Contract(contractAddress, contractABI, signer);

        console.log("Fetching memos from the blockchain...");
        const memos = await writeToEarn.getMemos();
        console.log("Fetched!");
        setMemos(memos);
      } else {
        console.log("MetaMask is not connected");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to withdraw balance
  const withdrawBalance = async (amount) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const writeToEarn = new ethers.Contract(contractAddress, contractABI, signer);

        await writeToEarn.withdrawBalance(amount);
        console.log(`Withdrawn ${amount} tokens!`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to subscribe
  const subscribe = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const writeToEarn = new ethers.Contract(contractAddress, contractABI, signer);

        await writeToEarn.subscribe({ value: ethers.utils.parseEther("0.002") });
        console.log("Subscribed successfully!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to unsubscribe
  const unsubscribe = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const writeToEarn = new ethers.Contract(contractAddress, contractABI, signer);

        await writeToEarn.unsubscribe();
        console.log("Unsubscribed successfully!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to get subscription status
  const getIsSubscriber = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const writeToEarn = new ethers.Contract(contractAddress, contractABI, provider);

        const isSubscriber = await writeToEarn.getIsSubscriber(currentAccount);
        console.log(`Subscription status: ${isSubscriber}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Use effect to run on component mount
  useEffect(() => {
    isWalletConnected();
    fetchMemos();
  }, []);

  // JSX rendering
  return (
    <div className={styles.container}>
      <Head>
        <title>WriteToEarn DApp</title>
        <meta name="description" content="DApp for writers" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          WriteToEarn DApp
        </h1>

        {currentAccount ? (
          <div>
            <button onClick={registerAsWriter}>Register as a Writer</button>
            <button onClick={earnTokens}>Earn Tokens</button>
            <button onClick={() => withdrawBalance(100)}>Withdraw 100 Tokens</button>
            <button onClick={subscribe}>Subscribe</button>
            <button onClick={unsubscribe}>Unsubscribe</button>
            <button onClick={getIsSubscriber}>Check Subscription Status</button>
          </div>
        ) : (
          <button onClick={connectWallet}>Connect your wallet</button>
        )}

        <div>
          <h2>Memos received</h2>
          {memos.map((memo, idx) => (
            <div key={idx}>
              <p><strong>{memo.message}</strong></p>
              <p>From: {memo.name}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
