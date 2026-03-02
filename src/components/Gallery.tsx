import { useEffect, useState } from 'react';
import { supabase, Child, ActivityPhoto } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Image as ImageIcon, Plus, Calendar, X, Trash2 } from 'lucide-react';

export function Gallery() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [photos, setPhotos] = useState<ActivityPhoto[]>([]);
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ActivityPhoto | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [newPhoto, setNewPhoto] = useState({
    child_id: '',
    photo_url: '',
    caption: '',
    activity_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    const { data: childrenData } = await supabase
      .from('children')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (childrenData) {
      setChildren(childrenData);
      if (childrenData.length > 0 && !newPhoto.child_id) {
        setNewPhoto({ ...newPhoto, child_id: childrenData[0].id });
      }
    }

    const { data: photosData } = await supabase
      .from('activity_photos')
      .select('*')
      .eq('user_id', user.id)
      .order('activity_date', { ascending: false });

    if (photosData) setPhotos(photosData);
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPhoto.photo_url) return;

    const { error } = await supabase
      .from('activity_photos')
      .insert({
        user_id: user.id,
        child_id: newPhoto.child_id || null,
        photo_url: newPhoto.photo_url,
        caption: newPhoto.caption,
        activity_date: newPhoto.activity_date,
      });

    if (!error) {
      setNewPhoto({
        child_id: children[0]?.id || '',
        photo_url: '',
        caption: '',
        activity_date: new Date().toISOString().split('T')[0],
      });
      setShowAddPhoto(false);
      loadData();
    }
  };

  const getChildName = (childId: string | null) => {
    if (!childId) return 'Keluarga';
    return children.find(c => c.id === childId)?.name || 'Anak';
  };

  const handleDeletePhoto = async () => {
    if (!selectedPhoto) return;

    const { error } = await supabase
      .from('activity_photos')
      .delete()
      .eq('id', selectedPhoto.id);

    if (!error) {
      setSelectedPhoto(null);
      setShowDeleteConfirm(false);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ImageIcon className="w-7 h-7 text-green-600" />
          Galeri <span className="hidden sm:block">Kegiatan</span>
        </h2>
        <button
          onClick={() => setShowAddPhoto(!showAddPhoto)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <Plus className="w-5 h-5" />
          Tambah Foto
        </button>
      </div>

      {showAddPhoto && (
        <form onSubmit={handleAddPhoto} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Foto
            </label>
            <input
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={newPhoto.photo_url}
              onChange={(e) => setNewPhoto({ ...newPhoto, photo_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Gunakan link foto dari Pexels, Unsplash, atau layanan hosting gambar lainnya
            </p>
          </div>

          {children.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anak (opsional)
              </label>
              <select
                value={newPhoto.child_id}
                onChange={(e) => setNewPhoto({ ...newPhoto, child_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Kegiatan Keluarga</option>
                {children.map(child => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Kegiatan
            </label>
            <input
              type="date"
              value={newPhoto.activity_date}
              onChange={(e) => setNewPhoto({ ...newPhoto, activity_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caption
            </label>
            <textarea
              placeholder="Ceritakan tentang kegiatan ini..."
              value={newPhoto.caption}
              onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => setShowAddPhoto(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {photos.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada foto</h3>
          <p className="text-gray-600">Mulai dokumentasikan kegiatan keluarga Anda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <div className="aspect-square relative bg-gray-100">
                <img
                  src={photo.photo_url}
                  alt={photo.caption}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.pexels.com/photos/1648387/pexels-photo-1648387.jpeg?auto=compress&cs=tinysrgb&w=400';
                  }}
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {getChildName(photo.child_id)}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(photo.activity_date).toLocaleDateString('id-ID')}
                  </span>
                </div>
                {photo.caption && (
                  <p className="text-sm text-gray-700 line-clamp-2">{photo.caption}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{getChildName(selectedPhoto.child_id)}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                  title="Hapus foto"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <img
                src={selectedPhoto.photo_url}
                alt={selectedPhoto.caption}
                className="w-full rounded-xl mb-4"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.pexels.com/photos/1648387/pexels-photo-1648387.jpeg?auto=compress&cs=tinysrgb&w=800';
                }}
              />
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <Calendar className="w-4 h-4" />
                {new Date(selectedPhoto.activity_date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              {selectedPhoto.caption && (
                <p className="text-gray-700">{selectedPhoto.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Hapus Foto?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus foto ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleDeletePhoto}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
