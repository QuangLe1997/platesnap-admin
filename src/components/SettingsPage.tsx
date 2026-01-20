'use client';

import { useState } from 'react';
import BlocksTab from './tabs/BlocksTab';
import ApartmentsTab from './tabs/ApartmentsTab';
import {
  Settings,
  Building2,
  Home,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

type SettingsTab = 'blocks' | 'apartments';

interface SettingsPageProps {
  onBack: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('blocks');

  const tabs = [
    { id: 'blocks' as SettingsTab, label: 'Tòa nhà', icon: Building2 },
    { id: 'apartments' as SettingsTab, label: 'Căn hộ', icon: Home },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Cài đặt hệ thống</h2>
              <p className="text-sm text-slate-500">Quản lý tòa nhà và căn hộ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="text-sm text-amber-800 font-medium">Lưu ý quan trọng</p>
          <p className="text-sm text-amber-700 mt-1">
            Đây là các thiết lập nền tảng. Cần tạo Tòa nhà trước, sau đó tạo Căn hộ cho từng tòa.
            Các thay đổi ở đây sẽ ảnh hưởng đến dữ liệu cư dân và phương tiện.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-100">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'blocks' && <BlocksTab />}
          {activeTab === 'apartments' && <ApartmentsTab />}
        </div>
      </div>
    </div>
  );
}
