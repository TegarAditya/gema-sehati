import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  supabase,
  Child,
  GrowthRecord,
  ImmunizationRecord,
  MPASIRecipe,
  ReadingLog,
  Story,
  UserProfile,
} from '../lib/supabase';
import { Shield, Users, BookOpen, ChefHat, BarChart3, Download, Ban, CheckCircle, Plus, Pencil, Trash2, Baby, ArrowLeft, Pill, Calendar } from 'lucide-react';

type AdminTab = 'overview' | 'users' | 'children' | 'stories' | 'mpasi' | 'analytics';

type StoryForm = {
  title: string;
  content: string;
  age_category: '0-3' | '4-6' | '7-12';
  theme: string;
  image_url: string;
};

type RecipeForm = {
  title: string;
  age_group: '6-8' | '8-10' | '10-12';
  category: string;
  ingredients: string;
  instructions: string;
  nutrition_info: string;
  allergenic_warning: string;
  prep_time_minutes: number;
  servings: number;
};

const defaultStoryForm: StoryForm = {
  title: '',
  content: '',
  age_category: '4-6',
  theme: '',
  image_url: '',
};

const defaultRecipeForm: RecipeForm = {
  title: '',
  age_group: '6-8',
  category: '',
  ingredients: '',
  instructions: '',
  nutrition_info: '',
  allergenic_warning: '',
  prep_time_minutes: 15,
  servings: 1,
};

function toCsv(rows: Record<string, string | number | boolean | null>[]) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escaped = (value: string | number | boolean | null) => {
    const normalized = `${value ?? ''}`.replaceAll('"', '""');
    return `"${normalized}"`;
  };

  const headerLine = headers.join(',');
  const body = rows
    .map((row) => headers.map((header) => escaped(row[header] ?? '')).join(','))
    .join('\n');

  return `${headerLine}\n${body}`;
}

function downloadCsv(filename: string, rows: Record<string, string | number | boolean | null>[]) {
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function Admin() {
  const { isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [usersSearchQuery, setUsersSearchQuery] = useState('');
  const [usersCurrentPage, setUsersCurrentPage] = useState(1);
  const [childrenSearchQuery, setChildrenSearchQuery] = useState('');
  const [childrenCurrentPage, setChildrenCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [recipes, setRecipes] = useState<MPASIRecipe[]>([]);
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>([]);
  const [immunizations, setImmunizations] = useState<ImmunizationRecord[]>([]);

  const [storyForm, setStoryForm] = useState<StoryForm>(defaultStoryForm);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);

  const [recipeForm, setRecipeForm] = useState<RecipeForm>(defaultRecipeForm);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadAdminData();
  }, [isAdmin]);

  const loadAdminData = async () => {
    setLoading(true);

    const [usersResult, childrenResult, storiesResult, recipesResult, growthResult, readingResult, immunizationResult] = await Promise.all([
      supabase.from('user_profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('children').select('*').order('created_at', { ascending: false }),
      supabase.from('stories').select('*').order('created_at', { ascending: false }),
      supabase.from('mpasi_recipes').select('*').order('created_at', { ascending: false }),
      supabase.from('growth_records').select('*').order('record_date', { ascending: false }),
      supabase.from('reading_logs').select('*').order('reading_date', { ascending: false }),
      supabase.from('immunization_records').select('*').order('scheduled_date', { ascending: false }),
    ]);

    if (usersResult.data) setUsers(usersResult.data);
    if (childrenResult.data) setChildren(childrenResult.data);
    if (storiesResult.data) setStories(storiesResult.data);
    if (recipesResult.data) setRecipes(recipesResult.data);
    if (growthResult.data) setGrowthRecords(growthResult.data);
    if (readingResult.data) setReadingLogs(readingResult.data);
    if (immunizationResult.data) setImmunizations(immunizationResult.data);

    setLoading(false);
  };

  const childrenByUser = useMemo(() => {
    return children.reduce<Record<string, number>>((acc, child) => {
      acc[child.user_id] = (acc[child.user_id] ?? 0) + 1;
      return acc;
    }, {});
  }, [children]);

  const monthlyReading = useMemo(() => {
    const aggregation = readingLogs.reduce<Record<string, number>>((acc, log) => {
      const key = log.reading_date.slice(0, 7);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(aggregation)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);
  }, [readingLogs]);

  const averageGrowth = useMemo(() => {
    if (growthRecords.length === 0) {
      return { avgHeight: 0, avgWeight: 0 };
    }

    const totalHeight = growthRecords.reduce((sum, record) => sum + Number(record.height_cm), 0);
    const totalWeight = growthRecords.reduce((sum, record) => sum + Number(record.weight_kg), 0);

    return {
      avgHeight: totalHeight / growthRecords.length,
      avgWeight: totalWeight / growthRecords.length,
    };
  }, [growthRecords]);

  const immunizationCompletionRate = useMemo(() => {
    if (immunizations.length === 0) return 0;
    const completed = immunizations.filter((record) => record.completed).length;
    return Math.round((completed / immunizations.length) * 100);
  }, [immunizations]);

  // Filtered and paginated users
  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.email.toLowerCase().includes(usersSearchQuery.toLowerCase()) ||
      user.full_name.toLowerCase().includes(usersSearchQuery.toLowerCase())
    );
  }, [users, usersSearchQuery]);

  const usersTotalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (usersCurrentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, usersCurrentPage]);

  // Filtered and paginated children
  const filteredChildren = useMemo(() => {
    return children.filter((child) =>
      child.name.toLowerCase().includes(childrenSearchQuery.toLowerCase())
    );
  }, [children, childrenSearchQuery]);

  const childrenTotalPages = Math.ceil(filteredChildren.length / itemsPerPage);
  const paginatedChildren = useMemo(() => {
    const start = (childrenCurrentPage - 1) * itemsPerPage;
    return filteredChildren.slice(start, start + itemsPerPage);
  }, [filteredChildren, childrenCurrentPage]);

  const handleToggleUserActive = async (profile: UserProfile) => {
    const action = profile.is_active ? 'suspend' : 'activate';
    const confirmed = window.confirm(`Are you sure you want to ${action} ${profile.email}?`);
    if (!confirmed) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({ is_active: !profile.is_active })
      .eq('id', profile.id);

    if (!error) {
      await loadAdminData();
    }
  };

  const handleSubmitStory = async (event: FormEvent) => {
    event.preventDefault();

    if (editingStoryId) {
      const { error } = await supabase.from('stories').update(storyForm).eq('id', editingStoryId);
      if (error) return;
    } else {
      const { error } = await supabase.from('stories').insert(storyForm);
      if (error) return;
    }

    setStoryForm(defaultStoryForm);
    setEditingStoryId(null);
    await loadAdminData();
  };

  const handleEditStory = (story: Story) => {
    setEditingStoryId(story.id);
    setStoryForm({
      title: story.title,
      content: story.content,
      age_category: story.age_category,
      theme: story.theme,
      image_url: story.image_url,
    });
  };

  const handleDeleteStory = async (storyId: string) => {
    const confirmed = window.confirm('Delete this story?');
    if (!confirmed) return;

    const { error } = await supabase.from('stories').delete().eq('id', storyId);
    if (!error) {
      await loadAdminData();
    }
  };

  const handleSubmitRecipe = async (event: FormEvent) => {
    event.preventDefault();

    if (editingRecipeId) {
      const { error } = await supabase.from('mpasi_recipes').update(recipeForm).eq('id', editingRecipeId);
      if (error) return;
    } else {
      const { error } = await supabase.from('mpasi_recipes').insert(recipeForm);
      if (error) return;
    }

    setRecipeForm(defaultRecipeForm);
    setEditingRecipeId(null);
    await loadAdminData();
  };

  const handleEditRecipe = (recipe: MPASIRecipe) => {
    setEditingRecipeId(recipe.id);
    setRecipeForm({
      title: recipe.title,
      age_group: recipe.age_group,
      category: recipe.category,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      nutrition_info: recipe.nutrition_info,
      allergenic_warning: recipe.allergenic_warning,
      prep_time_minutes: recipe.prep_time_minutes,
      servings: recipe.servings,
    });
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    const confirmed = window.confirm('Delete this MPASI recipe?');
    if (!confirmed) return;

    const { error } = await supabase.from('mpasi_recipes').delete().eq('id', recipeId);
    if (!error) {
      await loadAdminData();
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900">Akses Admin Dibutuhkan</h3>
        <p className="text-sm text-gray-600 mt-1">Halaman ini hanya tersedia untuk admin.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const selectedChild = selectedChildId ? children.find((c) => c.id === selectedChildId) : null;
  const selectedChildGrowth = selectedChildId ? growthRecords.filter((g) => g.child_id === selectedChildId) : [];
  const selectedChildReading = selectedChildId ? readingLogs.filter((r) => r.child_id === selectedChildId) : [];
  const selectedChildImmunization = selectedChildId ? immunizations.filter((i) => i.child_id === selectedChildId) : [];
  const selectedChildParent = selectedChild ? users.find((u) => u.id === selectedChild.user_id) : null;

  const tabs: { id: AdminTab; label: string; icon: typeof Shield }[] = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'users', label: 'Manage User', icon: Users },
    { id: 'children', label: 'Manage Child', icon: Baby },
    { id: 'stories', label: 'Manage Stories', icon: BookOpen },
    { id: 'mpasi', label: 'Manage MPASI', icon: ChefHat },
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

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">Total User</p>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">Total Anak</p>
            <p className="text-2xl font-bold text-gray-900">{children.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">Reading Logs</p>
            <p className="text-2xl font-bold text-gray-900">{readingLogs.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">Imunisasi Selesai</p>
            <p className="text-2xl font-bold text-gray-900">{immunizationCompletionRate}%</p>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 space-y-3">
            <h3 className="font-semibold text-gray-900">Manage User</h3>
            <input
              type="text"
              placeholder="Cari email atau nama..."
              value={usersSearchQuery}
              onChange={(e) => {
                setUsersSearchQuery(e.target.value);
                setUsersCurrentPage(1);
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
          {usersTotalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Menampilkan {(usersCurrentPage - 1) * itemsPerPage + 1} - {Math.min(usersCurrentPage * itemsPerPage, filteredUsers.length)} dari {filteredUsers.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUsersCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={usersCurrentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ← Sebelumnya
                </button>
                <span className="text-sm text-gray-700">
                  Halaman {usersCurrentPage} dari {usersTotalPages}
                </span>
                <button
                  onClick={() => setUsersCurrentPage((p) => Math.min(p + 1, usersTotalPages))}
                  disabled={usersCurrentPage === usersTotalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Selanjutnya →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'children' && selectedChildId === null && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 space-y-3">
            <h3 className="font-semibold text-gray-900">Manage Child</h3>
            <input
              type="text"
              placeholder="Cari nama anak..."
              value={childrenSearchQuery}
              onChange={(e) => {
                setChildrenSearchQuery(e.target.value);
                setChildrenCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Tanggal Lahir</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Parent Email</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedChildren.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      Tidak ada anak ditemukan
                    </td>
                  </tr>
                ) : (
                  paginatedChildren.map((child) => {
                    const parent = users.find((u) => u.id === child.user_id);
                    return (
                      <tr key={child.id} className="border-t border-gray-100">
                        <td className="px-4 py-3 font-medium">{child.name}</td>
                        <td className="px-4 py-3">{new Date(child.birth_date).toLocaleDateString('id-ID')}</td>
                        <td className="px-4 py-3 capitalize">{child.gender}</td>
                        <td className="px-4 py-3 text-gray-600">{parent?.email || '-'}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedChildId(child.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {childrenTotalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Menampilkan {(childrenCurrentPage - 1) * itemsPerPage + 1} - {Math.min(childrenCurrentPage * itemsPerPage, filteredChildren.length)} dari {filteredChildren.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setChildrenCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={childrenCurrentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ← Sebelumnya
                </button>
                <span className="text-sm text-gray-700">
                  Halaman {childrenCurrentPage} dari {childrenTotalPages}
                </span>
                <button
                  onClick={() => setChildrenCurrentPage((p) => Math.min(p + 1, childrenTotalPages))}
                  disabled={childrenCurrentPage === childrenTotalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Selanjutnya →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'children' && selectedChildId !== null && selectedChild && (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedChildId(null)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Anak
          </button>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedChild.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tanggal Lahir</p>
                  <p className="text-base font-semibold text-gray-900">{new Date(selectedChild.birth_date).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-base font-semibold text-gray-900 capitalize">{selectedChild.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Parent</p>
                  <p className="text-base font-semibold text-gray-900">{selectedChildParent?.full_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Parent</p>
                  <p className="text-base font-semibold text-gray-900 truncate">{selectedChildParent?.email || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Riwayat Pertumbuhan ({selectedChildGrowth.length})
              </h4>
              {selectedChildGrowth.length === 0 ? (
                <p className="text-sm text-gray-500">Tidak ada data pertumbuhan</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {selectedChildGrowth.map((record) => (
                    <div key={record.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-600">{new Date(record.record_date).toLocaleDateString('id-ID')}</p>
                          <p className="text-gray-900 font-medium">
                            Tinggi: {record.height_cm} cm | Berat: {record.weight_kg} kg
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${record.status === 'Normal' ? 'bg-green-100 text-green-700' : record.status === 'Kurang' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {record.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Catatan Membaca ({selectedChildReading.length})
              </h4>
              {selectedChildReading.length === 0 ? (
                <p className="text-sm text-gray-500">Tidak ada catatan membaca</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {selectedChildReading.map((log) => (
                    <div key={log.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                      <p className="text-gray-900 font-medium">{log.book_title}</p>
                      <p className="text-gray-600 text-xs">{new Date(log.reading_date).toLocaleDateString('id-ID')} · {log.duration_minutes} menit</p>
                      {log.notes && <p className="text-gray-700 text-xs mt-1 italic">{log.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Pill className="w-5 h-5 text-purple-600" />
              Jadwal dan Status Imunisasi ({selectedChildImmunization.length})
            </h4>
            {selectedChildImmunization.length === 0 ? (
              <p className="text-sm text-gray-500">Tidak ada jadwal imunisasi</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-4 py-2">Vaksin</th>
                      <th className="px-4 py-2">Jadwal</th>
                      <th className="px-4 py-2">Tanggal Selesai</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedChildImmunization.map((record) => (
                      <tr key={record.id} className="border-t border-gray-100">
                        <td className="px-4 py-2 font-medium">{record.vaccine_name}</td>
                        <td className="px-4 py-2">{new Date(record.scheduled_date).toLocaleDateString('id-ID')}</td>
                        <td className="px-4 py-2">{record.completed_date ? new Date(record.completed_date).toLocaleDateString('id-ID') : '-'}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            record.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {record.completed ? 'Selesai' : 'Belum'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-600 text-xs">{record.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'stories' && (
        <div className="space-y-4">
          <form onSubmit={handleSubmitStory} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Manage Stories</h3>
              {editingStoryId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingStoryId(null);
                    setStoryForm(defaultStoryForm);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Judul"
                value={storyForm.title}
                onChange={(event) => setStoryForm((prev) => ({ ...prev, title: event.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Tema"
                value={storyForm.theme}
                onChange={(event) => setStoryForm((prev) => ({ ...prev, theme: event.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={storyForm.age_category}
                onChange={(event) =>
                  setStoryForm((prev) => ({ ...prev, age_category: event.target.value as StoryForm['age_category'] }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0-3">0-3</option>
                <option value="4-6">4-6</option>
                <option value="7-12">7-12</option>
              </select>
              <input
                type="url"
                placeholder="Image URL"
                value={storyForm.image_url}
                onChange={(event) => setStoryForm((prev) => ({ ...prev, image_url: event.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <textarea
              placeholder="Konten cerita"
              value={storyForm.content}
              onChange={(event) => setStoryForm((prev) => ({ ...prev, content: event.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <Plus className="w-4 h-4" />
              {editingStoryId ? 'Update Story' : 'Add Story'}
            </button>
          </form>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">Theme</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {stories.map((story) => (
                  <tr key={story.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{story.title}</td>
                    <td className="px-4 py-3">{story.age_category}</td>
                    <td className="px-4 py-3">{story.theme}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditStory(story)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStory(story.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          <Trash2 className="w-3 h-3" /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'mpasi' && (
        <div className="space-y-4">
          <form onSubmit={handleSubmitRecipe} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Manage MPASI Recipes</h3>
              {editingRecipeId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingRecipeId(null);
                    setRecipeForm(defaultRecipeForm);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Judul Resep"
                value={recipeForm.title}
                onChange={(event) => setRecipeForm((prev) => ({ ...prev, title: event.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={recipeForm.age_group}
                onChange={(event) =>
                  setRecipeForm((prev) => ({ ...prev, age_group: event.target.value as RecipeForm['age_group'] }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="6-8">6-8</option>
                <option value="8-10">8-10</option>
                <option value="10-12">10-12</option>
              </select>
              <input
                type="text"
                placeholder="Category"
                value={recipeForm.category}
                onChange={(event) => setRecipeForm((prev) => ({ ...prev, category: event.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <textarea
              placeholder="Ingredients (satu baris per bahan)"
              value={recipeForm.ingredients}
              onChange={(event) => setRecipeForm((prev) => ({ ...prev, ingredients: event.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />

            <textarea
              placeholder="Instructions (satu baris per langkah)"
              value={recipeForm.instructions}
              onChange={(event) => setRecipeForm((prev) => ({ ...prev, instructions: event.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nutrition Info"
                value={recipeForm.nutrition_info}
                onChange={(event) => setRecipeForm((prev) => ({ ...prev, nutrition_info: event.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Allergenic Warning"
                value={recipeForm.allergenic_warning}
                onChange={(event) => setRecipeForm((prev) => ({ ...prev, allergenic_warning: event.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="number"
                min={1}
                value={recipeForm.prep_time_minutes}
                onChange={(event) => setRecipeForm((prev) => ({ ...prev, prep_time_minutes: Number(event.target.value) }))}
                className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Prep Time (minutes)"
                required
              />
              <input
                type="number"
                min={1}
                value={recipeForm.servings}
                onChange={(event) => setRecipeForm((prev) => ({ ...prev, servings: Number(event.target.value) }))}
                className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Servings"
                required
              />
            </div>

            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <Plus className="w-4 h-4" />
              {editingRecipeId ? 'Update Recipe' : 'Add Recipe'}
            </button>
          </form>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((recipe) => (
                  <tr key={recipe.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{recipe.title}</td>
                    <td className="px-4 py-3">{recipe.age_group}</td>
                    <td className="px-4 py-3">{recipe.category}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditRecipe(recipe)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRecipe(recipe.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          <Trash2 className="w-3 h-3" /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Growth Summary</h3>
              <p className="text-sm text-gray-600">Rata-rata tinggi: <span className="font-semibold text-gray-900">{averageGrowth.avgHeight.toFixed(1)} cm</span></p>
              <p className="text-sm text-gray-600">Rata-rata berat: <span className="font-semibold text-gray-900">{averageGrowth.avgWeight.toFixed(1)} kg</span></p>
              <p className="text-sm text-gray-600">Total record: <span className="font-semibold text-gray-900">{growthRecords.length}</span></p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Immunization Coverage</h3>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                <div className="bg-green-500 h-3" style={{ width: `${immunizationCompletionRate}%` }} />
              </div>
              <p className="text-sm text-gray-600">Completion rate: <span className="font-semibold text-gray-900">{immunizationCompletionRate}%</span></p>
              <p className="text-sm text-gray-600">Total record: <span className="font-semibold text-gray-900">{immunizations.length}</span></p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Reading Logs (6 bulan terakhir)</h3>
            <div className="space-y-2">
              {monthlyReading.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada data membaca.</p>
              ) : (
                monthlyReading.map(([month, total]) => {
                  const maxValue = Math.max(...monthlyReading.map(([, value]) => value), 1);
                  const width = Math.round((total / maxValue) * 100);
                  return (
                    <div key={month} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{month}</span>
                        <span className="font-semibold">{total}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-blue-500 h-2" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">Export Data CSV</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  downloadCsv('children.csv', children.map((child) => ({
                    id: child.id,
                    user_id: child.user_id,
                    name: child.name,
                    birth_date: child.birth_date,
                    gender: child.gender,
                  })))
                }
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <Download className="w-4 h-4" /> Export Child Data
              </button>

              <button
                onClick={() =>
                  downloadCsv('growth_records.csv', growthRecords.map((record) => ({
                    id: record.id,
                    child_id: record.child_id,
                    record_date: record.record_date,
                    height_cm: record.height_cm,
                    weight_kg: record.weight_kg,
                    status: record.status,
                  })))
                }
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <Download className="w-4 h-4" /> Export Growth
              </button>

              <button
                onClick={() =>
                  downloadCsv('reading_logs.csv', readingLogs.map((log) => ({
                    id: log.id,
                    user_id: log.user_id,
                    child_id: log.child_id,
                    book_title: log.book_title,
                    reading_date: log.reading_date,
                    duration_minutes: log.duration_minutes,
                  })))
                }
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <Download className="w-4 h-4" /> Export Reading Logs
              </button>

              <button
                onClick={() =>
                  downloadCsv('immunization_records.csv', immunizations.map((record) => ({
                    id: record.id,
                    child_id: record.child_id,
                    vaccine_name: record.vaccine_name,
                    scheduled_date: record.scheduled_date,
                    completed: record.completed,
                    completed_date: record.completed_date,
                  })))
                }
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <Download className="w-4 h-4" /> Export Immunization
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
