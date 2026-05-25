import { Router } from "express";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

export const plaidRouter = Router();

const getPlaidClient = () => {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  const env = process.env.PLAID_ENV || "sandbox";

  if (!clientId || !secret || clientId.includes("TODO") || secret.includes("TODO")) {
    const isDemo = process.env.DEMO_MODE === "true" || process.env.demo_mode === "true";
    if (isDemo) {
      console.warn("Plaid credentials missing or placeholder. Falling back to mock Plaid client in DEMO_MODE.");
      return null;
    }
    throw new Error("Plaid credentials missing and DEMO_MODE is false.");
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

plaidRouter.post("/create-link-token", async (req, res) => {
  try {
    // Basic auth check: expect userId in the body.
    const userId = req.body.userId || req.headers['x-user-id'];
    if (!userId || typeof userId !== 'string') {
      return res.status(401).json({ error: "Unauthorized: Missing or invalid user identifier" });
    }

    const client = getPlaidClient();
    if (!client) {
      return res.json({ link_token: "demo_link_token_123" });
    }

    const response = await client.linkTokenCreate({
      user: { client_user_id: userId },
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
