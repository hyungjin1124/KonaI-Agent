import React from 'react';

interface MultiAgentScenarioRendererProps {
  scenarioId: string;
}

export const MultiAgentScenarioRenderer: React.FC<MultiAgentScenarioRendererProps> = ({
  scenarioId,
}) => {
  return (
    <div className="p-4 text-sm text-gray-500">
      Multi-Agent Scenario: {scenarioId} (구현 예정)
    </div>
  );
};
