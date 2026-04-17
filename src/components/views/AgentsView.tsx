import React from 'react';
import { motion } from 'motion/react';
import { Project } from '../../types';
import { AgentCard } from '../AgentCard';

interface AgentsViewProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

export default function AgentsView({ projects, setProjects }: AgentsViewProps) {
  return (
    <motion.div
      key="agents"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.length > 0 ? projects.flatMap(p => p.agents.map(agent => (
          <AgentCard 
            key={`${p.id}-${agent.id}`} 
            agent={agent} 
            projectId={p.id} 
            projects={projects} 
            setProjects={setProjects} 
          />
        ))) : (
          <div className="col-span-3 text-center py-20 text-muted-foreground">
            No active agents. Initiate a project to see your agent stack.
          </div>
        )}
      </div>
    </motion.div>
  );
}
