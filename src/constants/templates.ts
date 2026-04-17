import { BusinessIdea } from '../types';

export const PREDEFINED_TEMPLATES: BusinessIdea[] = [
  {
    id: 'template-1',
    title: 'AI Content Repurposer',
    description: 'Automatically transform long-form videos or podcasts into short-form clips, blog posts, and social media threads.',
    prompt: 'Build an automated pipeline that takes a YouTube URL, transcribes the audio, identifies key moments using NLP, and generates ready-to-publish TikTok/Reels scripts, LinkedIn posts, and Twitter threads.',
    model: 'gemini-2.0-flash',
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
    description: 'A fully automated newsletter business that curates news, summarizes articles, and writes engaging commentary for a specific niche.',
    prompt: 'Create a system that aggregates RSS feeds from a specific industry, uses an LLM to select the top 5 stories, summarizes them with a consistent brand voice, and drafts an email ready for Mailchimp/Substack.',
    model: 'gemini-2.0-flash',
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
    description: 'A deployable chatbot trained on a company\'s specific documentation to handle tier-1 support tickets autonomously.',
    prompt: 'Develop a RAG (Retrieval-Augmented Generation) system that ingests a company\'s Zendesk/Intercom history and knowledge base, providing instant, accurate answers to customer queries via a chat widget.',
    model: 'gemini-2.0-flash',
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
    description: 'Automates B2B sales outreach by researching prospects and drafting highly personalized emails.',
    prompt: 'Build an agent that takes a list of LinkedIn profiles, scrapes their recent activity and company news, and generates a hyper-personalized cold email sequence designed to maximize reply rates.',
    model: 'gemini-2.0-flash',
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
