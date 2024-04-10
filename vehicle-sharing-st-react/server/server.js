require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

// .env
const mongoDBUri = process.env.MONGO_DB_URI;

mongoose
  .connect(mongoDBUri)
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

// Define a Mongoose schema and model for User
const userSchema = new mongoose.Schema({
  username: String,
  hashedPassword: String,
  address: String,
});

const User = mongoose.model("User", userSchema);

app.use(express.json());

app.post("/api/signup", async (req, res) => {
  try {
    const { username, password, address } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user and save it to the database
    const user = new User({ username, hashedPassword, address });
    await user.save();

    res.status(201).json({ message: "User created successfully" });
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

    // Respond with a success message and token
    res.status(200).json({ message: "Login successful", token: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
