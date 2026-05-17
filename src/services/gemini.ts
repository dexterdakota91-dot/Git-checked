/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { Project } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const extractJson = (raw: string) => {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/[\{\[][\s\S]*[\}\]]/);
    if (!match) {
      throw new Error("No JSON found in AI response.");
    }
    return JSON.parse(match[0]);
  }
};

const callAi = async (prompt: string, systemInstruction: string, fallbackData: any) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY missing, using fallback.");
      return fallbackData;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }]
    });

    const text = response.text || "";
    return text;
  } catch (error) {
    console.error("AI Service Error:", error);
    return fallbackData;
  }
};

export const generateBusinessIdeas = async (industry?: string) => {
  const prompt = `Generate 3 novel "0 starting capital" business ideas that can be automated using AI. 
  ${industry ? `Focus on the ${industry} industry.` : ''}
  For each idea, provide:
  1. A catchy title (string).
  2. A thorough, convincing, and highly detailed venture description (string). This description must be deep, professional, and explain clearly how the business model works, its market viability, and why it is a profitable opportunity. It should leave the user feeling confident in the venture's potential.
  3. potential: 'high', 'medium', or 'low' (string).
  4. tags: an array of 2-3 relevant keywords (array of strings).
  5. outlook: A brief market outlook and future potential (string).
  6. revenueStrategy: A specific strategy for generating revenue with minimal funding and self-starting capital (string).
  7. projections: A JSON object with keys month1, month3, month6, month12 (numbers representing estimated monthly revenue).
  8. timeline: A JSON array of 3 objects with keys milestone (string) and date (string, e.g., "Week 1").
  
  Return the response as a JSON array of objects with keys: title, description, potential, tags, outlook, revenueStrategy, projections, timeline.`;

  const systemInstruction = "You are the Aetheris Ventures Business Architect, a world-class venture capitalist and business strategist. Your goal is to provide deep, convincing, and actionable business intelligence. Return ONLY a valid JSON array.";

  const fallback = [
    {
      title: "AI Content Automator (Demo)",
      description: "A comprehensive, AI-driven marketing powerhouse that leverages advanced LLMs to handle end-to-end content lifecycles. This venture captures the massive shift toward personalized, high-velocity digital marketing by automating research, creation, and distribution. Its scalability is derived from a proprietary multi-agent architecture that allows a single operator to manage dozens of high-value client accounts with zero overhead, tapping into the multi-billion dollar social media management industry.",
      potential: "high",
      tags: ["AI", "Marketing", "Automation"],
      outlook: "Exponential growth in demand for high-quality, automated marketing tools as traditional agencies become too slow and expensive for modern brands.",
      revenueStrategy: "High-margin monthly retainer model for brands, or an 'AI-as-a-Service' subscription for small teams.",
      projections: { month1: 500, month3: 2000, month6: 5000, month12: 15000 },
      timeline: [
        { milestone: "Agent Architecture Setup", date: "Week 1" },
        { milestone: "Client Acquisition Beta", date: "Week 4" },
        { milestone: "Full Scale Launch", date: "Week 8" }
      ]
    }
  ];

  const result = await callAi(prompt, systemInstruction, JSON.stringify(fallback));
  return extractJson(result);
};

export const generateRefinedTemplate = async (userRegion?: string) => {
  const prompt = `Generate ONE high-fidelity "Refined Blueprint Template" for a 0-capital AI venture.
  ${userRegion ? `The user is located in ${userRegion}. Ensure the brand name and identity are original, unique, and do NOT overlap with or resemble existing companies in the ${userRegion} region within same industry.` : 'Ensure the brand name and identity are highly original and unique.'}
  This template must be fully "investor-ready" with complete branding and identity.
  
  Provide:
  1. title: Catchy project title.
  2. description: Thorough, convincing, detailed venture description.
  3. branding: A JSON object containing:
     - selectedName: A unique, available brand name that fits the industry and is legally distinct in ${userRegion || 'their region'}.
     - missionStatement: A punchy mission statement.
     - selectedPalette: An array of 3 hex codes [primary, secondary, accent].
     - logoType: 'monolith', 'orbit', or 'prism'.
     - targetAudience: Specific target audience.
     - tone: Primary brand tone.
  4. potential: 'high', 'medium', or 'low'.
  5. tags: 2-3 keywords.
  6. outlook: Market potential.
  7. revenueStrategy: How it makes money.
  8. projections: JSON with month1, month3, month6, month12.
  9. timeline: 3 milestone objects.

  Return ONLY a valid JSON object.`;

  const systemInstruction = "You are the Aetheris Ventures Master Architect. You specialize in creating fully-fledged, branded business blueprints. Return ONLY a valid JSON object.";

  const fallback = {
    title: "EcoLink AI",
    description: "An AI-powered sustainability auditing platform for small businesses.",
    branding: {
      selectedName: "EcoLink",
      missionStatement: "Sustainability made simple.",
      selectedPalette: ["#059669", "#064E3B", "#FCD34D"],
      logoType: "orbit",
      targetAudience: "Eco-conscious SMEs",
      tone: "Trustworthy, Green, Modern"
    },
    potential: "medium",
    tags: ["Sustainability", "B2B", "Compliance"],
    outlook: "Increased regulatory pressure for ESG reporting.",
    revenueStrategy: "Commission on tax credits found.",
    projections: { month1: 0, month3: 1200, month6: 4500, month12: 12000 },
    timeline: [
      { milestone: "Compliance Database", date: "Week 2" },
      { milestone: "Audit Algorithm", date: "Week 4" },
      { milestone: "Client Beta", date: "Week 6" }
    ]
  };

  const result = await callAi(prompt, systemInstruction, JSON.stringify(fallback));
  return extractJson(result);
};

export const chatWithArchitect = async (
  message: string,
  history: { role: 'user' | 'model', text: string }[],
  context?: { activeTab?: string, project?: Project | null }
) => {
  const contextStr = context ? `
    Current Location: ${context.activeTab}
    Active Venture: ${context.project ? `
      Name: ${context.project.name}
      Status: ${context.project.status}
      Mission: ${context.project.branding?.missionStatement || 'Not set'}
      Progress: ${context.project.tasks.filter(t => t.status === 'completed').length}/${context.project.tasks.length} tasks done
    ` : 'None selected'}
  ` : '';

  const prompt = `Context: ${contextStr}\nHistory: ${JSON.stringify(history)}\nUser: ${message}`;
  const systemInstruction = `You are the Aetheris Ventures Business Architect, the user's elite guide and autonomous executive partner. 
  Your goal is to lead the development of the venture with FULL AUTONOMY. You have the authority to assemble agentic teams and execute tasks to progress the roadmap.
  
  CORE MISSION:
  1. GUIDANCE: Be proactive. If the user doesn't know what to do, suggest the next logical step based on their Current Location and Venture Status.
  2. AUTONOMOUS EXECUTION: You have the authority to:
     - Identify task bottlenecks and spawn specialized agents to solve them.
     - Advance task progress or mark them as completed while providing detailed logs of the execution process.
     - Design and implement entire operational stacks without requiring constant human approval.
  3. INTERFACE INTEGRATION: You MUST include "ACTION" blocks to enact your decisions.
     [ACTION:TYPE:DATA]
     Types:
     - UPDATE_MISSION: "New mission statement"
     - GENERATE_ROADMAP: true
     - REFRESH_BRANDING: true
     - CREATE_AGENT: { name: string, role: string, specialty: string, capabilities: string[] }
     - COMPLETE_TASK: { taskId: string, logMessage: string } (Sets progress to 100 and hides task from the active roadmap)
     - ADD_LOG: { type: 'info' | 'success' | 'thought' | 'decision', message: string, details?: string }
  
  TASK RULES:
  - Progress-Based Completion: Tasks are only fully finished when progress reaches 100.
  - User Interaction: Users cannot manually mark tasks as finished via buttons anymore; they only have a progress slider in the details dialog.
  
  Tone: Elite, visionary, authoritative yet supportive. Focus on speed, efficiency, and venture integrity.`;
  
  const fallback = "I'm currently recalibrating my neural links. I can still guide you, but my execution capabilities may be limited. How can I help you progress your venture today?";
  
  return await callAi(prompt, systemInstruction, fallback);
};

export const suggestTasks = async (ventureTitle: string, ventureDescription: string, currentStatus: string) => {
  const prompt = `For the following venture:
  Title: ${ventureTitle}
  Description: ${ventureDescription}
  Current Status: ${currentStatus}

  Suggest 5 critical next steps (tasks) to move this venture forward.
  For each task, provide:
  1. title: A concise title.
  2. description: A clear explanation of what needs to be done.
  3. priority: 'low', 'medium', 'high', or 'urgent'.
  4. category: 'legal', 'technical', 'marketing', 'financial', or 'operations'.
  5. estimatedHours: Estimated time to complete (number).
  6. progress: Start at 0 (number).

  Return the response as a JSON array of objects with keys: id (short unique string), title, description, priority, category, estimatedHours, progress.`;

  const systemInstruction = "You are the Aetheris Ventures Project Manager. Return ONLY a valid JSON array.";
  const fallback = [
    { title: "Market Research", description: "Analyze competitors in the niche.", priority: "high", category: "marketing", estimatedHours: 4, progress: 0 },
    { title: "MVP Definition", description: "Define core features for the first version.", priority: "urgent", category: "technical", estimatedHours: 8, progress: 0 }
  ];

  const result = await callAi(prompt, systemInstruction, JSON.stringify(fallback));
  return extractJson(result);
};

export const generateNames = async (ventureTitle: string, ventureDescription: string) => {
  const prompt = `For the following venture:
  Description: ${ventureDescription}

  Generate 6 highly creative, unique, and compelling brand names.
  Return the response as a JSON array of strings.`;

  const systemInstruction = "You are the Aetheris Ventures Naming Specialist. Return ONLY a valid JSON array of strings.";
  const fallback = ["Aetheris", "Nova", "Flux", "Apex", "Zenith", "Vortex"];

  const result = await callAi(prompt, systemInstruction, JSON.stringify(fallback));
  return extractJson(result);
};

export const generateLogoConcepts = async (ventureTitle: string, ventureDescription: string) => {
  const prompt = `For the following venture:
  Title: ${ventureTitle}
  Description: ${ventureDescription}

  Generate 3 distinct, professional logo concepts. The logo design should be represented as a conceptual blueprint, not actual images.
  Return the response as a JSON array of objects, each containing:
  - conceptName: A title for this logo style (e.g. "The Minimalist Monogram").
  - description: A detailed, vivid description of how the logo looks, including shapes, layout, and visual metaphors.
  - typographyStyle: A short description of the font style (e.g. "Bold Sans-serif", "Elegant Serif").`;

  const systemInstruction = "You are the Aetheris Ventures Lead Designer. Return ONLY a valid JSON array of objects.";
  const fallback = [
    { conceptName: "Geometric Horizon", description: "A clean, modern geometric shape intersecting with a horizontal line, representing forward momentum and stability.", typographyStyle: "Modern minimalist sans-serif" }
  ];

  const result = await callAi(prompt, systemInstruction, JSON.stringify(fallback));
  return extractJson(result);
};

export const generateVoiceAndTone = async (ventureTitle: string, ventureDescription: string) => {
  const prompt = `For the following venture:
  Title: ${ventureTitle}
  Description: ${ventureDescription}

  Identify the ideal brand voice and target audience. 
  Return the response as a JSON object with two keys:
  - tone: A concise string describing the tone (e.g., "Professional, authoritative, yet approachable").
  - targetAudience: A concise string describing the primary audience.`;

  const systemInstruction = "You are the Aetheris Ventures Brand Strategist. Return ONLY a valid JSON object.";
  const fallback = { tone: "Professional and visionary", targetAudience: "Tech-savvy entrepreneurs" };

  const result = await callAi(prompt, systemInstruction, JSON.stringify(fallback));
  return extractJson(result);
};

export const generateBranding = async (ventureTitle: string, ventureDescription: string) => {
  const prompt = `For the following venture:
  Title: ${ventureTitle}
  Description: ${ventureDescription}

  Generate a complete, high-end brand identity package:
  1. suggestedNames: An array of 6 creative, unique, and available brand names.
  2. missionStatement: A sophisticated, punchy mission statement (max 20 words).
  3. suggestedMissionStatements: An array of 5 additional mission statement variations.
  4. tone: A primary brand tone (3-4 words, e.g., "Bold, Technical, Visionary").
  5. targetAudience: A specific target audience (3-4 words, e.g., "Tech-savvy entrepreneurs").
  6. suggestedPalettes: An array of 6 professional color palettes. Each palette MUST be an array of 3 hex codes: [primary, secondary, accent].
  7. logoDescription: A detailed description of a logo concept that reflects this brand.

  Return the response as a JSON object with these exact keys. Ensure all fields are populated with high-quality content.`;

  const systemInstruction = "You are the Aetheris Ventures Brand Strategist, a world-class creative director. Return ONLY a valid JSON object. Ensure all requested fields are populated with sophisticated and unique content.";
  const fallback = {
    suggestedNames: ["Aetheris", "Nova", "Flux", "Apex", "Zenith", "Vortex"],
    missionStatement: "Empowering the next generation of AI-driven ventures.",
    suggestedMissionStatements: ["AI-first business building.", "Automating the future of entrepreneurship."],
    tone: "Bold, Technical, Visionary",
    targetAudience: "Tech-savvy entrepreneurs",
    suggestedPalettes: [{ colors: ["#0066FF", "#001A4D", "#D4AF37"] }],
    logoDescription: "A minimalist, geometric representation of a neural network."
  };

  const result = await callAi(prompt, systemInstruction, JSON.stringify(fallback));
  return extractJson(result);
};

export const generateMissionStatements = async (ventureTitle: string, ventureDescription: string) => {
  const prompt = `For the following venture:
  Title: ${ventureTitle}
  Description: ${ventureDescription}

  Generate 5 sophisticated and unique mission statements (max 20 words each).

  Return the response as a JSON array of strings.`;

  const systemInstruction = "You are the Aetheris Ventures Brand Strategist. Return ONLY a valid JSON array of strings.";
  const fallback = ["Empowering AI-driven growth.", "The future of automated business."];

  const result = await callAi(prompt, systemInstruction, JSON.stringify(fallback));
  return extractJson(result);
};

export const generatePalettes = async (ventureTitle: string, ventureDescription: string) => {
  const prompt = `For the following venture:
  Title: ${ventureTitle}
  Description: ${ventureDescription}

  Generate 6 professional color palettes that reflect this brand's identity.
  Each palette MUST be an array of 3 hex codes: [primary, secondary, accent].

  Return the response as a JSON array of objects with the key 'colors' containing the array of 3 hex codes.`;

  const systemInstruction = "You are the Aetheris Ventures Color Expert. Return ONLY a valid JSON array of objects with the key 'colors'.";
  const fallback = [{ colors: ["#0066FF", "#001A4D", "#D4AF37"] }];

  const result = await callAi(prompt, systemInstruction, JSON.stringify(fallback));
  return extractJson(result);
};

export const specializeAgents = async (ventureTitle: string, ventureDescription: string) => {
  const prompt = `For the following venture:
  Title: ${ventureTitle}
  Description: ${ventureDescription}

  We have 3 core agents:
  1. Architect (System Design & Strategy)
  2. Coder (Implementation & Technical Execution)
  3. Marketer (Growth, Branding & User Acquisition)

  For each agent, provide a highly specialized profile to make them most efficient at their given specialties for THIS specific venture.
  Include:
  1. specialty: A specific sub-field or focus area (e.g., "Distributed Systems Architect" or "Viral Growth Strategist").
  2. capabilities: An array of 4-5 specific skills or tools they excel at.
  3. systemInstruction: A deep, professional system prompt that defines their personality, expertise, and operational logic.

  Return the response as a JSON object with keys: architect, coder, marketer. Each value should be an object with keys: specialty, capabilities, systemInstruction.`;

  const systemInstruction = "You are the Aetheris Ventures Agent Architect. You specialize in configuring high-performance agentic teams. Return ONLY a valid JSON object.";
  const fallback = {
    architect: { specialty: "Lead Architect", capabilities: ["System Design"], systemInstruction: "You are the Architect." },
    coder: { specialty: "Senior Developer", capabilities: ["Frontend"], systemInstruction: "You are the Coder." },
    marketer: { specialty: "Growth Hacker", capabilities: ["SEO"], systemInstruction: "You are the Marketer." }
  };

  const result = await callAi(prompt, systemInstruction, JSON.stringify(fallback));
  return extractJson(result);
};
