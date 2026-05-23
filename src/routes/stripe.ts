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
    const baseUrl = process.env.APP_BASE_URL?.replace(/\/$/, "");
    if (!baseUrl) {
      return res.status(500).json({ error: "Server Configuration Error: APP_BASE_URL is not set." });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      if (process.env.DEMO_MODE === "true" || process.env.demo_mode === "true") {
        return res.json({ url: `${baseUrl}/dashboard?success=true&demo=true` });
      }
      return res.status(400).json({ error: "STRIPE_SECRET_KEY is missing. Enable DEMO_MODE=true for simulation." });
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(400).json({ error: "Stripe client could not be initialized." });
    }

    const { amount, projectName } = req.body;

    // Validate Amount
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount. Must be a positive finite integer." });
    }

    // Validate and sanitize Project Name
    if (typeof projectName !== 'string' || !projectName.trim()) {
      return res.status(400).json({ error: "Invalid project name." });
    }
    const cleanProjectName = projectName.trim().replace(/[\x00-\x1F\x7F-\x9F]/g, "").substring(0, 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Venture Capital: ${cleanProjectName}` },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/dashboard?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
});
