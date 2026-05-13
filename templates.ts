import { BusinessIdea } from '../types';

export const PREDEFINED_TEMPLATES: BusinessIdea[] = [
  {
    id: 'template-1',
    title: 'AI Content Repurposer',
    description: 'A sophisticated automation engine that dismantles the traditional content creation bottleneck. This venture employs advanced NLP and multi-modal AI to automatically transform long-form legacy content into a high-frequency digital dominance strategy. By intelligently identifying virality markers in videos and podcasts, it generates a full ecosystem of TikToks, blog posts, and viral threads. This model captures the massive demand from creators looking to scale without increasing headcount, offering a high-margin service in a $20B creator economy market.',
    branding: {
      selectedName: 'ViralFlow',
      missionStatement: 'Transforming legacy content into digital dominance.',
      selectedPalette: ['#3b82f6', '#1d4ed8', '#f59e0b'],
      logoType: 'monolith',
      targetAudience: 'Digital Creators',
      tone: 'Dynamic, Professional, Sharp'
    },
    potential: 'high',
    tags: ['Content Creation', 'Social Media', 'Automation'],
    outlook: 'High demand for content scaling tools among creators and agencies.',
    revenueStrategy: 'Tiered subscription based on minutes processed or number of outputs generated.',
    projections: { month1: 200, month3: 1500, month6: 5000, month12: 15000 },
    timeline: [
      { milestone: 'Core Transcription API', date: 'Week 1' },
      { milestone: 'Content Generation Logic', date: 'Week 2' },
      { milestone: 'User Dashboard & Billing', date: 'Week 4' }
    ]
  },
  {
    id: 'template-2',
    title: 'Niche Newsletter Generator',
    description: 'A fully autonomous media enterprise that synthesizes real-time industry intelligence into high-value curated newsletters. This venture bypasses the labor-intensive editorial process by utilizing AI agents to scout, summarize, and add expert-level commentary to niche news. In an age of information overload, this model provides the essential "signal" that professionals are willing to pay for. It scales effortlessly across multiple industries, creating a portfolio of digital assets that generate compounding recurring revenue through sponsorships and premium analyst tiers.',
    branding: {
      selectedName: 'SignalStream',
      missionStatement: 'Delivering clear insights in a world of digital noise.',
      selectedPalette: ['#10b981', '#064e3b', '#6ee7b7'],
      logoType: 'orbit',
      targetAudience: 'Niche Professionals',
      tone: 'Informed, Precise, Elegant'
    },
    potential: 'medium',
    tags: ['Media', 'Newsletter', 'Curation'],
    outlook: 'Growing appetite for highly specialized, curated information.',
    revenueStrategy: 'Sponsorships and premium paid tiers for deep-dive analysis.',
    projections: { month1: 0, month3: 500, month6: 2000, month12: 8000 },
    timeline: [
      { milestone: 'RSS Aggregation Engine', date: 'Week 1' },
      { milestone: 'LLM Summarization Pipeline', date: 'Week 2' },
      { milestone: 'Email Platform Integration', date: 'Week 3' }
    ]
  },
  {
    id: 'template-3',
    title: 'AI Customer Support Agent',
    description: 'A robust B2B SaaS venture that deploys high-intelligence virtual agents trained on complex corporate documentation. Unlike simple chatbots, this system uses RAG (Retrieval-Augmented Generation) to handle tier-1 support with human-level accuracy and zero latency. By drastically reducing support overhead for SMEs and enterprise clients, it offers an undeniable ROI. This venture targets the critical pain point of support scalability, allowing businesses to grow their user base without linear increases in staffing costs.',
    branding: {
      selectedName: 'NovaSupport',
      missionStatement: 'Zero-latency support with human-level intelligence.',
      selectedPalette: ['#6366f1', '#312e81', '#a5b4fc'],
      logoType: 'prism',
      targetAudience: 'High-Growth Startups',
      tone: 'Reliable, Intelligent, Fluent'
    },
    potential: 'high',
    tags: ['B2B', 'Customer Support', 'RAG'],
    outlook: 'Massive B2B market looking to reduce support overhead.',
    revenueStrategy: 'Per-seat or per-resolution pricing model.',
    projections: { month1: 1000, month3: 4000, month6: 12000, month12: 40000 },
    timeline: [
      { milestone: 'Knowledge Base Ingestion', date: 'Week 2' },
      { milestone: 'RAG Pipeline Optimization', date: 'Week 4' },
      { milestone: 'Widget & API Integration', date: 'Week 6' }
    ]
  },
  {
    id: 'template-4',
    title: 'Personalized Cold Outreach Bot',
    description: 'A revenue-acceleration platform that automates the most difficult part of the sales cycle: high-relevance personalized outreach. This venture uses AI researchers to crawl LinkedIn activity, company news, and quarterly reports to draft hyper-persuasive, bespoke email sequences. By achieving reply rates that dwarf traditional mass-mailing, it becomes an essential tool for high-growth sales teams. The zero-capital nature of this model relies on API-driven research and sending, allowing for massive scalability with minimal operational complexity.',
    branding: {
      selectedName: 'DirectReach AI',
      missionStatement: 'Bespoke outreach that converts strangers into clients.',
      selectedPalette: ['#f43f5e', '#881337', '#fb7185'],
      logoType: 'monolith',
      targetAudience: 'Enterprise Sales Teams',
      tone: 'Persuasive, Bold, Direct'
    },
    potential: 'high',
    tags: ['Sales', 'B2B', 'Lead Gen'],
    outlook: 'Sales teams are constantly seeking tools to improve outreach conversion rates.',
    revenueStrategy: 'Monthly SaaS subscription based on volume of leads processed.',
    projections: { month1: 500, month3: 3000, month6: 10000, month12: 30000 },
    timeline: [
      { milestone: 'Data Scraping Integration', date: 'Week 1' },
      { milestone: 'Personalization Engine', date: 'Week 3' },
      { milestone: 'Email Sending API', date: 'Week 4' }
    ]
  }
];
