import express from "express";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Offer from "../models/Offer.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Admin Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) return res.status(400).json({ message: "Admin not found" });

        const validPass = await bcrypt.compare(password, admin.password);
        if (!validPass) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "2h" });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Middleware to verify Admin
const verifyAdmin = (req, res, next) => {
    const token = req.header("auth-token");
    if (!token) return res.status(401).json({ message: "Access Denied" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (verified.role !== "admin") return res.status(403).json({ message: "Not authorized" });
        
        req.admin = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
    }
};

// Get all users
router.get("/users", verifyAdmin, async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get all orders
router.get("/orders", verifyAdmin, async (req, res) => {
    try {
        const orders = await Order.find().populate("userId", "name email");
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Create an offer
router.post("/offer", verifyAdmin, async (req, res) => {
    try {
        const { title, description, discount, validTill } = req.body;

        const offer = new Offer({ title, description, discount, validTill });
        await offer.save();

        res.status(201).json({ message: "Offer created successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get all offers
router.get("/offers", verifyAdmin, async (req, res) => {
    try {
        const offers = await Offer.find();
        res.json(offers);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get revenue insights
router.get("/insights", verifyAdmin, async (req, res) => {
    try {
        const orders = await Order.find();
        const totalRevenue = orders.reduce((sum, order) => sum + order.price * order.quantity, 0);
        const totalOrders = orders.length;
        const totalUsers = await User.countDocuments();

        res.json({ totalRevenue, totalOrders, totalUsers });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
