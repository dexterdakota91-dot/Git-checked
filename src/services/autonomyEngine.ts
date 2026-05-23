import { collection, getDocs, doc, updateDoc, arrayUnion, query, where, Firestore, runTransaction } from "firebase/firestore";
import { GoogleGenAI } from "@google/genai";

export const startAutonomyEngine = (db: Firestore) => {
  if (!process.env.GEMINI_API_KEY) {
    console.error("[Autonomy Engine] GEMINI_API_KEY is missing. Aborting engine startup.");
    return;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const stripUndefined = (obj: any) => JSON.parse(JSON.stringify(obj));

  let isAutonomyRunning = false;
  let nextAutonomyRun = 0;

  const runAutonomyEngine = async () => {
    if (isAutonomyRunning) return;
    if (Date.now() < nextAutonomyRun) return;

    isAutonomyRunning = true;

    try {
      const q = query(collection(db, "projects"), where("isAutonomous", "==", true));
      const querySnapshot = await getDocs(q);

      const activeProjects = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));

      if (activeProjects.length > 0) {
        console.log(`[Autonomy Engine] Awakening. Found ${activeProjects.length} active projects.`);
      }

      for (const project of activeProjects) {
        const projectId = project.id;
        const tasks = project.tasks || [];
        const totalTasks = tasks.length || 0;
        const completedTasks = tasks.filter((t: any) => t.status === 'completed').length || 0;

        const contextStr = `
          Project Name: ${project.name}
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
            } catch (e) {
              console.error(`[Autonomy Engine] Failed to parse action data for ${projectId}. Data: ${dataStr}`, e);
              continue;
            }

            console.log(`[Autonomy Engine] Executing Action: ${type} for ${project.name}`);

            const projectRef = doc(db, "projects", projectId);

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
              await updateDoc(projectRef, {
                agents: arrayUnion(newAgent),
                logs: arrayUnion({
                  id: Date.now().toString(),
                  timestamp: new Date().toISOString(),
                  type: 'success',
                  message: `AUTONOMOUS SPAWN: ${data.name || 'Unknown Agent'} initialized.`,
                  details: `Role: ${data.role || 'Unspecified'}`
                })
              });
            } else if (type === 'COMPLETE_TASK') {
              await runTransaction(db, async (transaction) => {
                const docSnap = await transaction.get(projectRef);
                if (!docSnap.exists()) {
                  throw new Error("Project does not exist!");
                }
                const currentData = docSnap.data();
                const currentTasks = currentData.tasks || [];
                const updatedTasks = currentTasks.map((t: any) =>
                  t.id === data.taskId ? { ...t, status: 'completed', progress: 100 } : t
                );

                const completionLog = stripUndefined({
                  id: Date.now().toString(),
                  timestamp: new Date().toISOString(),
                  type: 'success',
                  message: `AUTONOMOUS COMPLETION: ${data.logMessage || 'Milestone reached.'}`,
                  details: `Task ID: ${data.taskId || 'unknown'}`
                });

                transaction.update(projectRef, {
                  tasks: updatedTasks,
                  logs: arrayUnion(completionLog)
                });
              });
            } else if (type === 'ADD_LOG') {
              await updateDoc(projectRef, stripUndefined({
                logs: arrayUnion({
                  id: Date.now().toString(),
                  timestamp: new Date().toISOString(),
                  type: data.type || 'info',
                  message: `[AI ARCHITECT]: ${data.message || 'System update'}`,
                  details: data.details || ""
                })
              }));
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
    } finally {
      isAutonomyRunning = false;
    }
  };

  const HEARTBEAT_INTERVAL = 10 * 60 * 1000;
  setInterval(runAutonomyEngine, HEARTBEAT_INTERVAL);
  setTimeout(runAutonomyEngine, 5000);
};
