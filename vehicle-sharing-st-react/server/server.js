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
  accountIndex: { type: Number, unique: true }, // Add this line
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

    await user.save();

    res.status(201).json({
      message: "User created successfully",
      ethereumAddress: availableAccount.address,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const jwt = require("jsonwebtoken");

// Secret key for JWT signing and encryption
// Store this in a safe place and do not expose it in your code directly
const jwtSecretKey = process.env.JWT_SECRET;

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
      token: token,
      ethereumAddress: user.ethereumAddress,
      ethereumPrivateKey: user.ethereumPrivateKey,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
