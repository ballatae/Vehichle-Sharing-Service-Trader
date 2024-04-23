require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const { preFundedAccounts } = require("./ethereumService");

app.use(cors());
app.use(express.json());

// .env
const mongoDBUri = process.env.MONGO_DB_URI;

mongoose
  .connect(mongoDBUri)
  .then(() => {
    console.log("MongoDB connected!");
    initializeCounter();
  })
  .catch((err) => console.error("Could not connect to MongoDB:", err));

async function initializeCounter() {
  try {
    const counter = await Counter.findById("userAccountIndex");
    if (!counter) {
      const newCounter = new Counter({ _id: "userAccountIndex", seq: 0 });
      await newCounter.save();
    }
  } catch (err) {
    console.error("Error initializing counter:", err);
  }
}

// Define a Mongoose schema and model for User
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true, required: true },
  hashedPassword: String,
  address: String,
  ethereumAddress: String,
  ethereumPrivateKey: String,
  role: { type: String, enum: ["driver", "passenger"], default: "passenger" },
  accountIndex: { type: Number, unique: true },
});
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

const User = mongoose.model("User", userSchema);

app.use(express.json());

app.post("/api/signup", async (req, res) => {
  try {
    const { username, password, email, address } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Get an array of used Ethereum addresses from the database
    const usedAddresses = await User.find()
      .select("ethereumAddress -_id")
      .lean();
    const usedAddressesSet = new Set(
      usedAddresses.map((doc) => doc.ethereumAddress)
    );

    // Find an unused Ethereum account
    const availableAccount = preFundedAccounts.find(
      (acc) => !usedAddressesSet.has(acc.address)
    );

    if (!availableAccount) {
      return res
        .status(400)
        .json({ message: "No available Ethereum accounts" });
    }

    const getNextSequenceValue = async (sequenceName) => {
      const counter = await Counter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      return counter.seq;
    };

    const accountIndex = await getNextSequenceValue("userAccountIndex");

    // Create a new user with the Ethereum account
    const user = new User({
      username,
      email,
      hashedPassword,
      address,
      ethereumAddress: availableAccount.address,
      ethereumPrivateKey: availableAccount.privateKey,
      accountIndex,
    });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      jwtSecretKey,
      { expiresIn: "2h" }
    );

    await user.save();
    // send data to gent
    // ? post request to endpoint adduser (gent) json below

    res.status(201).json({
      message: "User created successfully",
      ethereumAddress: availableAccount.address,
      ethereumPrivateKey: availableAccount.privateKey,
      token,
      userId: user._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const jwt = require("jsonwebtoken");
// Secret key for JWT signing and encryption
const jwtSecretKey = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).send({ message: "No token provided." });
  }

  // Updated jwt.verify call with logging
  jwt.verify(token, jwtSecretKey, (err, decoded) => {
    console.log("Decoded token:", decoded); // Log the decoded token for debugging
    if (err) {
      console.error("Token verification error:", err); // Log any error if the token is not valid
      return res.status(403).send({ message: "Token is not valid." });
    }
    req.user = decoded; // If no error, set the decoded token to req.user
    next(); // Continue to the next middleware or endpoint function
  });
}

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a token for the user
    const token = jwt.sign(
      { id: user._id, username: user.username },
      jwtSecretKey,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Respond with a success message, token, and Ethereum address
    res.status(200).json({
      message: "Login successful",
      id: user._id,
      token: token,
      ethereumAddress: user.ethereumAddress,
      ethereumPrivateKey: user.ethereumPrivateKey,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/update-role", authenticateToken, async (req, res) => {
  const { role } = req.body;
  const userId = req.user.id; // Retrieved from decoded token

  console.log("Attempting to update role for userID:", userId, "to", role);

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found for ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();
    console.log("Role updated successfully for userID:", userId);
    res.status(200).json({ message: "Role updated successfully" });
  } catch (error) {
    console.error("Error updating role:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

app.get("/api/drivers", async (req, res) => {
  try {
    const drivers = await User.find(
      { role: "driver" },
      "ethereumAddress"
    ).lean();
    res.json(drivers);
  } catch (error) {
    console.error("Failed to fetch drivers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
