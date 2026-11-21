const express = require("express");
const Order = require("../models/Order");
const {protect} = require("../middleware/authMiddleware");

const router = express.Router();

// @route GET api/orders/my-orders
// @desc get logged in users orders
// @access Private

router.get("/my-orders", protect, async(req, res) =>{
    try {
        // Find orders for the authenticated user, sorted by most recent first
        const orders = await Order.find({user: req.user._id}).sort({
            createdAt: -1
        });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
});

// @route GET /api/orders/:id
// @desc get order details by ID
// @access Private

router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Return the full order details
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route DELETE /api/orders/:id
// @desc Delete an order belonging to the logged-in user
// @access Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ensure the order belongs to the logged-in user
    if (order.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this order" });
    }

    // Prevent deleting delivered orders
    if (order.isDelivered) {
      return res
        .status(400)
        .json({ message: "Delivered orders cannot be deleted" });
    }

    await order.deleteOne();
    res.json({ message: "Order deleted successfully", id: order._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;