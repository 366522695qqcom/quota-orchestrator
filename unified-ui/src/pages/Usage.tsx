import { useState, useEffect } from 'react';
import { Activity, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UsageData {
  provider: string;
  accountId: string;
  totalQuota: number;
  usedQuota: number;
  percentage: number;
  periodStart: string;
  periodEnd: string;
}

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

export default function Usage() {
  const { isAuthenticated } = useAuth();
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadUsageData();
    loadAlerts();
  }, [isAuthenticated]);

  const loadUsageData = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/usage', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to load usage data');
      const data = await response.json();
      setUsageData(data);
    } catch (error) {
      console.error('Failed to load usage data:', error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const getAlertColor = (level: string) => {
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

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground-primary mb-4">
          使用情况
        </h1>
        <p className="text-foreground-secondary">请先登录查看使用情况</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground-primary mb-4">
        使用情况
      </h1>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-foreground-accent border-t-transparent"></div>
        </div>
      ) : usageData.length === 0 ? (
        <div className="text-center py-12 text-foreground-secondary">
          暂无使用数据
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {usageData.map((usage) => (
              <div key={`${usage.provider}-${usage.accountId}`} className="bg-card-background rounded-xl border border-border-color p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-8 w-8 text-accent" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground-primary">
                        {usage.provider} / {usage.accountId}
                      </h3>
                      <p className="text-sm text-foreground-secondary">
                        {new Date(usage.periodStart).toLocaleDateString()} - {new Date(usage.periodEnd).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-foreground-accent">
                      {usage.percentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-foreground-secondary">
                      {usage.usedQuota.toFixed(1)} / {usage.totalQuota.toFixed(1)} GB
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground-primary">总配额</h4>
                    <span className="text-2xl font-bold text-foreground-accent">
                      {usage.totalQuota.toFixed(1)} GB
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground-primary">已使用</h4>
                    <span className="text-2xl font-bold text-foreground-primary">
                      {usage.usedQuota.toFixed(1)} GB
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground-primary">剩余</h4>
                    <span className="text-2xl font-bold text-success">
                      {(usage.totalQuota - usage.usedQuota).toFixed(1)} GB
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {alerts.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-foreground-primary mb-4">
                告警记录
              </h2>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`rounded-xl border p-4 ${getAlertColor(alert.level)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`h-5 w-5 ${alert.level === 'CRITICAL' ? 'text-red-900' : 'text-yellow-900'}`} />
                        <div>
                          <h4 className="text-lg font-semibold text-foreground-primary">
                            {alert.provider} - {alert.accountId}
                          </h4>
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
                    <p className="text-sm text-foreground-secondary">
                      {alert.message}
                    </p>
                  </div>
                ))}
              </div>
          )}
        </div>
      )}
    </div>
  );
}