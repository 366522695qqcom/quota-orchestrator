import { useState, useEffect } from 'react';
import { Mail, Send, TestTube2, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SmtpConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  from?: string;
}

export default function Settings() {
  const { isAuthenticated } = useAuth();
  const [config, setConfig] = useState<SmtpConfig>({});
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadConfig();
  }, [isAuthenticated]);

  const loadConfig = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/smtp-config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to load SMTP config');
      const data = await response.json();
      setConfig(data.config || {});
    } catch (error) {
      console.error('Failed to load SMTP config:', error);
      alert('加载SMTP配置失败');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/smtp-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error('Failed to save SMTP config');
      alert('SMTP配置保存成功！');
    } catch (error) {
      console.error('Failed to save SMTP config:', error);
      alert('保存SMTP配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const response = await fetch('http://localhost:3000/api/smtp-config/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to test SMTP');
      const data = await response.json();
      setTestResult('测试邮件发送成功！请检查邮箱。');
    } catch (error) {
      console.error('Failed to test SMTP:', error);
      setTestResult(error?.message || '测试失败');
    } finally {
      setTesting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground-primary mb-4">
          系统设置
        </h1>
        <p className="text-foreground-secondary">请先登录</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground-primary mb-4">
        系统设置
      </h1>
      
      <form onSubmit={handleSave} className="bg-card-background rounded-xl border border-border-color p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground-primary mb-4">
            SMTP 配置
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-foreground-primary mb-2">
              SMTP 服务器
            </label>
            <input
              type="text"
              value={config.host || ''}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
              placeholder="smtp.gmail.com"
              className="w-full px-4 py-3 rounded-lg bg-background-primary border border-border-color text-foreground-primary focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground-primary mb-2">
              SMTP 端口
            </label>
            <input
              type="number"
              value={config.port || 587}
              onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
              placeholder="587"
              className="w-full px-4 py-3 rounded-lg bg-background-primary border border-border-color text-foreground-primary focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground-primary mb-2">
              SMTP 用户名
            </label>
            <input
              type="text"
              value={config.user || ''}
              onChange={(e) => setConfig({ ...config, user: e.target.value })}
              placeholder="your-email@gmail.com"
              className="w-full px-4 py-3 rounded-lg bg-background-primary border border-border-color text-foreground-primary focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground-primary mb-2">
              SMTP 密码
            </label>
            <input
              type="password"
              value={config.password || ''}
              onChange={(e) => setConfig({ ...config, password: e.target.value })}
              placeholder="your-app-password"
              className="w-full px-4 py-3 rounded-lg bg-background-primary border border-border-color text-foreground-primary focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground-primary mb-2">
              发件人
            </label>
            <input
              type="text"
              value={config.from || ''}
              onChange={(e) => setConfig({ ...config, from: e.target.value })}
              placeholder="Quota Orchestrator <noreply@example.com>"
              className="w-full px-4 py-3 rounded-lg bg-background-primary border border-border-color text-foreground-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              {loading ? '保存中…' : '保存配置'}
            </button>
            
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="flex-1 px-6 py-3 rounded-lg bg-success text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TestTube2 className="h-5 w-5" />
              {testing ? '测试中…' : '发送测试邮件'}
            </button>
          </div>
        </div>
        
        {testResult && (
          <div className={`mt-4 p-4 rounded-xl border ${testResult.includes('成功') ? 'border-green-700 bg-green-950/10' : 'border-red-700 bg-red-950/10'}`}>
            <div className="flex items-center gap-3">
              {testResult.includes('成功') ? (
                <Send className="h-6 w-6 text-green-600" />
              ) : (
                <Mail className="h-6 w-6 text-red-600" />
              )}
              <div className={`text-sm ${testResult.includes('成功') ? 'text-green-900' : 'text-red-900'}`}>
                {testResult}
              </div>
            </div>
          )}
      </form>
    </div>
  );
}