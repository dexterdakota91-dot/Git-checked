import { Router } from "express";
import Stripe from "stripe";

export const stripeRouter = Router();

const getStripeClient = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes("TODO") || key.length < 10) return null;
  return new Stripe(key);
};

stripeRouter.post("/create-checkout", async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      if (process.env.DEMO_MODE === "true" || process.env.demo_mode === "true") {
        return res.json({ url: `${req.headers.origin}/dashboard?success=true&demo=true` });
      }
      return res.status(500).json({ error: "STRIPE_SECRET_KEY is missing. Enable DEMO_MODE=true for simulation." });
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(500).json({ error: "Stripe client could not be initialized." });
    }

    const { amount, projectName } = req.body;
    const unitAmount = Number(amount);
    if (!Number.isInteger(unitAmount) || unitAmount <= 0) {
      return res.status(400).json({ error: "amount must be a positive integer in cents." });
    }
    const normalizedProjectName =
      typeof projectName === "string" && projectName.trim().length > 0
        ? projectName.trim().slice(0, 120)
        : "Project";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Venture Capital: ${normalizedProjectName}` },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.origin}/dashboard?success=true`,
      cancel_url: `${req.headers.origin}/dashboard?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
});
