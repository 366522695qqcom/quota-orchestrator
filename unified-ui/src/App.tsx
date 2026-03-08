import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, Shield, Activity } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogin = async (username: string, password: string) => {
    try {
      await login(username, password);
    } catch (error) {
      console.error('Login failed:', error);
      alert('登录失败，请检查用户名和密码');
    }
  };

  const handleLogout = () => {
    logout();
    setActiveTab('dashboard');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-card-background rounded-2xl border border-border-color p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-center mb-6 text-foreground-primary">
              额度编排管理系统
            </h2>
            <p className="text-center text-foreground-secondary mb-8">
              管理多个部署平台的免费配额，自动停止超限服务。
            </p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="用户名"
                className="w-full px-4 py-3 rounded-lg bg-background-primary border border-border-color text-foreground-primary focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="password"
                placeholder="密码"
                className="w-full px-4 py-3 rounded-lg bg-background-primary border border-border-color text-foreground-primary focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button 
                className="w-full px-4 py-3 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition-opacity"
                onClick={() => handleLogin('admin', 'admin')}
              >
                登录
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background-primary">
        <Header 
          title="额度编排管理" 
          onLogout={handleLogout}
        />
        <div className="flex">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <main className="flex-1 bg-background-primary">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/providers" element={<Providers />} />
              <Route path="/usage" element={<Usage />} />
              <Route path="/controls" element={<Controls />} />
              <Route path="/backup" element={<Backup />} />
              <Route path="/rules" element={<Rules />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/test" element={<Test />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground-primary mb-4">
        仪表板
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card-background rounded-xl border border-border-color p-6">
          <div className="flex items-center gap-4 mb-4">
            <LayoutDashboard className="h-8 w-8 text-accent" />
            <div>
              <h3 className="text-lg font-semibold text-foreground-primary">总配额使用</h3>
              <p className="text-3xl font-bold text-foreground-accent">45.2 GB</p>
              <p className="text-sm text-foreground-secondary">本月已使用 12.3 GB</p>
            </div>
          </div>
        </div>
        <div className="bg-card-background rounded-xl border border-border-color p-6">
          <div className="flex items-center gap-4 mb-4">
            <Activity className="h-8 w-8 text-accent" />
            <div>
              <h3 className="text-lg font-semibold text-foreground-primary">活跃Provider</h3>
              <p className="text-2xl font-bold text-foreground-accent">3 / 5</p>
            </div>
          </div>
        </div>
        <div className="bg-card-background rounded-xl border border-border-color p-6">
          <div className="flex items-center gap-4 mb-4">
            <Shield className="h-8 w-8 text-success" />
            <div>
              <h3 className="text-lg font-semibold text-foreground-primary">系统状态</h3>
              <p className="text-2xl font-bold text-success">正常</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Providers() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground-primary mb-4">
        Provider配置
      </h1>
      <div className="bg-card-background rounded-xl border border-border-color p-6">
        <p className="text-center text-foreground-secondary">
          Provider配置管理功能开发中...
        </p>
      </div>
    </div>
  );
}

function Usage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground-primary mb-4">
        使用情况
      </h1>
      <div className="bg-card-background rounded-xl border border-border-color p-6">
        <p className="text-center text-foreground-secondary">
          使用情况监控功能开发中...
        </p>
      </div>
    </div>
  );
}

function Controls() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground-primary mb-4">
        服务控制
      </h1>
      <div className="bg-card-background rounded-xl border border-border-color p-6">
        <p className="text-center text-foreground-secondary">
          服务控制功能开发中...
        </p>
      </div>
    </div>
  );
}

function Backup() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground-primary mb-4">
        数据库备份
      </h1>
      <div className="bg-card-background rounded-xl border border-border-color p-6">
        <p className="text-center text-foreground-secondary">
          数据库备份功能开发中...
        </p>
      </div>
    </div>
  );
}

function Rules() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground-primary mb-4">
        额度规则
      </h1>
      <div className="bg-card-background rounded-xl border border-border-color p-6">
        <p className="text-center text-foreground-secondary">
          额度规则管理功能开发中...
        </p>
      </div>
    </div>
  );
}

function Settings() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground-primary mb-4">
        系统设置
      </h1>
      <div className="bg-card-background rounded-xl border border-border-color p-6">
        <p className="text-center text-foreground-secondary">
          系统设置功能开发中...
        </p>
      </div>
    </div>
  );
}

function Alerts() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground-primary mb-4">
        告警记录
      </h1>
      <div className="bg-card-background rounded-xl border border-border-color p-6">
        <p className="text-center text-foreground-secondary">
          告警记录功能开发中...
        </p>
      </div>
    </div>
  );
}

function Test() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground-primary mb-4">
        系统测试
      </h1>
      <div className="bg-card-background rounded-xl border border-border-color p-6">
        <p className="text-center text-foreground-secondary">
          测试所有系统组件和API连接
        </p>
      </div>
    </div>
  );
}

export default App;