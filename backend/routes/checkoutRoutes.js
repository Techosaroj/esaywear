const express = require("express");
const Checkout = require("../models/Checkout");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");
const Stripe = require("stripe");

const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const router = express.Router()

// Shared helper: turn a paid checkout into a finalized Order.
// Used by both the legacy /finalize route and the Stripe verification route.
const finalizeCheckoutToOrder = async (checkout) => {
    if (checkout.isFinalized) {
        // Already finalized — return the existing order instead of creating a duplicate.
        return Order.findOne({ checkout: checkout._id });
    }

    const finalOrder = await Order.create({
        user: checkout.user,
        checkout: checkout._id,
        orderItems: checkout.checkoutItems,
        shippingAddress: checkout.shippingAddress,
        paymentMethod: checkout.paymentMethod,
        totalPrice: checkout.totalPrice,
        isPaid: true,
        paidAt: checkout.paidAt,
        isDelivered: false,
        paymentStatus: "paid",
        paymentDetails: checkout.paymentDetails,
    });

    checkout.isFinalized = true;
    checkout.finalizedAt = Date.now();
    await checkout.save();

    for (const item of checkout.checkoutItems) {
        const product = await Product.findById(item.productId);
        if (product) {
            product.countInStock -= item.quantity;
            await product.save();
        }
    }

    await Cart.findOneAndDelete({ user: checkout.user });

    return finalOrder;
};

// @route POST /api/checkout
// @desc Create a new checkout session
// @access Private

router.post("/", protect, async (req, res) => {
    const { checkoutItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    if (!checkoutItems || checkoutItems.length === 0) {
        return res.status(400).json({ message: "No items in checkout" })
    }

    try {
        // Create a new checkout session
        const newCheckout = await Checkout.create({
            user: req.user._id,
            checkoutItems: checkoutItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            paymentStatus: "Pending",
            isPaid: false,
        });

        console.log(`Checkout created for user: ${req.user._id}`);
        res.status(201).json(newCheckout);


    } catch (error) {
        console.error("Error Creating checkout session: ", error);
        res.status(500).json({ message: "Server Error" });


    }
})

// @route POST /api/checkout/:id/create-stripe-session
// @desc Create a Stripe Checkout session (hosted payment page) for this checkout
// @access Private

router.post("/:id/create-stripe-session", protect, async (req, res) => {
    if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured on the server (missing STRIPE_SECRET_KEY)" });
    }

    try {
        const checkout = await Checkout.findById(req.params.id);

        if (!checkout) {
            return res.status(404).json({ message: "Checkout not found" });
        }

        if (checkout.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to pay for this checkout" });
        }

        if (checkout.isFinalized) {
            return res.status(400).json({ message: "Checkout already finalized" });
        }

        const line_items = checkout.checkoutItems.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name,
                    ...(item.size || item.color
                        ? { description: [item.size, item.color].filter(Boolean).join(" / ") }
                        : {}),
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items,
            client_reference_id: checkout._id.toString(),
            metadata: { checkoutId: checkout._id.toString() },
            customer_email: req.user.email,
            success_url: `${FRONTEND_URL}/order-confirmation?checkout_id=${checkout._id}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/checkout`,
        });

        res.status(200).json({ url: session.url, sessionId: session.id });
    } catch (error) {
        console.error("Error creating Stripe session: ", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route GET /api/checkout/:id/verify-stripe-session
// @desc Confirm payment with Stripe and finalize the order (called when the user returns from Stripe)
// @access Private

router.get("/:id/verify-stripe-session", protect, async (req, res) => {
    if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured on the server (missing STRIPE_SECRET_KEY)" });
    }

    const { session_id } = req.query;
    if (!session_id) {
        return res.status(400).json({ message: "Missing session_id" });
    }

    try {
        const checkout = await Checkout.findById(req.params.id);

        if (!checkout) {
            return res.status(404).json({ message: "Checkout not found" });
        }

        if (checkout.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to view this checkout" });
        }

        // Already finalized (e.g. page refreshed) — just return the existing order.
        if (checkout.isFinalized) {
            const existingOrder = await Order.findOne({ checkout: checkout._id });
            return res.status(200).json(existingOrder);
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);

        // Make sure this session really belongs to this checkout, and that Stripe confirms it's paid.
        if (session.client_reference_id !== checkout._id.toString()) {
            return res.status(400).json({ message: "Session does not match this checkout" });
        }

        if (session.payment_status !== "paid") {
            return res.status(400).json({ message: "Payment not completed" });
        }

        checkout.isPaid = true;
        checkout.paymentStatus = "paid";
        checkout.paymentDetails = {
            stripeSessionId: session.id,
            stripePaymentIntent: session.payment_intent,
        };
        checkout.paidAt = Date.now();
        await checkout.save();

        const finalOrder = await finalizeCheckoutToOrder(checkout);
        res.status(200).json(finalOrder);
    } catch (error) {
        console.error("Error verifying Stripe session: ", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route POST /api/checkout/:id/finalize
// @desc Finalize checkout and convert to an order after payment confirmation
// @ACCESS Private

router.post("/:id/finalize", protect, async (req, res) => {
    try {
        const checkout = await Checkout.findById(req.params.id);

        if (!checkout) {
            return res.status(404).json({ message: "Checkout not found" });
        }

        if (checkout.isPaid && !checkout.isFinalized) {
            const finalOrder = await finalizeCheckoutToOrder(checkout);
            res.status(201).json(finalOrder);
        } else if (checkout.isFinalized) {
            res.status(400).json({ message: "Checkout already finalized" });
        } else {
            res.status(400).json({ message: "Checkout is not paid" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });


    }
})

module.exports = router;