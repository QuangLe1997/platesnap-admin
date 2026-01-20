'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getStats } from '@/lib/db/seed';
import MainSearch from './MainSearch';
import ResidentsTab from './tabs/ResidentsTab';
import VehiclesTab from './tabs/VehiclesTab';
import ImportTab from './tabs/ImportTab';
import SettingsPage from './SettingsPage';
import {
  Building2,
  Search,
  Users,
  Car,
  Upload,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Home,
  Bell
} from 'lucide-react';

type TabType = 'search' | 'residents' | 'vehicles' | 'import' | 'settings';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [stats, setStats] = useState({ blocks: 0, apartments: 0, residents: 0, vehicles: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadStats();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const menuItems = [
    { id: 'search' as TabType, label: 'Tìm kiếm', icon: Search, description: 'Tra cứu xe và cư dân' },
    { id: 'residents' as TabType, label: 'Cư dân', icon: Users, description: 'Quản lý thông tin cư dân' },
    { id: 'vehicles' as TabType, label: 'Phương tiện', icon: Car, description: 'Quản lý xe đăng ký' },
    { id: 'import' as TabType, label: 'Nhập liệu', icon: Upload, description: 'Import dữ liệu hàng loạt' },
  ];

  const getPageTitle = () => {
    const item = menuItems.find(m => m.id === activeTab);
    if (item) return item.label;
    if (activeTab === 'settings') return 'Cài đặt hệ thống';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-white border-r border-slate-200
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-800">PlateSnap</h1>
                  <p className="text-xs text-slate-500">Admin Portal</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            {/* Powered by Nextia */}
            <a
              href="https://nextia.vn"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 mt-4 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition group"
            >
              <img
                src="https://nextia.vn/images/logo.png"
                alt="Nextia"
                className="h-6 object-contain"
              />
              <span className="text-xs text-slate-500 group-hover:text-slate-700">Powered by Nextia</span>
            </a>
          </div>

          {/* Stats Summary */}
          <div className="px-4 py-4">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2">
                  <div className="text-2xl font-bold text-indigo-600">{stats.vehicles}</div>
                  <div className="text-xs text-slate-500">Phương tiện</div>
                </div>
                <div className="text-center p-2">
                  <div className="text-2xl font-bold text-blue-600">{stats.residents}</div>
                  <div className="text-xs text-slate-500">Cư dân</div>
                </div>
                <div className="text-center p-2">
                  <div className="text-2xl font-bold text-emerald-600">{stats.apartments}</div>
                  <div className="text-xs text-slate-500">Căn hộ</div>
                </div>
                <div className="text-center p-2">
                  <div className="text-2xl font-bold text-amber-600">{stats.blocks}</div>
                  <div className="text-xs text-slate-500">Tòa nhà</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Menu chính
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group
                    ${isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50'
                    }
                  `}
                >
                  <div className={`
                    w-9 h-9 rounded-lg flex items-center justify-center transition-all
                    ${isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    }
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`font-medium text-sm ${isActive ? 'text-indigo-600' : 'text-slate-700'}`}>
                      {item.label}
                    </div>
                    <div className="text-xs text-slate-400">{item.description}</div>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-indigo-400" />}
                </button>
              );
            })}

            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mt-6 mb-2">
              Hệ thống
            </div>
            <button
              onClick={() => {
                setActiveTab('settings');
                setSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group
                ${activeTab === 'settings'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50'
                }
              `}
            >
              <div className={`
                w-9 h-9 rounded-lg flex items-center justify-center transition-all
                ${activeTab === 'settings'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                }
              `}>
                <Settings className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <div className={`font-medium text-sm ${activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-700'}`}>
                  Cài đặt
                </div>
                <div className="text-xs text-slate-400">Quản lý tòa nhà & căn hộ</div>
              </div>
              {activeTab === 'settings' && <ChevronRight className="w-4 h-4 text-indigo-400" />}
            </button>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.displayName?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-slate-700 truncate">{user?.displayName}</div>
                <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-800">{getPageTitle()}</h1>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Home className="w-4 h-4" />
                  <span>/</span>
                  <span>{getPageTitle()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="hidden sm:block h-8 w-px bg-slate-200" />
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user?.displayName?.charAt(0) || 'A'}
                </div>
                <span className="text-sm font-medium text-slate-700">{user?.displayName}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {activeTab === 'search' && <MainSearch />}
          {activeTab === 'residents' && <ResidentsTab />}
          {activeTab === 'vehicles' && <VehiclesTab />}
          {activeTab === 'import' && <ImportTab />}
          {activeTab === 'settings' && (
            <SettingsPage onBack={() => setActiveTab('search')} />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 px-6">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center gap-3">
              <span>© 2025 PlateSnap Admin</span>
              <span className="text-slate-300">|</span>
              <a
                href="https://nextia.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-indigo-600 transition"
              >
                <img
                  src="https://nextia.vn/images/logo.png"
                  alt="Nextia"
                  className="h-4 object-contain"
                />
                <span>Developed by Nextia</span>
              </a>
            </div>
            <span>Version 1.0.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
