import { Project, BusinessIdea } from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'AutoSaaS Generator',
    description: 'Autonomous micro-SaaS deployment engine for niche markets.',
    status: 'scaling',
    revenue: 0,
    growth: 0,
    createdAt: new Date().toISOString(),
    agents: [
      { id: 'a1', name: 'Architect', role: 'Visionary & Strategy', status: 'idle', archetype: 'architect', debugMode: true },
      { id: 'a2', name: 'Coder', role: 'Implementation', status: 'working', currentTask: 'Optimizing deployment pipeline', archetype: 'automator' },
      { id: 'a3', name: 'Marketer', role: 'Growth', status: 'working', currentTask: 'A/B testing ad copy', archetype: 'copywriter' }
    ],
    tasks: [
      { 
        id: 't1', 
        title: 'Niche Analysis', 
        description: 'Scan SEO data for opportunities', 
        status: 'completed',
        priority: 'high',
        category: 'marketing',
        progress: 100
      },
      { 
        id: 't2', 
        title: 'MVP Generation', 
        description: 'Generate core logic for the tool', 
        status: 'completed',
        priority: 'urgent',
        category: 'technical',
        progress: 100
      },
      { 
        id: 't3', 
        title: 'Scaling Strategy', 
        description: 'Automate user acquisition', 
        status: 'in-progress',
        priority: 'medium',
        category: 'operations',
        progress: 45
      }
    ],
    logs: [
      { id: 'l1', timestamp: new Date().toISOString(), type: 'success', message: 'Niche identified: "AI Resume Optimizer for Nurses"' },
      { id: 'l2', timestamp: new Date().toISOString(), type: 'info', message: 'Agent Coder initiated deployment to Cloud Run' },
      { id: 'l3', timestamp: new Date().toISOString(), type: 'thought', agentId: 'a1', message: 'Analyzing market saturation for nurse-specific tools...', details: 'Found 12 competitors, but none use agentic AI for real-time tailoring.' },
      { id: 'l4', timestamp: new Date().toISOString(), type: 'decision', agentId: 'a1', message: 'Pivoting focus to "Real-time Interview Coach" for nurses.', details: 'Higher LTV and lower churn predicted based on current job market trends.' }
    ]
  },
  {
    id: '2',
    name: 'AI Customer Support Agent',
    description: 'A deployable chatbot trained on a company\'s specific documentation to handle tier-1 support tickets autonomously.',
    status: 'building',
    revenue: 0,
    growth: 0,
    createdAt: new Date().toISOString(),
    agents: [
      { id: 'a4', name: 'Architect', role: 'Visionary & Strategy', status: 'idle', archetype: 'architect', debugMode: true },
      { id: 'a5', name: 'Data Engineer', role: 'Data Extraction', status: 'working', currentTask: 'Ingesting knowledge base', archetype: 'scraper' },
      { id: 'a6', name: 'Integrator', role: 'Integration', status: 'idle', currentTask: 'Awaiting data pipeline', archetype: 'automator' }
    ],
    tasks: [
      { 
        id: 't4', 
        title: 'Knowledge Base Ingestion', 
        description: 'Set up vector database and document loaders', 
        status: 'in-progress',
        priority: 'high',
        category: 'technical',
        progress: 60
      },
      { 
        id: 't5', 
        title: 'RAG Pipeline Optimization', 
        description: 'Tune retrieval parameters for accuracy', 
        status: 'pending',
        priority: 'medium',
        category: 'technical',
        progress: 0
      },
      { 
        id: 't6', 
        title: 'Widget & API Integration', 
        description: 'Build embeddable chat UI', 
        status: 'pending',
        priority: 'medium',
        category: 'operations',
        progress: 0
      }
    ],
    logs: [
      { id: 'l5', timestamp: new Date().toISOString(), type: 'info', message: 'Project initialized: AI Customer Support Agent' },
      { id: 'l6', timestamp: new Date().toISOString(), type: 'thought', agentId: 'a4', message: 'Determining optimal chunking strategy for Zendesk articles.', details: 'Recursive character text splitting with 1000 chunk size and 200 overlap seems best.' },
      { id: 'l7', timestamp: new Date().toISOString(), type: 'success', message: 'Vector database provisioned successfully.' }
    ]
  }
];

export const REVENUE_DATA = [
  { name: 'Mon', value: 0 },
  { name: 'Tue', value: 0 },
  { name: 'Wed', value: 0 },
  { name: 'Thu', value: 0 },
  { name: 'Fri', value: 0 },
  { name: 'Sat', value: 0 },
  { name: 'Sun', value: 0 },
];

export const ARCHETYPES = [
  { id: 'architect', name: 'The Architect', role: 'Visionary & Strategy', description: 'High-level business logic and system architecture.' },
  { id: 'scraper', name: 'The Scraper', role: 'Data Extraction', description: 'Specialized in web scraping and data processing.' },
  { id: 'copywriter', name: 'The Copywriter', role: 'Marketing & Content', description: 'Optimized for conversion and brand voice.' },
  { id: 'automator', name: 'The Automator', role: 'Integration', description: 'Expert in connecting APIs and workflows.' },
  { id: 'researcher', name: 'The Researcher', role: 'Market Intelligence', description: 'Deep dives into niche trends and competitor moves.' },
  { id: 'optimizer', name: 'The Optimizer', role: 'Efficiency Expert', description: 'Refines prompts and code for maximum performance.' },
  { id: 'growth-hacker', name: 'Growth Hacker', role: 'Viral Marketing', description: 'Specialized in low-cost, high-impact user acquisition.' },
];

export const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", 
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", 
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", 
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", 
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
] as const;

export type USState = typeof US_STATES[number];
