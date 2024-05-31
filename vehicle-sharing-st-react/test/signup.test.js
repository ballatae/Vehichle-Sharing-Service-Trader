// __tests__/signup.test.js

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server/server"); // Assuming server.js is in the root directory
const { preFundedAccounts } = require("../server/ethereumService"); // Adjust the path to your pre-funded accounts

// Mocking necessary modules and functions
jest.mock("../server/ethereumService", () => ({
  preFundedAccounts: [
    {
      address: "0xUnusedEthereumAddress",
      privateKey: "PrivateKeyOfUnusedEthereumAddress",
    },
  ],
}));

describe("POST /api/signup", () => {
  let server;

  beforeAll(async () => {
    server = app.listen(3000); 
  });

  afterAll(async () => {
    await server.close();
    await mongoose.connection.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new user", async () => {
    const User = mongoose.model("User");
    User.find = jest.fn().mockResolvedValue([]);
    User.prototype.save = jest.fn().mockResolvedValue();

    const Counter = mongoose.model("Counter");
    Counter.findOneAndUpdate = jest.fn().mockResolvedValue({ seq: 1 });

    const response = await request(server).post("/api/signup").send({
      username: "testuser",
      password: "password123",
      email: "testuser@example.com",
      address: "Test Address",
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User created successfully");
    expect(response.body.ethereumAddress).toBe("0xUnusedEthereumAddress");
    expect(response.body.ethereumPrivateKey).toBe(
      "PrivateKeyOfUnusedEthereumAddress"
    );
    expect(response.body.token).toBeDefined();
    expect(response.body.userId).toBeDefined();
  });

  it("should return 400 if no available Ethereum accounts", async () => {
    jest.mock("../server/ethereumService", () => ({
      preFundedAccounts: [],
    }));

    const User = mongoose.model("User");
    User.find = jest.fn().mockResolvedValue([]);

    const response = await request(server).post("/api/signup").send({
      username: "testuser",
      password: "password123",
      email: "testuser@example.com",
      address: "Test Address",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("No available Ethereum accounts");
  });

  it("should return 500 if there is a server error", async () => {
    jest.mock("../server/ethereumService", () => ({
      preFundedAccounts: [
        {
          address: "0xUnusedEthereumAddress",
          privateKey: "PrivateKeyOfUnusedEthereumAddress",
        },
      ],
    }));

    const User = mongoose.model("User");
    User.find = jest.fn().mockRejectedValue(new Error("Database error"));

    const response = await request(server).post("/api/signup").send({
      username: "testuser",
      password: "password123",
      email: "testuser@example.com",
      address: "Test Address",
    });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Internal server error");
  });
});
