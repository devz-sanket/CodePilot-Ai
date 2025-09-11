// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const JWT_SECRET = "secret123"; // later move to .env

// MongoDB connection
mongoose.connect(
  "mongodb+srv://Sanket:admin6571@cluster0.wud4b7n.mongodb.net/CodePilot",
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => console.log("✅ MongoDB Connected"))
 .catch(err => console.error("❌ MongoDB Error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

const User = mongoose.model("User", userSchema);

// Signup route
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.json({ message: "User registered successfully!" });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: "Signup failed" });
    }
  }
});

// Login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ error: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
