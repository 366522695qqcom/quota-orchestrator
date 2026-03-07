import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Test() {
  const { isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState<{
    auth: boolean;
    providers: boolean;
    usage: boolean;
    controls: boolean;
    backup: boolean;
    rules: boolean;
    settings: boolean;
    alerts: boolean;
    api: boolean;
  }>({
    auth: false,
    providers: false,
    usage: false,
    controls: false,
    backup: false,
    rules: false,
    settings: false,
    alerts: false,
    api: false,
  });

  const runTests = async () => {
    setTestResults({
      auth: false,
      providers: false,
      usage: false,
      controls: false,
      backup: false,
      rules: false,
      settings: false,
      alerts: false,
      api: false,
    });

    const tests = [
      { name: '认证系统', test: async () => {
        try {
          const response = await fetch('http://localhost:3000/api/health');
          setTestResults(prev => ({ ...prev, auth: response.ok }));
        } catch (error) {
          console.error('Auth test failed:', error);
        }
      }},
      { name: 'Provider配置管理', test: async () => {
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch('http://localhost:3000/api/provider-configs', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          setTestResults(prev => ({ ...prev, providers: response.ok }));
        } catch (error) {
          console.error('Providers test failed:', error);
        }
      }},
      { name: '使用情况监控', test: async () => {
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch('http://localhost:3000/api/usage', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          setTestResults(prev => ({ ...prev, usage: response.ok }));
        } catch (error) {
          console.error('Usage test failed:', error);
        }
      }},
      { name: '服务控制功能', test: async () => {
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch('http://localhost:3000/api/service-controls', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          setTestResults(prev => ({ ...prev, controls: response.ok }));
        } catch (error) {
          console.error('Controls test failed:', error);
        }
      }},
      { name: '数据库备份功能', test: async () => {
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch('http://localhost:3000/api/backup', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          setTestResults(prev => ({ ...prev, backup: response.ok }));
        } catch (error) {
          console.error('Backup test failed:', error);
        }
      }},
      { name: '额度规则管理', test: async () => {
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch('http://localhost:3000/api/quota-rules', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          setTestResults(prev => ({ ...prev, rules: response.ok }));
        } catch (error) {
          console.error('Rules test failed:', error);
        }
      }},
      { name: 'SMTP配置功能', test: async () => {
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch('http://localhost:3000/api/smtp-config', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          setTestResults(prev => ({ ...prev, settings: response.ok }));
        } catch (error) {
          console.error('Settings test failed:', error);
        }
      }},
      { name: '告警记录', test: async () => {
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch('http://localhost:3000/api/usage/alerts', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          setTestResults(prev => ({ ...prev, alerts: response.ok }));
        } catch (error) {
          console.error('Alerts test failed:', error);
        }
      }},
      { name: 'API连接', test: async () => {
        try {
          const response = await fetch('http://localhost:3000/api/health');
          setTestResults(prev => ({ ...prev, api: response.ok }));
        } catch (error) {
          console.error('API test failed:', error);
        }
      }},
    ];

    for (const test of tests) {
      await test.test();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground-primary mb-4">
          系统测试
        </h1>
        <p className="text-foreground-secondary mb-8">
          测试所有系统组件和API连接
        </p>
        <button
          onClick={runTests}
          className="px-6 py-3 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition-opacity"
        >
          运行测试
        </button>
        
        <div className="space-y-4">
          {Object.entries(testResults).map(([name, result]) => (
            <div key={name} className="bg-card-background rounded-xl border border-border-color p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground-primary">
                  {name}
                </h3>
                {result ? (
                  <CheckCircle className="h-6 w-6 text-success" />
                ) : (
                  <X className="h-6 w-6 text-danger" />
                )}
              </div>
              <p className={`text-sm ${result ? 'text-green-900' : 'text-red-900'}`}>
                {result ? '通过' : '失败'}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
}