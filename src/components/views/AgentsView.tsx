import React from 'react';
import { motion } from 'motion/react';
import { Project } from '../../types';
import { AgentCard } from '../AgentCard';
import { useStore } from '../../store/useStore';

interface AgentsViewProps {
  selectedProject?: Project | null;
}

export default function AgentsView({ selectedProject }: AgentsViewProps) {
  const { projects, setProjects } = useStore();

  return (
    <motion.div
      key="agents"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {selectedProject && selectedProject.agents.length > 0 ? selectedProject.agents.map(agent => (
          <AgentCard 
            key={`${selectedProject.id}-${agent.id}`} 
            agent={agent} 
            projectId={selectedProject.id} 
            projects={projects} 
            setProjects={setProjects} 
          />
        )) : (
          <div className="col-span-3 text-center py-20 text-muted-foreground">
            No active agents. Initiate a project to see your agent stack.
          </div>
        )}
      </div>
    </motion.div>
  );
}
