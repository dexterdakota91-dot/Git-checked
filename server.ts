import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import Stripe from "stripe";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

// Load local overrides first, then fallback to .env
dotenv.config({ path: ".env.local" });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helpers for lazy initialization
  const getGenAI = () => {
    const apiKey = process.env.GEMMY_3 || process.env.GEMINI_API_KEY || process.env.gemini_api_key;
    // Check for missing or placeholder keys
    if (!apiKey || 
        apiKey === "free" || 
        apiKey === "MY_GEMINI_API_KEY" || 
        apiKey === "MY_GEMMY_3_API_KEY" ||
        apiKey.includes("TODO") || 
        apiKey.length < 10) {
      return null;
    }
    return new GoogleGenAI({ apiKey });
  };

  const getStripeClient = () => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key.includes("TODO") || key.length < 10) return null;
    return new Stripe(key);
  };

  // Plaid Setup
  const getPlaidClient = () => {
    const clientId = process.env.PLAID_CLIENT_ID;
    const secret = process.env.PLAID_SECRET;
    const env = process.env.PLAID_ENV || "sandbox";

    if (!clientId || !secret || clientId.includes("TODO") || secret.includes("TODO")) {
      console.warn("Plaid credentials missing or placeholder. Falling back to mock Plaid client.");
      return null;
    }

    const plaidConfig = new Configuration({
      basePath: PlaidEnvironments[env as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          "PLAID-CLIENT-ID": clientId,
          "PLAID-SECRET": secret,
        },
      },
    });
    return new PlaidApi(plaidConfig);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // API Routes
  app.post("/api/plaid/create-link-token", async (req, res) => {
    try {
      const client = getPlaidClient();
      if (!client) {
        return res.json({ link_token: "demo_link_token_123" });
      }
      const response = await client.linkTokenCreate({
        user: { client_user_id: "user_123" },
        client_name: "Aetheris Ventures",
        products: ["auth", "transactions"] as any,
        country_codes: ["US"] as any,
        language: "en",
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("Plaid Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/stripe/create-checkout", async (req, res) => {
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        if (process.env.DEMO_MODE === "true" || process.env.demo_mode === "true") {
          return res.json({ url: `${req.headers.origin}/dashboard?success=true&demo=true` });
        }
        return res.status(400).json({ error: "STRIPE_SECRET_KEY is missing. Enable DEMO_MODE=true for simulation." });
      }

      const stripe = getStripeClient();
      if (!stripe) {
        return res.status(400).json({ error: "Stripe client could not be initialized." });
      }

      const { amount, projectName } = req.body;
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: `Venture Capital: ${projectName}` },
              unit_amount: amount,
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
