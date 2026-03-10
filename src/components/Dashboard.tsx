import { useState } from 'react';
import { supabase, Child } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSupabaseQuery, mutate } from '../lib/swrHooks';
import { userScopedKeys } from '../lib/swrKeys';
import { Book, Calendar, Baby, Plus, Edit2, Trash2 } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildBirthDate, setNewChildBirthDate] = useState('');
  const [newChildGender, setNewChildGender] = useState<'male' | 'female'>('male');
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [editChildName, setEditChildName] = useState('');
  const [editChildBirthDate, setEditChildBirthDate] = useState('');
  const [editChildGender, setEditChildGender] = useState<'male' | 'female'>('male');

  // SWR query for children
  const { data: children = [] } = useSupabaseQuery(
    user ? userScopedKeys(user.id).CHILDREN : null,
    async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      return data || [];
    }
  );

  // SWR query for recent reading logs
  const { data: recentReading = [] } = useSupabaseQuery(
    user ? userScopedKeys(user.id).READING_LOGS : null,
    async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('reading_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('reading_date', { ascending: false })
        .limit(3);
      return data || [];
    }
  );

  // SWR query for upcoming vaccines - conditional on children data
  const { data: upcomingVaccines = [] } = useSupabaseQuery(
    children.length > 0 && user ? userScopedKeys(user.id).IMMUNIZATION_RECORDS : null,
    async () => {
      if (children.length === 0 || !user) return [];
      const childIds = children.map((c: Child) => c.id);
      const today = new Date().toISOString().split('T')[0];

      const { data } = await supabase
        .from('immunization_records')
        .select('*')
        .in('child_id', childIds)
        .eq('completed', false)
        .gte('scheduled_date', today)
        .order('scheduled_date', { ascending: true })
        .limit(3);
      return data || [];
    }
  );

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newChildName.trim() || !newChildBirthDate) return;

    const { error } = await supabase
      .from('children')
      .insert({
        user_id: user.id,
        name: newChildName,
        birth_date: newChildBirthDate,
        gender: newChildGender,
      });

    if (!error) {
      setNewChildName('');
      setNewChildBirthDate('');
      setNewChildGender('male');
      setShowAddChild(false);
      // Invalidate children cache and dependent vaccine cache
      await Promise.all([
        mutate(userScopedKeys(user.id).CHILDREN),
        mutate(userScopedKeys(user.id).IMMUNIZATION_RECORDS),
      ]);
    }
  };

  const handleEditChild = (child: Child) => {
    setEditingChildId(child.id);
    setEditChildName(child.name);
    setEditChildBirthDate(child.birth_date);
    setEditChildGender(child.gender);
  };

  const handleUpdateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingChildId || !editChildName.trim() || !editChildBirthDate) return;

    const { error } = await supabase
      .from('children')
      .update({
        name: editChildName,
        birth_date: editChildBirthDate,
        gender: editChildGender,
      })
      .eq('id', editingChildId);

    if (!error) {
      setEditingChildId(null);
      setEditChildName('');
      setEditChildBirthDate('');
      setEditChildGender('male');
      // Invalidate children cache
      await mutate(userScopedKeys(user.id).CHILDREN);
    }
  };

  const handleDeleteChild = async (childId: string) => {
    if (user && window.confirm('Apakah Anda yakin ingin menghapus data anak ini?')) {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId);

      if (!error) {
        // Invalidate children cache and dependent vaccine cache
        await Promise.all([
          mutate(userScopedKeys(user.id).CHILDREN),
          mutate(userScopedKeys(user.id).IMMUNIZATION_RECORDS),
        ]);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingChildId(null);
    setEditChildName('');
    setEditChildBirthDate('');
    setEditChildGender('male');
  };

  const getChildName = (childId: string) => {
    const child = children.find((c: Child) => c.id === childId);
    return child?.name || 'Anak';
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="bg-gradient-to-r from-blue-500 via-purple-400 to-rose-300 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Selamat Datang!</h2>
        <p className="text-blue-50">Mari pantau tumbuh kembang dan literasi keluarga Anda</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Baby className="w-5 h-5 text-blue-600" />
            Anak-anak
          </h3>
          <button
            onClick={() => setShowAddChild(!showAddChild)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Tambah Anak
          </button>
        </div>

        {showAddChild && (
          <form onSubmit={handleAddChild} className="bg-white rounded-xl p-4 shadow-sm mb-4 space-y-3">
            <input
              type="text"
              placeholder="Nama anak"
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
            <input
              type="date"
              value={newChildBirthDate}
              onChange={(e) => setNewChildBirthDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
            <select
              value={newChildGender}
              onChange={(e) => setNewChildGender(e.target.value as 'male' | 'female')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setShowAddChild(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Batal
              </button>
            </div>
          </form>
        )}

        {children.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <Baby className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Belum ada data anak. Tambahkan data anak terlebih dahulu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {children.map((child) => {
              const birthDate = new Date(child.birth_date);
              const today = new Date();
              const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
              const years = Math.floor(ageInMonths / 12);
              const months = ageInMonths % 12;

              if (editingChildId === child.id) {
                return (
                  <form key={child.id} onSubmit={handleUpdateChild} className="bg-white rounded-xl p-4 shadow-sm border-2 border-blue-500 space-y-3">
                    <h4 className="font-semibold text-gray-900">Edit Data Anak</h4>
                    <input
                      type="text"
                      placeholder="Nama anak"
                      value={editChildName}
                      onChange={(e) => setEditChildName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                    <input
                      type="date"
                      value={editChildBirthDate}
                      onChange={(e) => setEditChildBirthDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                    <select
                      value={editChildGender}
                      onChange={(e) => setEditChildGender(e.target.value as 'male' | 'female')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                      >
                        Simpan Perubahan
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                );
              }

              return (
                <div key={child.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{child.name}</h4>
                      <p className="text-sm text-gray-600">
                        {years > 0 && `${years} tahun `}
                        {months > 0 && `${months} bulan`}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      child.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                    }`}>
                      {child.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Lahir: {new Date(child.birth_date).toLocaleDateString('id-ID')}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditChild(child)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteChild(child.id)}
                      className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Book className="w-5 h-5 text-blue-600" />
            Aktivitas Membaca Terakhir
          </h3>
          {recentReading.length === 0 ? (
            <p className="text-gray-500 text-sm">Belum ada aktivitas membaca</p>
          ) : (
            <div className="space-y-3">
              {recentReading.map((log) => (
                <div key={log.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="font-medium text-gray-900">{log.book_title}</p>
                  <p className="text-sm text-gray-600">{getChildName(log.child_id)}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(log.reading_date).toLocaleDateString('id-ID')}
                    </span>
                    <span className="text-xs text-blue-600">
                      {log.duration_minutes} menit
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Pengingat Imunisasi
          </h3>
          {upcomingVaccines.length === 0 ? (
            <p className="text-gray-500 text-sm">Tidak ada jadwal imunisasi mendatang</p>
          ) : (
            <div className="space-y-3">
              {upcomingVaccines.map((vaccine) => (
                <div key={vaccine.id} className="border-l-4 border-green-500 pl-4 py-2">
                  <p className="font-medium text-gray-900">{vaccine.vaccine_name}</p>
                  <p className="text-sm text-gray-600">{getChildName(vaccine.child_id)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(vaccine.scheduled_date).toLocaleDateString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
