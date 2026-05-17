import React from 'react';
import { motion } from 'motion/react';
import { Project } from '../../types';
import { AgentCard } from '../AgentCard';
import { useStore } from '../../store/useStore';

interface AgentsViewProps {
  selectedProject?: Project | null;
}

/**
 * Render the Agents section for an optional selected project.
 *
 * If `selectedProject` exists and has agents, renders an AgentCard for each agent in a responsive grid;
 * otherwise renders a centered empty-state message.
 *
 * @param selectedProject - The project whose agents should be displayed; may be `undefined` or `null`.
 * @returns A React element containing the agents grid or an empty-state message.
 */
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
