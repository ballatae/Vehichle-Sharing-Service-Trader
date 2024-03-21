const { ethers } = require("ethers");

// ABI for your EthereumTransfer contract
const contractABI = [
  // Your contract's ABI here
];

// Addresses should be replaced with your contract's deployed address and the recipient's address
const contractAddress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
const recipientAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await ethereum.request({ method: "eth_requestAccounts" });
    console.log("MetaMask is connected");
    return new ethers.providers.Web3Provider(window.ethereum);
  } else {
    alert("MetaMask is not installed!");
    return null;
  }
}

async function sendEtherToContract(provider, amountInEther) {
  const signer = provider.getSigner();
  const tx = {
    to: contractAddress,
    value: ethers.utils.parseEther(amountInEther),
  };
  const transactionResponse = await signer.sendTransaction(tx);
  await transactionResponse.wait();
  console.log(`Sent ${amountInEther} ETH to the contract.`);
}

async function withdrawTo(provider, amountInEther) {
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
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

async function main() {
  const provider = await connect();
  if (!provider) return;

  console.log("Starting the transactions...");
  await sendEtherToContract(provider, "1.0");
  await withdrawTo(provider, "1.0");
}

main().catch(console.error);
