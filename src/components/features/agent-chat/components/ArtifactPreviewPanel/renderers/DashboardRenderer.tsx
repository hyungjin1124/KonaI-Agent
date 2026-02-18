import React from 'react';

export interface DashboardRendererProps {
  dashboardComponent?: React.ReactNode;
}

export const DashboardRenderer: React.FC<DashboardRendererProps> = ({
  dashboardComponent,
}) => {
  if (dashboardComponent) {
    return <>{dashboardComponent}</>;
  }

  return (
    <div className="flex-1 flex items-center justify-center text-gray-400">
      <p>대시보드를 불러오는 중...</p>
    </div>
  );
};

export default DashboardRenderer;
