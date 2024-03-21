let expect;

describe("CarSharingCosts", function () {
  let carSharingCosts;
  let gasPricePerLiter = ethers.utils.parseUnits("0.5", "ether"); // Example gas price in wei per liter
  let owner, addr1, addr2;
  let provider;

  before(async function () {
    ({ expect } = await import("chai"));
    provider = ethers.provider;
  });

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const CarSharingCosts = await ethers.getContractFactory("CarSharingCosts");
    carSharingCosts = await CarSharingCosts.deploy(gasPricePerLiter);
    await carSharingCosts.deployed();
  });

  describe("setCarDetails", function () {
    it("Should allow setting details of a car", async function () {
      await carSharingCosts.setCarDetails("Toyota", 10, 5);
      const carDetails = await carSharingCosts.cars("Toyota");
      expect(carDetails.fuelConsumptionPer100km.toString()).to.equal(
        ethers.BigNumber.from(10).toString()
      );
      expect(carDetails.seats.toString()).to.equal(
        ethers.BigNumber.from(5).toString()
      );
    });
  });

  describe("calculateSegmentCost", function () {
    beforeEach(async function () {
      await carSharingCosts.setCarDetails("Toyota", 10, 5);
    });

    it("Should correctly calculate cost per passenger for a trip segment", async function () {
      const distance = 100; // 100km
      const passengers = 5;
      const costPerPassenger = await carSharingCosts.calculateSegmentCost(
        distance,
        "Toyota",
        passengers
      );

      expect(costPerPassenger.toString()).to.equal(
        ethers.utils.parseUnits("1", "ether").toString()
      );
    });

    it("Should revert if there are no passengers", async function () {
      const distance = 100;
      const passengers = 0;
      try {
        await carSharingCosts.calculateSegmentCost(
          distance,
          "Toyota",
          passengers
        );
        // If the call does not revert, force the test to fail
        expect.fail("Expected transaction to revert, but it didn't");
      } catch (error) {
        expect(error.message).to.include(
          "There must be at least one passenger"
        );
      }
    });

    it("Should revert if there are not enough seats for all passengers", async function () {
      const distance = 100;
      const passengers = 6; // More than the car can hold
      try {
        await carSharingCosts.calculateSegmentCost(
          distance,
          "Toyota",
          passengers
        );
        // If the call does not revert, force the test to fail
        expect.fail("Expected transaction to revert, but it didn't");
      } catch (error) {
        expect(error.message).to.include("Not enough seats for all passengers");
      }
    });
  });

  // Assuming this is under the same describe block as before
  it("Should emit LogCosts events with correct cost per passenger for multiple segments", async function () {
    const segments = [
      { distance: 100, carBrand: "Toyota", passengers: 5 },
      { distance: 200, carBrand: "Toyota", passengers: 4 },
    ];

    let receipt;
    try {
      const tx = await carSharingCosts.calculateAndLogCosts(segments);
      receipt = await tx.wait(); // Wait for the transaction to be mined
    } catch (error) {
      console.error("Transaction failed: ", error.message);
      expect.fail("Transaction should not have reverted.");
    }

    // If the transaction was successful, proceed to check the events
    if (receipt) {
      const events = receipt.events?.filter((e) => e.event === "LogCosts");
      expect(events.length).to.equal(2);
      expect(events[0].args.segmentIndex).to.equal(0);
      expect(events[0].args.cost.toString()).to.equal(
        ethers.utils.parseUnits("1", "ether").toString()
      );
      expect(events[1].args.segmentIndex).to.equal(1);
      expect(events[1].args.cost.toString()).to.equal(
        ethers.utils.parseUnits("2.5", "ether").toString()
      );
    }
  });
});
