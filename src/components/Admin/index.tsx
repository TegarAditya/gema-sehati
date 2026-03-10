import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Users, BookOpen, ChefHat, BarChart3, Baby, Video as VideoIcon } from 'lucide-react';
import { AdminTab } from './types';
import { OverviewTab } from './OverviewTab';
import { UsersTab } from './UsersTab';
import { ChildrenTab } from './ChildrenTab';
import { StoriesTab } from './StoriesTab';
import { MPASITab } from './MPASITab';
import { VideosTab } from './VideosTab';
import { AnalyticsTab } from './AnalyticsTab';

export function Admin() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900">Akses Admin Dibutuhkan</h3>
        <p className="text-sm text-gray-600 mt-1">Halaman ini hanya tersedia untuk admin.</p>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: typeof Shield }[] = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'users', label: 'Manage User', icon: Users },
    { id: 'children', label: 'Manage Child', icon: Baby },
    { id: 'stories', label: 'Manage Stories', icon: BookOpen },
    { id: 'mpasi', label: 'Manage MPASI', icon: ChefHat },
    { id: 'videos', label: 'Manage Videos', icon: VideoIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-7 h-7 text-blue-600" />
          Admin Dashboard
        </h2>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-2 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
              activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'children' && <ChildrenTab />}
      {activeTab === 'stories' && <StoriesTab />}
      {activeTab === 'mpasi' && <MPASITab />}
      {activeTab === 'videos' && <VideosTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
    </div>
  );
}
