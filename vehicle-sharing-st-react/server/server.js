require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const { getNextAccount } = require("./ethereumService");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const encryptionSecret = process.env.ENCRYPTION_SECRET;
const jwtSecretKey = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

const mongoDBUri = process.env.MONGO_DB_URI;

mongoose
  .connect(mongoDBUri)
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

const userSchema = new mongoose.Schema({
  username: String,
  hashedPassword: String,
  address: String,
  accountIndex: Number,
  encryptedPrivateKey: String,
});

const User = mongoose.model("User", userSchema);

app.post("/api/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const account = await getNextAccount(async (index) => {
      return (await User.findOne({ accountIndex: index })) == null;
    });

    const encryptedPrivateKey = CryptoJS.AES.encrypt(
      account.privateKey,
      encryptionSecret
    ).toString();

    const user = new User({
      username,
      hashedPassword,
      address: account.address,
      accountIndex: account.accountIndex,
      encryptedPrivateKey: encryptedPrivateKey,
    });

    await user.save();

    res
      .status(201)
      .json({ message: "User created successfully", address: account.address });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      jwtSecretKey,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to get the decrypted private key
app.post("/api/privateKey", async (req, res) => {
  const { userId } = req.body; // Your auth strategy might provide the userId differently

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Ensure there's a valid session or token check here to protect this sensitive endpoint

  const decryptedPrivateKeyBytes = CryptoJS.AES.decrypt(
    user.encryptedPrivateKey,
    encryptionSecret
  );
  const decryptedPrivateKey = decryptedPrivateKeyBytes.toString(
    CryptoJS.enc.Utf8
  );

  return res.status(200).json({ privateKey: decryptedPrivateKey });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
