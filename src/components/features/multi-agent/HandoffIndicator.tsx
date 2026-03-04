import React from 'react';
import { ArrowRight } from 'lucide-react';
import { AgentDefinition, HandoffEvent } from './types';

interface HandoffIndicatorProps {
  handoff: HandoffEvent;
  agents: Record<string, AgentDefinition>;
}

export const HandoffIndicator: React.FC<HandoffIndicatorProps> = ({
  handoff,
  agents,
}) => {
  const fromAgent = agents[handoff.fromAgentId];
  const toAgent = agents[handoff.toAgentId];

  if (!fromAgent || !toAgent) return null;

  return (
    <div
      data-testid={`handoff-${handoff.id}`}
      className="flex items-center gap-2 px-3 py-2 mx-2 my-1 bg-amber-50 border border-amber-200 rounded-lg animate-fade-in-up"
    >
      <span className="text-sm">{fromAgent.icon}</span>
      <ArrowRight className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
      <span className="text-sm">{toAgent.icon}</span>
      <span className="text-xs text-amber-700 truncate">{handoff.reason}</span>
    </div>
  );
};

export default HandoffIndicator;
