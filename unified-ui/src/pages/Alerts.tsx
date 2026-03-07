import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Alert {
  id: string;
  provider: string;
  accountId: string;
  metricName: string;
  currentValue: number;
  threshold: number;
  level: 'WARNING' | 'CRITICAL' | 'STOPPED';
  message: string;
  sentAt: string;
}

export default function Alerts() {
  const { isAuthenticated } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'WARNING' | 'CRITICAL' | 'STOPPED'>('all');

  useEffect(() => {
    if (!isAuthenticated) return;
    loadAlerts();
  }, [isAuthenticated]);

  const loadAlerts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/usage/alerts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to load alerts');
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
      alert('加载告警记录失败');
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'WARNING':
        return 'bg-yellow-500/10 text-yellow-900 border-yellow-700';
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-900 border-red-700';
      case 'STOPPED':
        return 'bg-gray-500/10 text-gray-900 border-gray-700';
      default:
        return 'bg-green-500/10 text-green-900 border-green-700';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'WARNING':
        return <AlertTriangle className="h-5 w-5" />;
      case 'CRITICAL':
        return <AlertTriangle className="h-5 w-5" />;
      case 'STOPPED':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <CheckCircle className="h-5 w-5" />;
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true;
    return alert.level === filter;
  });

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground-primary mb-4">
          告警记录
        </h1>
        <p className="text-foreground-secondary">请先登录</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground-primary mb-4">
        告警记录
      </h1>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-accent text-white'
              : 'hover:bg-background-muted'
          }`}
        >
          全部
        </button>
        <button
          onClick={() => setFilter('WARNING')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'WARNING'
              ? 'bg-yellow-500 text-white'
              : 'hover:bg-background-muted'
          }`}
        >
          警告
        </button>
        <button
          onClick={() => setFilter('CRITICAL')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'CRITICAL'
              ? 'bg-red-500 text-white'
              : 'hover:bg-background-muted'
          }`}
        >
          严重
        </button>
        <button
          onClick={() => setFilter('STOPPED')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'STOPPED'
              ? 'bg-gray-500 text-white'
              : 'hover:bg-background-muted'
          }`}
        >
          已停止
        </button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-foreground-accent border-t-transparent"></div>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="text-center py-12 text-foreground-secondary">
          暂无告警记录
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className={`rounded-xl border p-6 ${getLevelColor(alert.level)}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getLevelIcon(alert.level)}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground-primary">
                      {alert.provider} - {alert.accountId}
                    </h3>
                    <p className="text-sm text-foreground-secondary">
                      {alert.metricName}: {alert.currentValue} / {alert.threshold}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-foreground-secondary">
                    {new Date(alert.sentAt).toLocaleString()}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    alert.level === 'CRITICAL'
                      ? 'bg-red-900 text-white'
                      : 'bg-yellow-900 text-white'
                  }`}>
                    {alert.level}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-border-color pt-4">
                <h4 className="text-sm font-medium text-foreground-primary mb-2">
                  告警信息
                </h4>
                <p className="text-sm text-foreground-secondary">
                  {alert.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}