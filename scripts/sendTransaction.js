// Example Hardhat script: scripts/sendTransaction.js
async function main() {
  const [sender, recipient] = await ethers.getSigners();

  const transactionResponse = await sender.sendTransaction({
    to: recipient.address,
    value: ethers.utils.parseEther("25.0"),
  });

  await transactionResponse.wait();
  console.log(
    `Transaction successful! 1 Ether sent from ${sender.address} to ${recipient.address}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
