import { useState } from 'react';
import { supabase, UserProfile, Child } from '../../lib/supabase';
import { useSupabaseQuery } from '../../lib/swrHooks';
import { mutate } from 'swr';
import { Ban, CheckCircle } from 'lucide-react';
import { calculateChildrenByUser } from './utils';

const ITEMS_PER_PAGE = 10;

export function UsersTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: users = [], isLoading: usersLoading } = useSupabaseQuery<UserProfile[]>(
    'admin-users',
    async () => {
      const { data } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false });
      return data ?? [];
    }
  );
  const { data: children = [] } = useSupabaseQuery<Child[]>(
    'admin-children',
    async () => {
      const { data } = await supabase.from('children').select('*').order('created_at', { ascending: false });
      return data ?? [];
    }
  );

  const childrenByUser = calculateChildrenByUser(children);

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleToggleUserActive = async (profile: UserProfile) => {
    const action = profile.is_active ? 'suspend' : 'activate';
    const confirmed = window.confirm(`Are you sure you want to ${action} ${profile.email}?`);
    if (!confirmed) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({ is_active: !profile.is_active })
      .eq('id', profile.id);

    if (!error) {
      await mutate('admin-users');
    }
  };

  if (usersLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 space-y-3">
        <h3 className="font-semibold text-gray-900">Manage User</h3>
        <input
          type="text"
          placeholder="Cari email atau nama..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Anak</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Tidak ada user ditemukan
                </td>
              </tr>
            ) : (
              paginatedUsers.map((profile) => (
                <tr key={profile.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{profile.email}</td>
                  <td className="px-4 py-3">{profile.full_name || '-'}</td>
                  <td className="px-4 py-3">{childrenByUser[profile.id] ?? 0}</td>
                  <td className="px-4 py-3">
                    {profile.is_active ? (
                      <span className="inline-flex px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Active</span>
                    ) : (
                      <span className="inline-flex px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">Suspended</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleUserActive(profile)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition ${
                        profile.is_active
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {profile.is_active ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      {profile.is_active ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} dari {filteredUsers.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ← Sebelumnya
            </button>
            <span className="text-sm text-gray-700">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Selanjutnya →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
