// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CarSharingCosts {
    struct Car {
        uint256 fuelConsumptionPer100km; // Fuel consumption per 100km in liters
        uint256 seats; // Number of seats in the car
    }

    struct TripSegment {
        uint256 distance; // Distance of the segment in kilometers
        string carBrand; // Car brand used for the segment
        uint256 passengers; // Number of passengers, including the driver
    }

    mapping(string => Car) public cars;
    uint256 public gasPricePerLiter; // Gas price in wei per liter

    event LogCosts(uint256 indexed segment, uint256 costPerPassenger);

    constructor(uint256 _gasPricePerLiter) {
        gasPricePerLiter = _gasPricePerLiter;
    }

    function setCarDetails(string memory brand, uint256 fuelConsumption, uint256 seats) public {
        cars[brand] = Car(fuelConsumption, seats);
    }

    function calculateAndLogCosts(TripSegment[] memory segments) external {
        for (uint256 i = 0; i < segments.length; i++) {
            TripSegment memory segment = segments[i];
            uint256 costPerPassenger = calculateSegmentCost(segment.distance, segment.carBrand, segment.passengers);
            emit LogCosts(i, costPerPassenger);
        }
    }

    function calculateSegmentCost(uint256 distance, string memory brand, uint256 passengers) public view returns (uint256) {
        require(passengers > 0, "There must be at least one passenger");
        require(cars[brand].seats >= passengers, "Not enough seats for all passengers");

        Car memory car = cars[brand];
        uint256 fuelNeeded = (distance * car.fuelConsumptionPer100km) / 100;
        uint256 totalCost = fuelNeeded * gasPricePerLiter;
        uint256 costPerPassenger = totalCost / passengers;

        return costPerPassenger;
    }
}
