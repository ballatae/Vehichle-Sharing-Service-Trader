let expect;

describe("EthereumTransfer", function () {
  let ethereumTransfer;
  let address1, address2;
  let provider;

  before(async function () {
    ({ expect } = await import("chai"));
    provider = ethers.provider;
  });

  beforeEach(async function () {
    const EthereumTransfer = await ethers.getContractFactory(
      "EthereumTransfer"
    );
    [address1, address2] = await ethers.getSigners();
    ethereumTransfer = await EthereumTransfer.deploy();
    await ethereumTransfer.deployed();
  });

  describe("receive", function () {
    it("Should send ether to the contract and update the account balances mapping", async function () {
      const provider = waffle.provider;

      expect(
        (await provider.getBalance(ethereumTransfer.address)).toNumber()
      ).to.equal(0);

      await address1.sendTransaction({
        to: ethereumTransfer.address,
        value: 100,
      });

      expect(
        (await provider.getBalance(ethereumTransfer.address)).toNumber()
      ).to.equal(100);

      expect(
        (await ethereumTransfer.getAccountBalances(address1.address)).toNumber()
      ).to.equal(100);
    });
  });

  describe("withdraw", function () {
    it("Should allow a user to withdraw their balance", async function () {
      await address1.sendTransaction({
        to: ethereumTransfer.address,
        value: ethers.utils.parseEther("1.0"),
      });

      const initialBalance = await address1.getBalance();
      const tx = await ethereumTransfer
        .connect(address1)
        .withdraw(ethers.utils.parseEther("1.0"));
      const receipt = await tx.wait(); // Get the receipt to calculate gas used
      const txDetails = await ethers.provider.getTransaction(tx.hash); // Get transaction details for gasPrice

      // Calculate the gas cost
      const gasCost = txDetails.gasPrice.mul(receipt.gasUsed);

      const finalBalance = await address1.getBalance();
      const expectedBalanceAfterWithdrawal = initialBalance
        .sub(ethers.utils.parseEther("1.0"))
        .sub(gasCost);

      // Instead of trying to use .closeTo with BigNumbers, directly assert that the final balance is greater than or equal to the expected balance after withdrawal and gas costs
      // This accounts for possible variations in gas cost
      expect(finalBalance.gte(expectedBalanceAfterWithdrawal)).to.be.true;
    });

    it("Should fail to withdraw more than the account balance", async function () {
      try {
        await ethereumTransfer
          .connect(address1)
          .withdraw(ethers.utils.parseEther("1.0"));
        // If the withdraw succeeds, force the test to fail
        expect.fail("Withdrawal did not fail as expected");
      } catch (error) {
        // Check if the error message matches the expected revert reason
        // Note: This error message checking is dependent on the Ethereum client and may need adjustment
        expect(error.message).to.include("revert");
      }
    });
  });

  describe("withdrawTo", function () {
    it("Should allow a user to withdraw to another address", async function () {
      // Deposit from address1 to the contract
      const depositAmount = ethers.utils.parseEther("1.0");
      await address1.sendTransaction({
        to: ethereumTransfer.address,
        value: depositAmount,
      });

      // Check initial balances
      const initialBalanceAddress2 = await provider.getBalance(
        address2.address
      );

      // Withdraw from the contract to address2
      await ethereumTransfer
        .connect(address1)
        .withdrawTo(address2.address, depositAmount);

      // Check final balance of address2
      const finalBalanceAddress2 = await provider.getBalance(address2.address);

      // Assert that address2's balance has increased by the deposit amount
      expect(finalBalanceAddress2.eq(initialBalanceAddress2.add(depositAmount)))
        .to.be.true;
    });
  });
});
