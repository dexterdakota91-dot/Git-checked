import { Router } from "express";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

export const plaidRouter = Router();

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

plaidRouter.post("/create-link-token", async (req, res) => {
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
