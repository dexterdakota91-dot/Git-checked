import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Import extracted routers and services
import { plaidRouter } from "./src/routes/plaid.js";
import { stripeRouter } from "./src/routes/stripe.js";
import { startAutonomyEngine } from "./src/services/autonomyEngine.js";

// Ensure environment variables are loaded
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Set up Firebase for Autonomy Engine
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

async function startServer() {
  // Try to use a dedicated backend service account config if available
  try {
    let appletConfig;
    try {
      const fs = await import("fs/promises");
      const configData = await fs.readFile(
        path.join(process.cwd(), "firebase-applet-config.json"),
        "utf8"
      );
      appletConfig = JSON.parse(configData);
    } catch (e) {
      // ignore
    }

    const firebaseApp = initializeApp(appletConfig || firebaseConfig);
    const db = getFirestore(firebaseApp);

    // Start Autonomy Engine
    startAutonomyEngine(db);

  } catch (err) {
    console.warn("Failed to initialize Firebase for Autonomy Engine:", err);
  }

  // Mount API Routes
  app.use("/api/plaid", plaidRouter);
  app.use("/api/stripe", stripeRouter);

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
