import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, unique: true, required: true, trim: true },
        password: { type: String, required: true },
        orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }]
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
