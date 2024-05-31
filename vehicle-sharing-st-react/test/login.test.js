const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server/server"); // Adjust the path to your app
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Mocking User model and bcrypt
const User = mongoose.model("User");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("POST /api/login", () => {
  let server;

  beforeAll(async () => {
    server = app.listen(3000); // Start the server on port 3000 or any available port
  });

  afterAll(async () => {
    await server.close();
    await mongoose.connection.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should log in a user successfully", async () => {
    const user = {
      _id: "60c72b2f9b1d4c3d88f4c7a9",
      username: "testuser",
      hashedPassword: "hashedpassword",
      ethereumAddress: "0xUnusedEthereumAddress",
      ethereumPrivateKey: "PrivateKeyOfUnusedEthereumAddress",
    };

    User.findOne = jest.fn().mockResolvedValue(user);
    bcrypt.compare = jest.fn().mockResolvedValue(true);
    jwt.sign = jest.fn().mockReturnValue("jsonwebtoken");

    const response = await request(server).post("/api/login").send({
      username: "testuser",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login successful");
    expect(response.body.token).toBe("jsonwebtoken");
    expect(response.body.ethereumAddress).toBe("0xUnusedEthereumAddress");
    expect(response.body.ethereumPrivateKey).toBe(
      "PrivateKeyOfUnusedEthereumAddress"
    );
  });

  it("should return 400 if user is not found", async () => {
    User.findOne = jest.fn().mockResolvedValue(null);

    const response = await request(server).post("/api/login").send({
      username: "nonexistentuser",
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("User not found");
  });

  it("should return 401 if the password is invalid", async () => {
    const user = {
      _id: "60c72b2f9b1d4c3d88f4c7a9",
      username: "testuser",
      hashedPassword: "hashedpassword",
    };

    User.findOne = jest.fn().mockResolvedValue(user);
    bcrypt.compare = jest.fn().mockResolvedValue(false);

    const response = await request(server).post("/api/login").send({
      username: "testuser",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid credentials");
  });

  it("should return 500 if there is an internal server error", async () => {
    User.findOne = jest.fn().mockRejectedValue(new Error("Database error"));

    const response = await request(server).post("/api/login").send({
      username: "testuser",
      password: "password123",
    });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Internal server error");
  });
});
