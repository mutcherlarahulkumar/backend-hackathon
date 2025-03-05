import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Order from "../models/Order.js";

dotenv.config();
const router = express.Router();

// Middleware for verifying JWT
const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access Denied" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
    }
};

// Get Order History
router.get("/orders", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id; 
        const orders = await Order.find({ userId }); 

        res.status(200).json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


// Place an Order
router.post("/order", verifyToken, async (req, res) => {
    try {
        const { product, quantity, price } = req.body;
        const userId = req.user.id; 

        // Directly create an order entry in the Orders table
        const newOrder = await Order.create({
            userId,
            product,
            quantity,
            price
        });

        res.status(201).json({ message: "Order placed successfully", order: newOrder });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});



export default router;
