import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface QuotaRule {
  id: string;
  metricName: string;
  limitValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  stopThreshold: number;
}

export default function Rules() {
  const { isAuthenticated } = useAuth();
  const [rules, setRules] = useState<QuotaRule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    metricName: 'requests',
    limitValue: 100000,
    warningThreshold: 80,
    criticalThreshold: 90,
    stopThreshold: 95,
  });
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadRules();
  }, [isAuthenticated]);

  const loadRules = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/quota-rules', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to load rules');
      const data = await response.json();
      setRules(data);
    } catch (error) {
      console.error('Failed to load rules:', error);
      alert('加载规则失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editing 
        ? `http://localhost:3000/api/quota-rules/${editing}`
        : 'http://localhost:3000/api/quota-rules';
      
      const method = editing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          metricName: formData.metricName,
          limitValue: formData.limitValue,
          warningThreshold: formData.warningThreshold,
          criticalThreshold: formData.criticalThreshold,
          stopThreshold: formData.stopThreshold,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to save rule');
      await loadRules();
      setShowForm(false);
      setEditing(null);
      setFormData({
        metricName: 'requests',
        limitValue: 100000,
        warningThreshold: 80,
        criticalThreshold: 90,
        stopThreshold: 95,
      });
      alert(editing ? '规则更新成功！' : '规则创建成功！');
    } catch (error) {
      console.error('Failed to save rule:', error);
      alert('保存规则失败');
    }
  };

  const handleEdit = (rule: QuotaRule) => {
    setFormData({
      metricName: rule.metricName,
      limitValue: rule.limitValue,
      warningThreshold: rule.warningThreshold,
      criticalThreshold: rule.criticalThreshold,
      stopThreshold: rule.stopThreshold,
    });
    setEditing(rule.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个额度规则吗？')) return;
    try {
      const response = await fetch(`http://localhost:3000/api/quota-rules/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete rule');
      await loadRules();
      alert('规则删除成功！');
    } catch (error) {
      console.error('Failed to delete rule:', error);
      alert('删除规则失败');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground-primary mb-4">
          额度规则
        </h1>
        <p className="text-foreground-secondary">请先登录</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground-primary mb-4">
        额度规则
      </h1>
      
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition-opacity"
        >
          {showForm ? '取消' : '添加规则'}
        </button>
      </div>
      
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card-background rounded-xl border border-border-color p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground-primary mb-2">
              指标名称
            </label>
            <input
              type="text"
              value={formData.metricName}
              onChange={(e) => setFormData({ ...formData, metricName: e.target.value })}
              placeholder="e.g. requests, bandwidth"
              className="w-full px-4 py-3 rounded-lg bg-background-primary border border-border-color text-foreground-primary focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground-primary mb-2">
                配额限制
              </label>
              <input
                type="number"
                value={formData.limitValue}
                onChange={(e) => setFormData({ ...formData, limitValue: parseInt(e.target.value) })}
                placeholder="100000"
                className="w-full px-4 py-3 rounded-lg bg-background-primary border border-border-color text-foreground-primary focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground-primary mb-2">
                警告阈值 (%)
              </label>
              <input
                type="number"
                value={formData.warningThreshold}
                onChange={(e) => setFormData({ ...formData, warningThreshold: parseInt(e.target.value) })}
                placeholder="80"
                min="0"
                max="100"
                className="w-full px-4 py-3 rounded-lg bg-background-primary border border-border-color text-foreground-primary focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground-primary mb-2">
                严重阈值 (%)
              </label>
              <input
                type="number"
                value={formData.criticalThreshold}
                onChange={(e) => setFormData({ ...formData, criticalThreshold: parseInt(e.target.value) })}
                placeholder="90"
                min="0"
                max="100"
                className="w-full px-4 py-3 rounded-lg bg-background-primary border border-border-color text-foreground-primary focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground-primary mb-2">
                停止阈值 (%)
              </label>
              <input
                type="number"
                value={formData.stopThreshold}
                onChange={(e) => setFormData({ ...formData, stopThreshold: parseInt(e.target.value) })}
                placeholder="95"
                min="0"
                max="100"
                className="w-full px-4 py-3 rounded-lg bg-background-primary border border-border-color text-foreground-primary focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition-opacity"
            >
              {editing ? '更新' : '创建'}
            </button>
          </div>
        </form>
      )}
      
      {rules.length === 0 ? (
        <div className="text-center py-12 text-foreground-secondary">
          暂无额度规则
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.id} className="bg-card-background rounded-xl border border-border-color p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="text-lg font-semibold text-foreground-primary">
                    {rule.metricName}
                  </div>
                  <div className="text-sm text-foreground-secondary">
                    配额: {rule.limitValue.toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(rule)}
                    className="p-2 rounded-lg bg-background-primary border border-border-color text-foreground-primary hover:bg-background-muted transition-colors"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="p-2 rounded-lg bg-background-danger text-foreground-danger hover:bg-background-danger/80 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-sm text-foreground-secondary">
                  警告阈值
                </div>
                <div className="text-2xl font-bold text-warning">
                  {rule.warningThreshold}%
                </div>
              </div>
              
              <div className="text-sm text-foreground-secondary">
                  严重阈值
                </div>
                <div className="text-2xl font-bold text-danger">
                  {rule.criticalThreshold}%
                </div>
              </div>
              
              <div className="text-sm text-foreground-secondary">
                  停止阈值
                </div>
                <div className="text-2xl font-bold text-foreground-primary">
                  {rule.stopThreshold}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}