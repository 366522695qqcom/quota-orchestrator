import { LayoutList, Home, Settings, Database, Shield, Bell, LayoutDashboard, Activity, LayoutGrid } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const tabs = [
    { id: 'dashboard', label: '仪表板', icon: LayoutDashboard },
    { id: 'providers', label: 'Provider配置', icon: LayoutList },
    { id: 'usage', label: '使用情况', icon: Activity },
    { id: 'controls', label: '服务控制', icon: LayoutGrid },
    { id: 'backup', label: '数据库备份', icon: Database },
    { id: 'rules', label: '额度规则', icon: Shield },
    { id: 'alerts', label: '告警记录', icon: Bell },
    { id: 'settings', label: '系统设置', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-card-background border-r border-border-color h-full">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <Home className="h-8 w-8 text-foreground-accent" />
          <h2 className="text-xl font-bold text-foreground-primary">额度编排管理</h2>
        </div>
        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-accent text-white'
                  : 'hover:bg-background-muted'
              }
              `}
            >
              <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-white' : 'text-foreground-accent'}`} />
              <span className={`text-sm font-medium ${activeTab === tab.id ? 'text-white' : 'text-foreground-primary'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}