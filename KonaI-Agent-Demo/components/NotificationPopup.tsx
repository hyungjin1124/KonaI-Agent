
import React from 'react';
import { X, Check, AlertTriangle, Info, AlertCircle, Clock } from 'lucide-react';
import { useNotification, Anomaly } from '../context/NotificationContext';

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (anomaly: Anomaly) => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ isOpen, onClose, onNavigate }) => {
  const { anomalies, markAsRead, markAllAsRead } = useNotification();

  if (!isOpen) return null;

  const handleItemClick = (anomaly: Anomaly) => {
    markAsRead(anomaly.id);
    onNavigate(anomaly);
    onClose();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle size={16} className="text-[#FF3C42]" />;
      case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <div data-testid="notification-popup" className="absolute top-16 right-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-fade-in-up overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur-sm">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          알림 센터
          {anomalies.some(a => !a.isRead) && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3C42]"></span>
          )}
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={markAllAsRead} 
            className="text-[10px] text-gray-500 hover:text-[#FF3C42] font-medium transition-colors"
          >
            모두 읽음
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
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
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF3C42]"></div>
              )}
              
              <div className="flex gap-3">
                <div className={`mt-0.5 p-1.5 rounded-lg h-fit shrink-0 ${
                  item.type === 'critical' ? 'bg-red-50' : item.type === 'warning' ? 'bg-amber-50' : 'bg-blue-50'
                }`}>
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
                    <span className="px-1.5 py-0.5 rounded border border-gray-200 text-[10px] font-medium text-gray-500 bg-white">
                      {item.metric}
                    </span>
                    <span className="text-[10px] text-[#FF3C42] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-auto">
                      분석 보기 <Check size={10} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPopup;
