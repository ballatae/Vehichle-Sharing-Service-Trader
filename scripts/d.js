// scripts/deploy.js
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const EthereumTransfer = await ethers.getContractFactory("EthereumTransfer");
  const ethereumTransfer = await EthereumTransfer.deploy();

  await ethereumTransfer.deployed();

  console.log("EthereumTransfer deployed to:", ethereumTransfer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
