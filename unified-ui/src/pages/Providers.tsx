import { useState, useEffect } from 'react';
import { Plus, Trash2, TestTube, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProviderConfig {
  id: string;
  provider: 'vercel' | 'cloudflare' | 'netlify' | 'render';
  accountId: string;
  apiToken: string;
  accountSlug?: string;
  accountTag?: string;
  createdAt: string;
}

export default function Providers() {
  const { isAuthenticated } = useAuth();
  const [configs, setConfigs] = useState<ProviderConfig[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    provider: 'vercel' as const,
    accountId: '',
    apiToken: '',
    accountSlug: '',
    accountTag: '',
  });
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadConfigs();
  }, [isAuthenticated]);

  const loadConfigs = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/provider-configs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to load configs');
      const data = await response.json();
      setConfigs(data);
    } catch (error) {
      console.error('Failed to load configs:', error);
      alert('加载配置失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/provider-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          provider: formData.provider,
          accountId: formData.accountId || 'default',
          apiToken: formData.apiToken,
          ...(formData.provider === 'netlify' ? { accountSlug: formData.accountSlug } : {}),
          ...(formData.provider === 'cloudflare' ? { accountTag: formData.accountTag } : {}),
        }),
      });
      if (!response.ok) throw new Error('Failed to add config');
      await loadConfigs();
      setShowForm(false);
      setFormData({
        provider: 'vercel' as const,
        accountId: '',
        apiToken: '',
        accountSlug: '',
        accountTag: '',
      });
    } catch (error) {
      console.error('Failed to add config:', error);
      alert('添加配置失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个配置吗？')) return;
    try {
      const response = await fetch(`http://localhost:3000/api/provider-configs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete config');
      await loadConfigs();
    } catch (error) {
      console.error('Failed to delete config:', error);
      alert('删除配置失败');
    }
  };

  const handleTest = async (id: string) => {
    setTesting(id);
    try {
      const response = await fetch(`http://localhost:3000/api/provider-configs/${id}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to test config');
      const data = await response.json();
      alert(`测试成功！${JSON.stringify(data.snapshot)}`);
    } catch (error) {
      console.error('Failed to test config:', error);
      alert('测试失败');
    } finally {
      setTesting(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground-primary mb-4">
          Provider配置
        </h1>
        <p className="text-foreground-secondary">请先登录</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground-primary mb-4">
        Provider配置
      </h1>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition-opacity"
        >
          {showForm ? '取消' : '添加配置'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card-background rounded-xl border border-border-color p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground-primary mb-2">
              Provider
            </label>
            <select
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value as any })}
              className="w-full px-4 py-3 rounded-lg bg-background-primary border border-border-color text-foreground-primary focus:outline-none focus:ring-2 focus:ring-accent"
              required
            >
              <option value="vercel">Vercel</option>
              <option value="cloudflare">Cloudflare</option>
              <option value="netlify">Netlify</option>
              <option value="render">Render</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-primary mb-2">
              Account ID
            </label>
            <input
              type="text"
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              placeholder="e.g. personal"
              className="w-full px-4 py-3 rounded-lg bg-background-primary border border-border-color text-foreground-primary focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-primary mb-2">
              API Token
            </label>
            <input
              type="password"
              value={formData.apiToken}
              onChange={(e) => setFormData({ ...formData, apiToken: e.target.value })}
              placeholder="paste token here"
              className="w-full px-4 py-3 rounded-lg bg-background-primary border border-border-color text-foreground-primary focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>
          {formData.provider === 'netlify' && (
            <div>
              <label className="block text-sm font-medium text-foreground-primary mb-2">
                Netlify Account Slug
              </label>
              <input
                type="text"
                value={formData.accountSlug}
                onChange={(e) => setFormData({ ...formData, accountSlug: e.target.value })}
                placeholder="my-account"
                className="w-full px-4 py-3 rounded-lg bg-background-primary border border-border-color text-foreground-primary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          )}
          {formData.provider === 'cloudflare' && (
            <div>
              <label className="block text-sm font-medium text-foreground-primary mb-2">
                Cloudflare Account Tag
              </label>
              <input
                type="text"
                value={formData.accountTag}
                onChange={(e) => setFormData({ ...formData, accountTag: e.target.value })}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 rounded-lg bg-background-primary border border-border-color text-foreground-primary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition-opacity"
            >
              保存
            </button>
          </div>
        </form>
      )}
      <div className="space-y-4">
        {configs.length === 0 ? (
          <div className="text-center text-foreground-secondary py-12">
            暂无配置
          </div>
        ) : (
          configs.map((config) => (
            <div key={config.id} className="bg-card-background rounded-xl border border-border-color p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-sm font-medium text-foreground-primary">
                    {config.provider} / {config.accountId}
                  </div>
                  <div className="text-xs text-foreground-secondary">
                    {new Date(config.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTest(config.id)}
                    disabled={testing === config.id}
                    className="p-2 rounded-lg bg-background-primary border border-border-color text-foreground-primary hover:bg-background-muted transition-colors"
                  >
                    <TestTube className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(config.id)}
                    className="p-2 rounded-lg bg-background-danger text-foreground-danger hover:bg-background-danger/80 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}