const hre = require("hardhat");

async function main() {
  // Deploy the EthereumTransfer contract
  const EthereumTransfer = await hre.ethers.getContractFactory(
    "EthereumTransfer"
  );
  const ethereumTransfer = await EthereumTransfer.deploy();
  await ethereumTransfer.deployed();
  console.log("EthereumTransfer deployed to:", ethereumTransfer.address);

  // Get signers
  const [sender, receiver] = await hre.ethers.getSigners();

  // Initial balances
  console.log(
    "Initial Sender Balance:",
    hre.ethers.utils.formatEther(await sender.getBalance()),
    "ETH"
  );
  console.log(
    "Initial Receiver Balance:",
    hre.ethers.utils.formatEther(await receiver.getBalance()),
    "ETH"
  );

  // Send ethers to the contract
  let tx = await sender.sendTransaction({
    to: ethereumTransfer.address,
    value: hre.ethers.utils.parseEther("1.0"),
  });
  await tx.wait();

  // Balances after deposit
  console.log(
    "Sender Balance after deposit:",
    hre.ethers.utils.formatEther(await sender.getBalance()),
    "ETH"
  );
  console.log(
    "Contract Balance after deposit:",
    hre.ethers.utils.formatEther(
      await hre.ethers.provider.getBalance(ethereumTransfer.address)
    ),
    "ETH"
  );

  // Withdraw to the receiver address
  tx = await ethereumTransfer
    .connect(sender)
    .withdrawTo(receiver.address, hre.ethers.utils.parseEther("1.0"));
  await tx.wait();

  // Final balances
  console.log(
    "Sender Balance after withdrawal:",
    hre.ethers.utils.formatEther(await sender.getBalance()),
    "ETH"
  );
  console.log(
    "Receiver Balance after withdrawal:",
    hre.ethers.utils.formatEther(await receiver.getBalance()),
    "ETH"
  );
  console.log(
    "Contract Balance after withdrawal:",
    hre.ethers.utils.formatEther(
      await hre.ethers.provider.getBalance(ethereumTransfer.address)
    ),
    "ETH"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
