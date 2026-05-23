import { getFirestore, collection, query, where, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { GoogleGenAI } from "@google/genai";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Recursively remove undefined values for Firestore compatibility
const stripUndefined = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(stripUndefined);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc: any, [key, value]) => {
      if (value !== undefined) {
        acc[key] = stripUndefined(value);
      }
      return acc;
    }, {});
  }
  return obj;
};

const isValidApiKey = (key?: string) => {
  if (!key) return false;
  if (key === "free" || key === "TODO" || key.length < 10) return false;
  return true;
};

export function startAutonomyEngine(
  db: any,
  adminDb: any = null,
  isDbAdmin: boolean = false,
  adminFieldValue: any = null
) {
  const getGenAI = () => {
    const apiKey = process.env.GEMMY_3 || process.env.GEMINI_API_KEY || process.env.gemini_api_key;
    if (!isValidApiKey(apiKey)) return null;
    return new GoogleGenAI({ apiKey });
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
      let querySnapshot: any;
      if (isDbAdmin) {
        querySnapshot = await adminDb.collection("projects").where("isAutonomous", "==", true).get();
      } else {
        const projectsRef = collection(db, "projects");
        const q = query(projectsRef, where("isAutonomous", "==", true));
        querySnapshot = await getDocs(q);
      }

      for (const projectDoc of querySnapshot.docs) {
        const project = projectDoc.data();
        const projectId = projectDoc.id;

        console.log(`[Autonomy Engine] Advancing Venture: ${project.name} (${projectId})`);

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
          const actionMatch = text.match(/\[ACTION:([^:]+):([\s\S]*?)\]\s*$/m) || text.match(/\[ACTION:([^:]+):([\s\S]*?)\]/);

          if (actionMatch) {
            const type = actionMatch[1].trim();
            const dataStr = actionMatch[2].trim();
            let data;
            try {
              if (dataStr.startsWith('{') || dataStr.startsWith('[')) {
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
                agents: isDbAdmin ? adminFieldValue.arrayUnion(newAgent) : arrayUnion(newAgent),
                logs: isDbAdmin ? adminFieldValue.arrayUnion({
                  id: Date.now().toString(),
                  timestamp: new Date().toISOString(),
                  type: 'success',
                  message: `AUTONOMOUS SPAWN: ${data.name || 'Unknown Agent'} initialized.`,
                  details: `Role: ${data.role || 'Unspecified'}`
                }) : arrayUnion({
                  id: Date.now().toString(),
                  timestamp: new Date().toISOString(),
                  type: 'success',
                  message: `AUTONOMOUS SPAWN: ${data.name || 'Unknown Agent'} initialized.`,
                  details: `Role: ${data.role || 'Unspecified'}`
                })
              };

              if (isDbAdmin) {
                await adminDb.collection("projects").doc(projectId).update(updateData);
              } else {
                await updateDoc(doc(db, "projects", projectId), updateData);
              }
            } else if (type === 'COMPLETE_TASK') {
              const updatedTasks = (project.tasks || []).map((t: any) =>
                t.id === data.taskId ? { ...t, status: 'completed', progress: 100 } : t
              );

              const updateData = stripUndefined({
                tasks: updatedTasks,
                logs: isDbAdmin ? adminFieldValue.arrayUnion({
                  id: Date.now().toString(),
                  timestamp: new Date().toISOString(),
                  type: 'success',
                  message: `AUTONOMOUS COMPLETION: ${data.logMessage || 'Milestone reached.'}`,
                  details: `Task ID: ${data.taskId || 'unknown'}`
                }) : arrayUnion({
                  id: Date.now().toString(),
                  timestamp: new Date().toISOString(),
                  type: 'success',
                  message: `AUTONOMOUS COMPLETION: ${data.logMessage || 'Milestone reached.'}`,
                  details: `Task ID: ${data.taskId || 'unknown'}`
                })
              });

              if (isDbAdmin) {
                await adminDb.collection("projects").doc(projectId).update(updateData);
              } else {
                await updateDoc(doc(db, "projects", projectId), updateData);
              }
            } else if (type === 'ADD_LOG') {
              const updateData = stripUndefined({
                logs: isDbAdmin ? adminFieldValue.arrayUnion({
                  id: Date.now().toString(),
                  timestamp: new Date().toISOString(),
                  type: data.type || 'info',
                  message: `[AI ARCHITECT]: ${data.message || 'System update'}`,
                  details: data.details || ""
                }) : arrayUnion({
                  id: Date.now().toString(),
                  timestamp: new Date().toISOString(),
                  type: data.type || 'info',
                  message: `[AI ARCHITECT]: ${data.message || 'System update'}`,
                  details: data.details || ""
                })
              });

              if (isDbAdmin) {
                await adminDb.collection("projects").doc(projectId).update(updateData);
              } else {
                await updateDoc(doc(db, "projects", projectId), updateData);
              }
            }
          }

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
    } catch (error) {
      console.error("[Autonomy Engine] Critical Failure:", error);
    }
  };

  // Start the heartbeat (Every 10 minutes)
  const HEARTBEAT_INTERVAL = 10 * 60 * 1000;
  setInterval(runAutonomyEngine, HEARTBEAT_INTERVAL);
  // Optional: Run immediately on startup
  setTimeout(runAutonomyEngine, 5000);
}
