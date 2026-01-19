'use client';

import { useState } from 'react';
import BlocksTab from './tabs/BlocksTab';
import ApartmentsTab from './tabs/ApartmentsTab';

type SettingsTab = 'blocks' | 'apartments';

interface SettingsPageProps {
  onBack: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('blocks');

  const tabs = [
    { id: 'blocks' as SettingsTab, label: 'Tòa nhà (Blocks)', icon: '🏢' },
    { id: 'apartments' as SettingsTab, label: 'Căn hộ', icon: '🏠' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          ← Quay lại
        </button>
        <div>
          <h2 className="text-xl font-bold">Cài đặt hệ thống</h2>
          <p className="text-sm text-gray-500">Quản lý tòa nhà và căn hộ</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          ⚠️ <strong>Lưu ý:</strong> Đây là các thiết lập nền tảng. Cần tạo Tòa nhà trước, sau đó tạo Căn hộ cho từng tòa.
          Các thay đổi ở đây sẽ ảnh hưởng đến dữ liệu cư dân và phương tiện.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
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

        <div className="p-6">
          {activeTab === 'blocks' && <BlocksTab />}
          {activeTab === 'apartments' && <ApartmentsTab />}
        </div>
      </div>
    </div>
  );
}
