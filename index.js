const { ethers } = require("ethers");

const contractAddress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
const recipientAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

// ABI for EthereumTransfer contract
const abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdrawal",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "accountBalances",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "accountAddress",
        type: "address",
      },
    ],
    name: "getAccountBalances",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdrawTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

let provider;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await ethereum.request({ method: "eth_requestAccounts" });
    console.log("MetaMask is connected");
    provider = new ethers.providers.Web3Provider(window.ethereum);
    return provider;
  } else {
    alert("MetaMask is not installed!");
    return null;
  }
}

async function sendEtherToContract(amountInEther) {
  const signer = provider.getSigner();
  const tx = {
    to: contractAddress,
    value: ethers.utils.parseEther(amountInEther),
  };
  const transactionResponse = await signer.sendTransaction(tx);
  await transactionResponse.wait();
  console.log(`Sent ${amountInEther} ETH to the contract.`);
}

async function withdrawTo(amountInEther) {
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const signer = provider.getSigner();
  const contractWithSigner = contract.connect(signer);
  const transactionResponse = await contractWithSigner.withdrawTo(
    recipientAddress,
    ethers.utils.parseEther(amountInEther)
  );
  await transactionResponse.wait();
  console.log(
    `Withdrawal of ${amountInEther} ETH to ${recipientAddress} was successful.`
  );
}

// New execute function that will be called on button click
async function execute() {
  if (!provider) {
    console.error("Provider is not initialized. Make sure to connect first.");
    return;
  }
  console.log("Starting the transactions...");
  await sendEtherToContract("1.0");
  await withdrawTo("1.0");
}

// Exposing your functions to be accessible from your HTML
window.bundle = {
  connect,
  execute,
};
