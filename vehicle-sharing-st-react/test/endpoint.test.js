const request = require("supertest");

describe("API Tests", () => {
  it("should return the initial route data correctly", async () => {
    const response = await request("http://localhost:8001").get(
      "/api/activeroutes"
    );

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("driverId", expect.any(String));
    expect(response.body).toHaveProperty("geometry", expect.any(Object));
    expect(response.body.geometry).toHaveProperty("type", "LineString");
    expect(response.body.geometry).toHaveProperty(
      "coordinates",
      expect.any(Array)
    );
    expect(response.body).toHaveProperty("duration", expect.any(Number));
    expect(response.body).toHaveProperty("distance", expect.any(Number));
    expect(response.body).toHaveProperty("seatsAvailable", expect.any(Number));
    expect(response.body).toHaveProperty("maxStopTime", expect.any(Number));
    expect(response.body).toHaveProperty("cost", expect.any(String));
    expect(response.body).toHaveProperty("expiry", expect.any(Number));
    expect(response.body).toHaveProperty("isOpen", expect.any(Boolean));
    expect(response.body).toHaveProperty("routeDate", expect.any(String));
    expect(response.body).toHaveProperty("stops", expect.any(Array));
    expect(response.body).toHaveProperty(
      "identifiedCoordinates",
      expect.any(Array)
    );
  });

  it("should send user data correctly", async () => {
    const response = await request("http://localhost:3001")
      .post("/users/login")
      .send({
        username: "Arb",
        email: "arb@example.com",
        ethereumAddress: "0xf39F...",
        ethereumPrivateKey: "0xac0974...",
        accountIndex: 1,
        role: "passenger",
      });

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("success", true);
  });
});
