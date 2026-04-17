/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const extractJson = (raw: string) => {
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
    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, systemInstruction }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed with status ${response.status}`);
    }

    const data = await response.json();
    const text = data.text || "";
    
    if (text.includes("Demo Mode:")) {
      console.log("AI in Demo Mode, using fallback data.");
      return fallbackData;
    }
    
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
  2. A detailed description (string).
  3. A high-quality, advanced prompt to feed into an AI to build the core of this business (string).
  4. A recommended AI model (e.g., gemini-2.0-flash) (string).
  5. potential: 'high', 'medium', or 'low' (string).
  6. tags: an array of 2-3 relevant keywords (array of strings).
  7. outlook: A brief market outlook and future potential (string).
  8. revenueStrategy: A specific strategy for generating revenue with minimal funding and self-starting capital (string).
  9. projections: A JSON object with keys month1, month3, month6, month12 (numbers representing estimated monthly revenue).
  10. timeline: A JSON array of 3 objects with keys milestone (string) and date (string, e.g., "Week 1").
  
  Return the response as a JSON array of objects with keys: title, description, prompt, model, potential, tags, outlook, revenueStrategy, projections, timeline.`;

  const systemInstruction = "You are the Aetheris Ventures Business Architect. Return ONLY a valid JSON array.";

  const fallback = [
    {
      title: "AI Content Automator (Demo)",
      description: "A platform that automatically generates and schedules social media content using AI.",
      prompt: "Build a content automation engine...",
      model: "gemini-2.0-flash",
      potential: "high",
      tags: ["AI", "Marketing"],
      outlook: "Growing demand for automated marketing tools.",
      revenueStrategy: "Subscription-based model.",
      projections: { month1: 500, month3: 2000, month6: 5000, month12: 15000 },
      timeline: [
        { milestone: "MVP Development", date: "Week 2" },
        { milestone: "Beta Testing", date: "Week 4" },
        { milestone: "Public Launch", date: "Week 6" }
      ]
    }
  ];

  const result = await callAi(prompt, systemInstruction, JSON.stringify(fallback));
  return extractJson(result);
};

export const chatWithArchitect = async (
  message: string,
  history: { role: 'user' | 'model', text: string }[]
) => {
  const prompt = `History: ${JSON.stringify(history)}\nUser: ${message}`;
  const systemInstruction = "You are the Aetheris Ventures Business Architect, a genius money-making guru. Your goal is to help users brainstorm and refine 0-capital, AI-automated business ideas. Be bold, visionary, and highly practical. Use advanced prompt engineering concepts in your suggestions.";
  const fallback = "I'm currently in Demo Mode. I can still help you brainstorm, but my responses might be a bit more limited. What's on your mind?";
  
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

  Return the response as a JSON array of objects with keys: title, description, priority, category, estimatedHours, progress.`;

  const systemInstruction = "You are the Aetheris Ventures Project Manager. Return ONLY a valid JSON array.";
  const fallback = [
    { title: "Market Research", description: "Analyze competitors in the niche.", priority: "high", category: "marketing", estimatedHours: 4, progress: 0 },
    { title: "MVP Definition", description: "Define core features for the first version.", priority: "urgent", category: "technical", estimatedHours: 8, progress: 0 }
  ];

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
    suggestedPalettes: [["#0066FF", "#001A4D", "#D4AF37"]],
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

  Return the response as a JSON array of arrays of strings.`;

  const systemInstruction = "You are the Aetheris Ventures Color Expert. Return ONLY a valid JSON array of arrays.";
  const fallback = [["#0066FF", "#001A4D", "#D4AF37"]];

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
