import { useState, useEffect } from 'react';
import { Database, Download, Upload, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Backup {
  filename: string;
  size: string;
  createdAt: string;
}

export default function Backup() {
  const { isAuthenticated } = useAuth();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadBackups();
  }, [isAuthenticated]);

  const loadBackups = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/backup', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to load backups');
      const data = await response.json();
      setBackups(data.backups);
    } catch (error) {
      console.error('Failed to load backups:', error);
      alert('加载备份失败');
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    if (!confirm('确定要创建新的数据库备份吗？')) return;
    setCreating(true);
    try {
      const response = await fetch('http://localhost:3000/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error('Failed to create backup');
      alert('备份创建成功！');
      await loadBackups();
    } catch (error) {
      console.error('Failed to create backup:', error);
      alert('创建备份失败');
    } finally {
      setCreating(false);
    }
  };

  const downloadBackup = async (filename: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/backup/download/${filename}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to download backup');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download backup:', error);
      alert('下载备份失败');
    }
  };

  const restoreBackup = async (filename: string) => {
    if (!confirm(`确定要从备份 ${filename} 恢复数据库吗？\n\n⚠️ 这将覆盖当前数据库！`)) return;
    setRestoring(filename);
    try {
      const response = await fetch(`http://localhost:3000/api/backup/restore/${filename}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error('Failed to restore backup');
      alert('数据库恢复成功！');
      await loadBackups();
    } catch (error) {
      console.error('Failed to restore backup:', error);
      alert('恢复备份失败');
    } finally {
      setRestoring(null);
    }
  };

  const deleteBackup = async (filename: string) => {
    if (!confirm(`确定要删除备份 ${filename} 吗？`)) return;
    try {
      const response = await fetch(`http://localhost:3000/api/backup/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete backup');
      alert('备份删除成功！');
      await loadBackups();
    } catch (error) {
      console.error('Failed to delete backup:', error);
      alert('删除备份失败');
    }
  };

  const formatSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground-primary mb-4">
          数据库备份
        </h1>
        <p className="text-foreground-secondary">请先登录</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground-primary mb-4">
        数据库备份
      </h1>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-foreground-accent border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground-primary">
              备份列表 ({backups.length})
            </h2>
            <button
              onClick={loadBackups}
              className="p-2 rounded-lg bg-background-primary border border-border-color text-foreground-primary hover:bg-background-muted transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              刷新
            </button>
            <button
              onClick={createBackup}
              disabled={creating}
              className="p-2 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Database className="h-5 w-5" />
              {creating ? '创建中…' : '创建备份'}
            </button>
          </div>
          
          {backups.length === 0 ? (
            <div className="text-center py-12 text-foreground-secondary">
              暂无备份
            </div>
          ) : (
            <div className="space-y-4">
              {backups.map((backup) => (
                <div key={backup.filename} className="bg-card-background rounded-xl border border-border-color p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-foreground-primary">
                        {backup.filename}
                      </div>
                      <div className="text-sm text-foreground-secondary">
                        大小: {formatSize(backup.size)} | 创建时间: {new Date(backup.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadBackup(backup.filename)}
                        className="p-2 rounded-lg bg-background-primary border border-border-color text-foreground-primary hover:bg-background-muted transition-colors"
                      >
                        <Download className="h-5 w-5" />
                        下载
                      </button>
                      <button
                        onClick={() => restoreBackup(backup.filename)}
                        disabled={restoring === backup.filename}
                        className="p-2 rounded-lg bg-success text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Upload className="h-5 w-5" />
                        {restoring === backup.filename ? '恢复中…' : '恢复'}
                      </button>
                      <button
                        onClick={() => deleteBackup(backup.filename)}
                        className="p-2 rounded-lg bg-danger text-white font-medium hover:opacity-90 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}