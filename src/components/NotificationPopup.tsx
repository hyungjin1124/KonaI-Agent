'use client';

import React from 'react';

import { X, Check, AlertTriangle, Info, AlertCircle } from './icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotification, Anomaly } from '../context/NotificationContext';

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (anomaly: Anomaly) => void;
}

function getIcon(type: string): React.ReactNode {
  switch (type) {
    case 'critical':
      return <AlertCircle size={16} className="text-[#FF3C42]" />;
    case 'warning':
      return <AlertTriangle size={16} className="text-amber-500" />;
    default:
      return <Info size={16} className="text-blue-500" />;
  }
}

function getIconBackground(type: string): string {
  switch (type) {
    case 'critical':
      return 'bg-red-50';
    case 'warning':
      return 'bg-amber-50';
    default:
      return 'bg-blue-50';
  }
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ isOpen, onClose, onNavigate }) => {
  const { anomalies, markAsRead, markAllAsRead } = useNotification();

  if (!isOpen) return null;

  function handleItemClick(anomaly: Anomaly): void {
    markAsRead(anomaly.id);
    onNavigate(anomaly);
    onClose();
  }

  return (
    <Card
      data-testid="notification-popup"
      className="absolute top-16 right-6 w-96 shadow-2xl z-50 animate-fade-in-up overflow-hidden border-gray-200 p-0"
    >
      <CardHeader className="px-4 py-3 flex-row justify-between items-center bg-gray-50/80 backdrop-blur-sm space-y-0">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          알림 센터
          {anomalies.some(a => !a.isRead) && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3C42]" />
          )}
        </h3>
        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-[10px] text-gray-500 hover:text-[#FF3C42] font-medium h-auto px-1 py-0"
          >
            모두 읽음
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 h-6 w-6"
          >
            <X size={14} />
          </Button>
        </div>
      </CardHeader>

      <Separator className="bg-gray-100" />

      <CardContent className="p-0">
        <ScrollArea className="max-h-[400px]">
          {anomalies.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              새로운 알림이 없습니다.
            </div>
          ) : (
            anomalies.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-4 border-b border-gray-50 hover:bg-blue-50/50 transition-colors cursor-pointer group relative ${
                  !item.isRead ? 'bg-white' : 'bg-gray-50/30'
                }`}
              >
                {/* Unread Indicator */}
                {!item.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF3C42]" />
                )}

                <div className="flex gap-3">
                  <div className={`mt-0.5 p-1.5 rounded-lg h-fit shrink-0 ${getIconBackground(item.type)}`}>
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm font-bold truncate ${!item.isRead ? 'text-gray-900' : 'text-gray-500'}`}>
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1 shrink-0">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-snug mb-2 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="px-1.5 py-0.5 rounded border-gray-200 text-[10px] font-medium text-gray-500 bg-white"
                      >
                        {item.metric}
                      </Badge>
                      <span className="text-[10px] text-[#FF3C42] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-auto">
                        분석 보기 <Check size={10} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default NotificationPopup;
