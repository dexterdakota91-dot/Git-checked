/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProjectStatus = 'ideation' | 'architecting' | 'building' | 'testing' | 'deployed' | 'scaling';

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'working' | 'busy' | 'completed' | 'error' | 'waiting-for-input' | 'thinking';
  currentTask?: string;
  avatar?: string;
  archetype?: string;
  debugMode?: boolean;
  specialty?: string;
  capabilities?: string[];
  systemInstruction?: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskCategory = 'legal' | 'technical' | 'marketing' | 'financial' | 'operations';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: TaskPriority;
  category: TaskCategory;
  assignedTo?: string;
  completedAt?: string;
  dueDate?: string;
  estimatedHours?: number;
  progress: number;
  tags?: string[];
  dependencies?: string[];
  prerequisites?: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  revenue: number;
  growth: number;
  healthScore?: number;
  agents: Agent[];
  tasks: Task[];
  logs: LogEntry[];
  createdAt: string;
  isAutonomous?: boolean;
  outlook?: string;
  revenueStrategy?: string;
  projections?: {
    month1: number;
    month3: number;
    month6: number;
    month12: number;
  };
  timeline?: {
    milestone: string;
    date: string;
    status: 'pending' | 'completed';
  }[];
  branding?: {
    logoType?: 'monolith' | 'orbit' | 'prism';
    suggestedNames?: string[];
    selectedName?: string;
    missionStatement?: string;
    suggestedMissionStatements?: string[];
    tone?: string;
    targetAudience?: string;
    suggestedPalettes?: Array<{ colors: string[] }>;
    selectedPalette?: string[];
    logoDescription?: string;
  };
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'thought' | 'decision';
  message: string;
  agentId?: string;
  details?: string;
}

export interface BusinessIdea {
  id: string;
  title: string;
  description: string;
  potential: 'high' | 'medium' | 'low';
  tags: string[];
  outlook?: string;
  revenueStrategy?: string;
  projections?: {
    month1: number;
    month3: number;
    month6: number;
    month12: number;
  };
  timeline?: {
    milestone: string;
    date: string;
  }[];
  branding?: Project['branding'];
}
