import { useState, useEffect } from 'react';
import { supabase, Story } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSupabaseQuery, mutate } from '../lib/swrHooks';
import { SWR_KEYS, userScopedKeys } from '../lib/swrKeys';
import { Book, Plus, Clock, Calendar, BookOpen, Sparkles } from 'lucide-react';

export function Literacy() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'logs' | 'stories'>('logs');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showAddLog, setShowAddLog] = useState(false);

  // SWR queries
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

  const { data: readingLogs = [] } = useSupabaseQuery(
    user ? userScopedKeys(user.id).READING_LOGS : null,
    async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('reading_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('reading_date', { ascending: false });
      return data || [];
    }
  );

  const { data: stories = [] } = useSupabaseQuery(
    SWR_KEYS.STORIES,
    async () => {
      const { data } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });
      return data || [];
    }
  );

  const [newLog, setNewLog] = useState({
    child_id: '',
    book_title: '',
    reading_date: new Date().toISOString().split('T')[0],
    duration_minutes: 15,
    notes: '',
  });

  // Initialize child_id when children change
  useEffect(() => {
    if (children.length > 0 && !newLog.child_id) {
      setNewLog((prev) => ({ ...prev, child_id: children[0].id }));
    }
  }, [children, newLog.child_id]);

  const handleAddLog = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    if (!user || !newLog.child_id) return;

    const { error } = await supabase
      .from('reading_logs')
      .insert({
        user_id: user.id,
        ...newLog,
      });

    if (!error) {
      setNewLog({
        child_id: children[0]?.id || '',
        book_title: '',
        reading_date: new Date().toISOString().split('T')[0],
        duration_minutes: 15,
        notes: '',
      });
      setShowAddLog(false);
      // Invalidate reading logs cache to fetch fresh data
      await mutate(userScopedKeys(user.id).READING_LOGS);
    }
  };

  const getChildName = (childId: string) => {
    return children.find(c => c.id === childId)?.name || 'Anak';
  };

  if (selectedStory) {
    return (
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => setSelectedStory(null)}
          className="mb-4 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
        >
          ← Kembali ke Daftar
        </button>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {selectedStory.image_url && (
            <img
              src={selectedStory.image_url}
              alt={selectedStory.title}
              className="w-full h-48 object-cover rounded-xl mb-6"
            />
          )}
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              Usia {selectedStory.age_category} tahun
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              {selectedStory.theme}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{selectedStory.title}</h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedStory.content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Book className="w-7 h-7 text-blue-600" />
          Literasi Keluarga
        </h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'logs'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BookOpen className="w-5 h-5 inline mr-2" />
            Catatan Membaca
          </button>
          <button
            onClick={() => setActiveTab('stories')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'stories'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Sparkles className="w-5 h-5 inline mr-2" />
            Pojok Dongeng
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'logs' && (
            <div className="space-y-4">
              {children.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Tambahkan data anak terlebih dahulu di halaman Beranda</p>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowAddLog(!showAddLog)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Catat Aktivitas Membaca
                  </button>

                  {showAddLog && (
                    <form onSubmit={handleAddLog} className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <select
                        value={newLog.child_id}
                        onChange={(e) => setNewLog({ ...newLog, child_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                      >
                        {children.map(child => (
                          <option key={child.id} value={child.id}>{child.name}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="Judul buku"
                        value={newLog.book_title}
                        onChange={(e) => setNewLog({ ...newLog, book_title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                      />

                      <input
                        type="date"
                        value={newLog.reading_date}
                        onChange={(e) => setNewLog({ ...newLog, reading_date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Durasi (menit): {newLog.duration_minutes}
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="120"
                          step="5"
                          value={newLog.duration_minutes}
                          onChange={(e) => setNewLog({ ...newLog, duration_minutes: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>

                      <textarea
                        placeholder="Catatan (opsional)"
                        value={newLog.notes}
                        onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        rows={3}
                      />

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddLog(false)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                          Batal
                        </button>
                      </div>
                    </form>
                  )}

                  {readingLogs.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Belum ada catatan membaca</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {readingLogs.map((log) => (
                        <div key={log.id} className="bg-white border border-gray-200 rounded-xl p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{log.book_title}</h4>
                              <p className="text-sm text-blue-600">{getChildName(log.child_id)}</p>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              {log.duration_minutes} menit
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(log.reading_date).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          {log.notes && (
                            <p className="mt-2 text-sm text-gray-600 italic">{log.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'stories' && (
            <div className="space-y-4">
              {stories.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Belum ada dongeng tersedia</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stories.map((story) => (
                    <div
                      key={story.id}
                      onClick={() => setSelectedStory(story)}
                      className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition"
                    >
                      {story.image_url && (
                        <img
                          src={story.image_url}
                          alt={story.title}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {story.age_category} tahun
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          {story.theme}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900">{story.title}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{story.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
