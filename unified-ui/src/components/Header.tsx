import React from 'react';
import { LayoutDashboard, LayoutList, LayoutListIcon, LayoutGrid, Activity, CreditCard, Settings, LogOut, Menu, X } from 'lucide-react';

interface HeaderProps {
  title: string;
  onLogout?: () => void;
}

export function Header({ title, onLogout }: HeaderProps) {
  return (
    <header className="bg-card-background border-b border-border-color px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <LayoutDashboard className="h-6 w-6 text-foreground-accent" />
        <h1 className="text-2xl font-bold text-foreground-primary">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-background-muted transition-colors">
          <Settings className="h-5 w-5" />
        </button>
        <button 
          className="p-2 rounded-lg hover:bg-background-muted transition-colors"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}