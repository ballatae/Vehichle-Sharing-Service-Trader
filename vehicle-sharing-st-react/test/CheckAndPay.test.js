import {
  calculateRadiusBasedOnRouteLength,
  calculateIntervals,
  startLocationChecks,
  checkLocationAndExecute,
} from "../src/Pages/CheckAndPay";
import { render, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

// Mock location.state
const mockLocationState = {
  state: {
    tripStartTime: new Date().toISOString(),
    tripDuration: 120, // 2 hours
    segmentCost: "50",
    lastLatitude: "40.7128",
    lastLongitude: "-74.0060",
  },
};

jest.mock("react-router-dom", () => ({
  useLocation: () => mockLocationState,
}));

jest.mock("axios", () => ({
  get: jest.fn().mockResolvedValue({
    data: [{ ethereumAddress: "0x123" }, { ethereumAddress: "0x456" }],
  }),
}));

describe("CheckAndPay Methods", () => {
  test("calculateRadiusBasedOnRouteLength", () => {
    expect(calculateRadiusBasedOnRouteLength(100000)).toBe(1); // 100km * 0.01
    expect(calculateRadiusBasedOnRouteLength(50000)).toBe(2.5); // 50km * 0.05
  });

  test("calculateIntervals", () => {
    const intervals = calculateIntervals(600); // 10 minutes
    expect(intervals.length).toBeGreaterThan(0);
    expect(intervals).toContain(180); // Total duration * 0.3
    expect(intervals[intervals.length - 1]).toBeCloseTo(6, 1); // Last 10% split into 10 parts
  });

  test("startLocationChecks", async () => {
    jest.useFakeTimers();
    const totalDuration = 600; // 10 minutes
    const mockSetUserState = jest.fn();
    const mockProvider = { getSigner: jest.fn() };
    const mockContract = { withdrawTo: jest.fn() };
    const mockExecuteTransaction = jest.fn();

    const checkAndPayInstance = {
      startLocationChecks,
      calculateIntervals,
      calculateRadiusBasedOnRouteLength,
      setUserState: mockSetUserState,
      provider: mockProvider,
      contract: mockContract,
      executeTransaction: mockExecuteTransaction,
      latitude: "40.7128",
      longitude: "-74.0060",
      routeLength: 10000,
    };

    checkAndPayInstance.startLocationChecks(totalDuration);

    jest.advanceTimersByTime(180000); // Fast-forward 3 minutes
    await waitFor(() => expect(mockSetUserState).toHaveBeenCalled());
  });

  test("checkLocationAndExecute", async () => {
    const mockSetUserState = jest.fn();
    const mockProvider = { getSigner: jest.fn() };
    const mockContract = { withdrawTo: jest.fn() };
    const mockStartLocationChecks = jest.fn();

    const checkAndPayInstance = {
      checkLocationAndExecute,
      startLocationChecks: mockStartLocationChecks,
      setUserState: mockSetUserState,
      provider: mockProvider,
      contract: mockContract,
      latitude: "40.7128",
      longitude: "-74.0060",
      routeLength: 10000,
      location: mockLocationState,
    };

    await checkAndPayInstance.checkLocationAndExecute();

    expect(mockStartLocationChecks).toHaveBeenCalled();
  });
});
