'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getStats } from '@/lib/db/seed';
import MainSearch from './MainSearch';
import ResidentsTab from './tabs/ResidentsTab';
import VehiclesTab from './tabs/VehiclesTab';
import ImportTab from './tabs/ImportTab';
import SettingsPage from './SettingsPage';

type TabType = 'search' | 'residents' | 'vehicles' | 'import' | 'settings';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [stats, setStats] = useState({ blocks: 0, apartments: 0, residents: 0, vehicles: 0 });

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

  const mainTabs = [
    { id: 'search' as TabType, label: 'Tìm kiếm', icon: '🔍' },
    { id: 'residents' as TabType, label: 'Cư dân', icon: '👥' },
    { id: 'vehicles' as TabType, label: 'Phương tiện', icon: '🚗' },
    { id: 'import' as TabType, label: 'Nhập liệu', icon: '📤' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏢</span>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Quản lý phương tiện cư dân
              </h1>
              <p className="text-sm text-gray-500">
                {stats.vehicles} xe • {stats.residents} cư dân • {stats.apartments} căn hộ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 text-sm rounded-lg transition ${
                activeTab === 'settings'
                  ? 'bg-gray-200 text-gray-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              ⚙️ Cài đặt
            </button>
            <div className="text-right">
              <p className="font-medium text-gray-700">{user?.displayName}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Only show for main tabs */}
      {activeTab !== 'settings' && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex gap-1 overflow-x-auto">
              {mainTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'search' && <MainSearch />}
        {activeTab === 'residents' && <ResidentsTab />}
        {activeTab === 'vehicles' && <VehiclesTab />}
        {activeTab === 'import' && <ImportTab />}
        {activeTab === 'settings' && (
          <SettingsPage onBack={() => setActiveTab('search')} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          © 2025 PlateSnap Admin - Quản lý phương tiện cư dân
        </div>
      </footer>
    </div>
  );
}
