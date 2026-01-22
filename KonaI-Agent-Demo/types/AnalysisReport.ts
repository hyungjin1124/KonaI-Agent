
export interface KeyMetric {
  label: string;
  value: string;
  change: string; // e.g., "+13.5%"
  trend: 'up' | 'down' | 'neutral';
  impact: 'positive' | 'negative' | 'neutral';
}

export interface GrowthDriver {
  name: string;
  contribution: number; // Percentage contribution to total growth
  description: string;
  sustainability: 'High' | 'Medium' | 'Low';
}

export interface StrategicRecommendation {
  id: string;
  title: string;
  description: string;
  expectedImpact: string; // e.g., "영업이익 +5억"
  timeline: string; // e.g., "3개월 내"
  riskLevel: 'High' | 'Medium' | 'Low';
  actionItems: string[];
}

export interface ExecutiveAnalysisReport {
  title: string;
  summary: string;
  metrics: KeyMetric[];
  growthDrivers: GrowthDriver[];
  costEfficiency: {
    currentRatio: number;
    targetRatio: number;
    improvement: number; // percentage points
    analysis: string;
  };
  recommendations: StrategicRecommendation[];
  visualizationReferences: string[]; // IDs of widgets in the right panel
}
