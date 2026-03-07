import { useState, useEffect } from 'react';
import { Power, PowerOff, RotateCw, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ServiceControl {
  id: string;
  provider: string;
  accountId: string;
  status: 'running' | 'stopped' | 'restarting';
  lastAction: string;
  lastActionTime: string;
}

export default function Controls() {
  const { isAuthenticated } = useAuth();
  const [services, setServices] = useState<ServiceControl[]>([]);
  const [executing, setExecuting] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadServices();
  }, [isAuthenticated]);

  const loadServices = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/service-controls', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to load services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Failed to load services:', error);
      alert('加载服务状态失败');
    }
  };

  const handleAction = async (action: 'STOP' | 'START' | 'RESTART') => {
    if (!confirm(`确定要${action === 'STOP' ? '停止' : action === 'START' ? '启动'}服务吗？`)) return;
    
    setExecuting(action);
    try {
      const response = await fetch('http://localhost:3000/api/service-control/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          configId: services[0].id,
          action,
          reason: `Manual ${action} by user`,
        }),
      });
      if (!response.ok) throw new Error('Failed to execute action');
      await loadServices();
      alert(`服务${action === 'STOP' ? '停止' : action === 'START' ? '启动'}成功`);
    } catch (error) {
      console.error('Failed to execute action:', error);
      alert(`操作失败：${error?.message || '未知错误'}`);
    } finally {
      setExecuting(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Power className="h-8 w-8 text-success" />;
      case 'stopped':
        return <PowerOff className="h-8 w-8 text-danger" />;
      case 'restarting':
        return <RotateCw className="h-8 w-8 text-warning" />;
      default:
        return <Play className="h-8 w-8 text-foreground-secondary" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running':
        return '运行中';
      case 'stopped':
        return '已停止';
      case 'restarting':
        return '重启中';
      default:
        return '未知';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground-primary mb-4">
          服务控制
        </h1>
        <p className="text-foreground-secondary">请先登录</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground-primary mb-4">
        服务控制
      </h1>
      
      {services.length === 0 ? (
        <div className="text-center py-12 text-foreground-secondary">
          暂无服务配置
        </div>
      ) : (
        <div className="space-y-6">
          {services.map((service) => (
            <div key={service.id} className="bg-card-background rounded-xl border border-border-color p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  {getStatusIcon(service.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground-primary">
                      {service.provider} / {service.accountId}
                    </h3>
                    <p className="text-sm text-foreground-secondary">
                      状态: {getStatusText(service.status)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-foreground-secondary">
                    {new Date(service.lastActionTime).toLocaleString()}
                  </div>
                  <div className="text-xs text-foreground-secondary">
                    {service.lastAction}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-border-color pt-4">
                <h4 className="text-sm font-medium text-foreground-primary mb-4">
                  服务操作
                </h4>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => handleAction('START')}
                    disabled={service.status === 'running' || service.status === 'restarting' || executing === 'START'}
                    className="flex-1 px-4 py-3 rounded-lg bg-success text-white font-medium hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="h-5 w-5" />
                    启动
                  </button>
                  
                  <button
                    onClick={() => handleAction('STOP')}
                    disabled={service.status === 'stopped' || service.status === 'restarting' || executing === 'STOP'}
                    className="flex-1 px-4 py-3 rounded-lg bg-danger text-white font-medium hover:bg-danger/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PowerOff className="h-5 w-5" />
                    停止
                  </button>
                  
                  <button
                    onClick={() => handleAction('RESTART')}
                    disabled={executing === 'RESTART'}
                    className="flex-1 px-4 py-3 rounded-lg bg-warning text-white font-medium hover:bg-warning/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCw className="h-5 w-5" />
                    重启
                  </button>
                </div>
              </div>
              
              {executing && (
                <div className="mt-4 p-4 rounded-lg bg-background-muted border border-border-color">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-foreground-accent border-t-transparent"></div>
                    <span className="text-sm text-foreground-primary">
                      正在{executing === 'START' ? '启动' : executing === 'STOP' ? '停止' : '重启'}服务...
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}