import admin from "firebase-admin";
import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import Stripe from "stripe";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, runTransaction, collection, query, where, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore";
import fs from "fs";

// Ensure environment variables are loaded
dotenv.config();

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// FIX: Guard against Firebase duplicate initialization (throws if called twice e.g. HMR)
const firebaseConfig = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  firestoreDatabaseId: process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

let db: any;
try {
  if (fs.existsSync("firebase-applet-config.json")) {
    const appletConfig = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(appletConfig)
      });
    }
    db = admin.firestore();
  } else {
    throw new Error("No admin config found");
  }
} catch (e) {
  const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
}


/**
 * Initialize and start the Express server, background Autonomy Engine, and related API routes.
 *
 * Sets up middleware, lazy-initialized clients (Gemini, Stripe, Plaid), the periodic Autonomy Engine
 * that advances autonomous projects in Firestore, endpoints for Plaid link-token and Stripe checkout,
 * and development/production static hosting (Vite dev middleware in dev, serving `dist` in production).
 */
async function startServer() {
  const app = express();
  const parsedPort = process.env.PORT !== undefined ? Number(process.env.PORT) : NaN;
  const PORT = Number.isFinite(parsedPort) && Number.isInteger(parsedPort) ? parsedPort : 3000;

  app.use(express.json());

  // Helpers for lazy initialization
  const getGenAI = () => {
    const apiKey = process.env.GEMMY_3 || process.env.GEMINI_API_KEY || process.env.gemini_api_key;
    if (!apiKey || apiKey === "free" || apiKey.length < 10) return null;
    return new GoogleGenAI({ apiKey });
  };

  // Autonomy Engine
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Recursively remove undefined values for Firestore compatibility
  const stripUndefined = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(stripUndefined);
    } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
      return Object.entries(obj).reduce((acc: any, [key, value]) => {
        if (value !== undefined) {
          acc[key] = stripUndefined(value);
        }
        return acc;
      }, {});
    }
    return obj;
  };

  // Autonomy Engine State
  let nextAutonomyRun = 0;

  // Autonomy Engine
  const runAutonomyEngine = async () => {
    if (Date.now() < nextAutonomyRun) return;

    console.log("[Autonomy Engine] Heartbeat: Checking for autonomous ventures...");
    const ai = getGenAI();
    if (!ai) {
      console.warn("[Autonomy Engine] Gemini API Key missing. Background activity suspended.");
      return;
    }


    try {
      let querySnapshot;
      if (admin.apps.length > 0) {
        querySnapshot = await db.collection("projects").where("isAutonomous", "==", true).get();
      } else {
        const projectsRef = collection(db, "projects");
        const q = query(projectsRef, where("isAutonomous", "==", true));
        querySnapshot = await getDocs(q);
      }

      for (const projectDoc of querySnapshot.docs) {
        const project = projectDoc.data();
        const projectId = projectDoc.id;

        // Create Context for Gemini
        const completedTasks = project.tasks?.filter((t: any) => t.status === 'completed').length || 0;
        const totalTasks = project.tasks?.length || 0;
        
        const contextStr = `
          Active Venture: ${project.name}
          Mission: ${project.branding?.missionStatement || 'Not set'}
          Current Status: ${project.status}
          Roadmap Progress: ${completedTasks}/${totalTasks} tasks completed.
          Active Agents: ${project.agents?.map((a: any) => `${a.name} (${a.role})`).join(', ') || 'None'}
          Recent Logs: ${project.logs?.slice(-5).map((l: any) => l.message).join(' | ') || 'No logs'}
        `;

        try {
          const response = await ai.models.generateContent({
            // FIX: "gemini-3-flash-preview" does not exist — corrected to stable model
            model: "gemini-2.0-flash",
            contents: `You are the Aetheris Ventures Business Architect running in PERSISTENT AUTONOMY MODE. 
            Your goal is to advance this venture while the user is offline.
            
            ${contextStr}
            
            Based on the current state, determine the most critical next step. 
            You MUST output an ACTION block to advance the project.
            
            Types:
            - CREATE_AGENT: { name: string, role: string, specialty: string, capabilities: string[] }
            - COMPLETE_TASK: { taskId: string, logMessage: string }
            - ADD_LOG: { type: 'info' | 'success' | 'thought' | 'decision', message: string, details?: string }
            
            Output your thought process clearly, then end with the [ACTION:...] block.`,
            config: {
              systemInstruction: "You are an elite business architect that executes tasks autonomously. Always output a single [ACTION:TYPE:JSON_DATA] block at the end. JSON_DATA must be valid, parseable JSON with NO trailing commas."
            }
          });

          const text = response.text || "";
          // Robust regex to find [ACTION:TYPE:DATA] even if DATA contains brackets or colons
          const actionMatch = text.match(/\[ACTION:([^:]+):([\s\S]*?)\]\s*$/);

          if (actionMatch) {
            const type = actionMatch[1].trim();
            const dataStr = actionMatch[2].trim();
            let data;
            try {
              // Attempt to parse JSON strictly if it looks like an object/array
              if (dataStr.startsWith('{') || dataStr.startsWith('[')) {
                // Remove potential trailing commas or other AI artifacts before parsing
                const sanitizedData = dataStr.replace(/,\s*([}\]])/g, '$1'); 
                data = JSON.parse(sanitizedData);
              } else {
                data = dataStr.replace(/^"(.*)"$/, '$1');
              }
            } catch {
              console.error(`[Autonomy Engine] Failed to parse action data for ${projectId}. Data: ${dataStr}`);
              continue;
            }

            console.log(`[Autonomy Engine] Executing Action: ${type} for ${project.name}`);
            
            let projectRef;
            if (admin.apps.length > 0) {
              projectRef = db.collection("projects").doc(projectId);
            } else {
              projectRef = doc(db, "projects", projectId);
            }

            const aUnion = admin.apps.length > 0 ? admin.firestore.FieldValue.arrayUnion : arrayUnion;

            if (type === 'CREATE_AGENT') {
              const newAgent = stripUndefined({
                ...data,
                id: `agent-${Math.random().toString(36).substr(2, 5)}`,
                status: 'idle',
                name: data.name || 'AI Assistant',
                role: data.role || 'Specialized Agent',
                specialty: data.specialty || 'Generalist',
                capabilities: data.capabilities || [],
                avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${data.name || 'agent'}&backgroundColor=transparent`,
              });

              const updateData = {
                agents: aUnion(newAgent),
                logs: aUnion({
                  id: Date.now().toString(),
                  timestamp: new Date().toISOString(),
                  type: 'success',
                  message: `AUTONOMOUS SPAWN: ${data.name || 'Unknown Agent'} initialized.`,
                  details: `Role: ${data.role || 'Unspecified'}`
                })
              };

              if (admin.apps.length > 0) {
                await projectRef.update(updateData);
              } else {
                await updateDoc(projectRef, updateData);
              }
            } else if (type === 'COMPLETE_TASK') {

              const performTransaction = async () => {
                const transactionFn = async (transaction: any) => {
                  let currentProject;
                  if (typeof transaction.get === 'function') {
                    // Admin SDK or Client transaction
                    const docSnap = await transaction.get(projectRef);
                    currentProject = typeof docSnap.data === 'function' ? docSnap.data() : undefined;
                  }

                  if (!currentProject) return;

                  const updatedTasks = (currentProject.tasks || []).map((t: any) =>
                    t.id === data.taskId ? { ...t, status: 'completed', progress: 100 } : t
                  );

                  const updateData = stripUndefined({
                    tasks: updatedTasks,
                    logs: aUnion({
                      id: Date.now().toString(),
                      timestamp: new Date().toISOString(),
                      type: 'success',
                      message: `AUTONOMOUS COMPLETION: ${data.logMessage || 'Milestone reached.'}`,
                      details: `Task ID: ${data.taskId || 'unknown'}`
                    })
                  });

                  transaction.update(projectRef, updateData);
                };

                if (db.runTransaction) {
                  await db.runTransaction(transactionFn);
                } else {
                  await runTransaction(db, transactionFn);
                }
              };
              await performTransaction();
            } else if (type === 'ADD_LOG') {
              const updateData = stripUndefined({
                logs: aUnion({
                  id: Date.now().toString(),
                  timestamp: new Date().toISOString(),
                  type: data.type || 'info',
                  message: `[AI ARCHITECT]: ${data.message || 'System update'}`,
                  details: data.details || ""
                })
              });

              if (admin.apps.length > 0) {
                await projectRef.update(updateData);
              } else {
                await updateDoc(projectRef, updateData);
              }
            }
          }

          
          // Respectful delay between projects to avoid bursting
          await sleep(2000);

        } catch (genError: any) {
          const isQuota = genError.message?.includes("429") || genError.status === "RESOURCE_EXHAUSTED";
          const isHighDemand = genError.message?.includes("503") || genError.status === "UNAVAILABLE";
          const isInternal = genError.message?.includes("500") || genError.status === "INTERNAL";

          if (isQuota || isHighDemand || isInternal) {
            const reason = isQuota ? "Quota (429)" : isHighDemand ? "High Demand (503)" : "Internal Error (500)";
            const cooldown = isQuota ? 2 : 5;
            console.error(`[Autonomy Engine] ${reason}. Cooling off for ${cooldown} minutes.`);
            nextAutonomyRun = Date.now() + cooldown * 60 * 1000;
            break;
          }
          console.error(`[Autonomy Engine] Generation error for ${projectId}:`, genError.message);
        }
      }

      await Promise.allSettled(updatePromises);
    } catch (error) {
      console.error("[Autonomy Engine] Critical Failure:", error);
    }
  };

  // Start the heartbeat (Every 10 minutes)
  const HEARTBEAT_INTERVAL = 10 * 60 * 1000;
  setInterval(runAutonomyEngine, HEARTBEAT_INTERVAL);
  // Optional: Run immediately on startup
  setTimeout(runAutonomyEngine, 5000);

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

  // API Routes
  app.post("/api/plaid/create-link-token", async (req, res) => {
    try {
      const fs = await import("fs/promises");
      const configData = await fs.readFile(
        path.join(process.cwd(), "firebase-applet-config.json"),
        "utf8"
      );
      appletConfig = JSON.parse(configData);
    } catch {
      // ignore
    }

  app.post("/api/stripe/create-checkout", async (req, res) => {
    try {
      const BASE_URL = process.env.SERVER_BASE_URL || "http://localhost:3000";

      if (!process.env.STRIPE_SECRET_KEY) {
        if (process.env.DEMO_MODE === "true" || process.env.demo_mode === "true") {
          return res.json({ url: new URL('/dashboard?success=true&demo=true', BASE_URL).toString() });
        }
        return res.status(500).json({ error: "STRIPE_SECRET_KEY is missing. Enable DEMO_MODE=true for simulation." });
      }

      const stripe = getStripeClient();
      if (!stripe) {
        return res.status(500).json({ error: "Stripe client could not be initialized." });
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
        success_url: new URL('/dashboard?success=true', BASE_URL).toString(),
        cancel_url: new URL('/dashboard?canceled=true', BASE_URL).toString(),
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe Error:", error);
      res.status(500).json({ error: "Payment processing failed" });
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
