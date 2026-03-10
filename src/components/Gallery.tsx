import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSupabaseQuery, mutate } from '../lib/swrHooks';
import { userScopedKeys } from '../lib/swrKeys';
import { Image as ImageIcon, Plus, Calendar, X, Trash2, User, Grid3x3, Grid2x2, LayoutGrid } from 'lucide-react';
import {
  buildActivityPhotoStoragePath,
  deletePhotoFromStorage,
  getFileExtensionFromMimeType,
  getPublicPhotoUrl,
  getStoragePathFromPhoto,
  validateSourcePhoto,
  uploadPhotoToStorage,
} from '../lib/storage';
import { transformPhotoForUpload } from '../lib/imageTransform';

export function Gallery() {
  const { user } = useAuth();
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmittingPhoto, setIsSubmittingPhoto] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [openPersonIconId, setOpenPersonIconId] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<{ [key: string]: any }>({});
  const [viewMode, setViewMode] = useState<'compact' | 'standard' | 'spacious'>(() => {
    const saved = localStorage.getItem('galleryViewMode');
    if (saved && ['compact', 'standard', 'spacious'].includes(saved)) {
      return saved as 'compact' | 'standard' | 'spacious';
    }
    return 'standard';
  });

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

  const { data: photosData = [] } = useSupabaseQuery(
    user ? userScopedKeys(user.id).ACTIVITY_PHOTOS : null,
    async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('activity_photos')
        .select('*')
        .order('activity_date', { ascending: false });
      return data || [];
    }
  );

  // Normalize photos to ensure photo_url is set
  const photos = photosData.map((photo: any) => {
    if (photo.photo_url) return photo;
    if (photo.storage_path) {
      return {
        ...photo,
        photo_url: getPublicPhotoUrl(photo.storage_path),
      };
    }
    return photo;
  });

  const [newPhoto, setNewPhoto] = useState({
    child_id: '',
    file: null as File | null,
    caption: '',
    activity_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    localStorage.setItem('galleryViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Initialize newPhoto when children load
  useEffect(() => {
    if (children.length > 0 && !newPhoto.child_id) {
      setNewPhoto((prev) => ({
        ...prev,
        child_id: children[0].id,
      }));
    }
  }, [children]);

  useEffect(() => {
    const fetchAllUserProfiles = async () => {
      const uniqueUserIds = [...new Set(photos.map((p: any) => p.user_id))];
      for (const userId of uniqueUserIds) {
        if (!userProfiles[userId]) {
          await fetchUserProfile(userId);
        }
      }
    };
    if (photos.length > 0) {
      void fetchAllUserProfiles();
    }
  }, [photos]);

  const resetAddPhotoState = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl('');
    setSelectedFileName('');
    setNewPhoto({
      child_id: children[0]?.id || '',
      file: null,
      caption: '',
      activity_date: new Date().toISOString().split('T')[0],
    });
  };

  const toggleAddPhoto = () => {
    setActionError('');
    setActionSuccess('');

    if (showAddPhoto) {
      resetAddPhotoState();
      setShowAddPhoto(false);
      return;
    }

    setNewPhoto((prev) => ({
      ...prev,
      child_id: prev.child_id || children[0]?.id || '',
    }));
    setShowAddPhoto(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setActionError('');
    setActionSuccess('');

    if (!file) {
      setNewPhoto((prev) => ({ ...prev, file: null }));
      setSelectedFileName('');
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
      }
      return;
    }

    const validationError = validateSourcePhoto(file);
    if (validationError) {
      setActionError(validationError);
      e.target.value = '';
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);
    setSelectedFileName(file.name);
    setNewPhoto((prev) => ({ ...prev, file }));
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPhoto.file || isSubmittingPhoto) return;

    setActionError('');
    setActionSuccess('');
    setIsSubmittingPhoto(true);

    const validationError = validateSourcePhoto(newPhoto.file);
    if (validationError) {
      setActionError(validationError);
      setIsSubmittingPhoto(false);
      return;
    }

    let insertedPhotoId: string | null = null;
    let uploadedStoragePath: string | null = null;

    try {
      const transformed = await transformPhotoForUpload(newPhoto.file);
      const extension = getFileExtensionFromMimeType(transformed.file.type);

      const { data: insertedPhoto, error: insertError } = await supabase
        .from('activity_photos')
        .insert({
          user_id: user.id,
          child_id: newPhoto.child_id || null,
          photo_url: '',
          caption: newPhoto.caption,
          activity_date: newPhoto.activity_date,
        })
        .select('id')
        .single();

      if (insertError || !insertedPhoto) {
        throw new Error(insertError?.message || 'Gagal menyimpan data foto.');
      }

      const photoId = insertedPhoto.id;
      insertedPhotoId = photoId;
      const storagePath = buildActivityPhotoStoragePath(user.id, photoId, extension);
      uploadedStoragePath = storagePath;

      const uploadError = await uploadPhotoToStorage(storagePath, transformed.file);
      if (uploadError) {
        throw new Error(uploadError);
      }

      const publicUrl = getPublicPhotoUrl(storagePath);
      const { error: updateError } = await supabase
        .from('activity_photos')
        .update({
          photo_url: publicUrl,
          storage_path: storagePath,
        })
        .eq('id', photoId);

      if (updateError) {
        throw new Error(updateError.message || 'Gagal memperbarui metadata foto.');
      }

      setActionSuccess('Foto berhasil diunggah dan dioptimalkan.');
      resetAddPhotoState();
      setShowAddPhoto(false);
      // Invalidate activity photos cache
      await mutate(userScopedKeys(user.id).ACTIVITY_PHOTOS);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengunggah foto.';

      if (uploadedStoragePath) {
        await deletePhotoFromStorage(uploadedStoragePath);
      }

      if (insertedPhotoId) {
        await supabase.from('activity_photos').delete().eq('id', insertedPhotoId);
      }

      setActionError(message);
    } finally {
      setIsSubmittingPhoto(false);
    }
  };

  const getChildName = (childId: string | null) => {
    if (!childId) return 'Keluarga';
    return children.find(c => c.id === childId)?.name || 'Anak';
  };

  const isPhotoOwner = (photoUserId: string) => {
    return user?.id === photoUserId;
  };

  const fetchUserProfile = async (userId: string) => {
    if (userProfiles[userId]) {
      return userProfiles[userId];
    }

    const { data } = await supabase
      .from('user_profiles')
      .select('full_name, email')
      .eq('id', userId)
      .single();

    if (data) {
      setUserProfiles((prev) => ({ ...prev, [userId]: data }));
      return data;
    }

    return null;
  };

  const getPhotoOwnerNameSync = (userId: string) => {
    const profile = userProfiles[userId];
    return profile?.full_name || profile?.email?.split('@')[0] || 'User';
  };

  const handleDeletePhoto = async () => {
    if (!selectedPhoto || !user || !isPhotoOwner(selectedPhoto.user_id)) {
      setActionError('Anda hanya dapat menghapus foto Anda sendiri.');
      return;
    }

    setActionError('');

    const storagePath = selectedPhoto.storage_path || getStoragePathFromPhoto(selectedPhoto.photo_url);
    if (storagePath) {
      const storageDeleteError = await deletePhotoFromStorage(storagePath);
      if (storageDeleteError) {
        setActionError(`Gagal menghapus file di storage: ${storageDeleteError}`);
        return;
      }
    }

    const { error } = await supabase
      .from('activity_photos')
      .delete()
      .eq('id', selectedPhoto.id);

    if (!error) {
      setSelectedPhoto(null);
      setShowDeleteConfirm(false);
      setActionSuccess('Foto berhasil dihapus.');
      // Invalidate activity photos cache
      await mutate(userScopedKeys(user.id).ACTIVITY_PHOTOS);
      return;
    }

    setActionError(error.message || 'Gagal menghapus data foto.');
  };

  return (
    <div className="gap-y-6 flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ImageIcon className="w-7 h-7 text-green-600" />
          Galeri <span className="hidden sm:block">Kegiatan</span>
        </h2>
        <button
          onClick={toggleAddPhoto}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <Plus className="w-5 h-5" />
          Tambah Foto
        </button>
      </div>

      <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1 gap-1 w-fit">
        <button
          onClick={() => setViewMode('compact')}
          className={`p-2 rounded-md transition ${
            viewMode === 'compact' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Tampilan Kompak"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode('standard')}
          className={`p-2 rounded-md transition ${
            viewMode === 'standard' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Tampilan Standar"
        >
          <Grid3x3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode('spacious')}
          className={`p-2 rounded-md transition hidden md:block ${
            viewMode === 'spacious' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Tampilan Luas"
        >
          <Grid2x2 className="w-4 h-4" />
        </button>
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {actionSuccess}
        </div>
      )}

      {showAddPhoto && (
        <form onSubmit={handleAddPhoto} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Foto
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Format didukung: JPG, PNG, WebP. Ukuran maksimal 5 MB. Foto akan dioptimalkan otomatis sebelum disimpan.
            </p>
            {selectedFileName && (
              <p className="text-sm text-gray-700 mt-2">File terpilih: {selectedFileName}</p>
            )}
            {previewUrl && (
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 w-full max-w-xs">
                <img src={previewUrl} alt="Preview upload" className="w-full h-40 object-cover" />
              </div>
            )}
          </div>

          {children.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anak (opsional)
              </label>
              <select
                value={newPhoto.child_id}
                onChange={(e) => setNewPhoto((prev) => ({ ...prev, child_id: e.target.value }))}
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
              onChange={(e) => setNewPhoto((prev) => ({ ...prev, activity_date: e.target.value }))}
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
              onChange={(e) => setNewPhoto((prev) => ({ ...prev, caption: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmittingPhoto}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingPhoto ? 'Mengunggah...' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={toggleAddPhoto}
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
        <div className={`grid gap-4 ${
          viewMode === 'compact' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3' :
          viewMode === 'spacious' ? 'grid-cols-1 sm:grid-cols-2 gap-6' :
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {photos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <div className="aspect-square relative bg-gray-100 group">
                <img
                  src={photo.photo_url}
                  alt={photo.caption}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.pexels.com/photos/1888015/pexels-photo-1888015.jpeg?auto=compress&cs=tinysrgb&w=400';
                  }}
                />
                <div className="absolute bottom-0 left-0 p-2">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenPersonIconId(openPersonIconId === photo.id ? null : photo.id);
                      }}
                      className="p-2 bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full transition"
                      title="Lihat anak yang ditag"
                    >
                      <User className="w-4 h-4 text-white" />
                    </button>
                    {openPersonIconId === photo.id && (
                      <div className="absolute left-12 bottom-2 bg-gray-900 text-white text-xs rounded px-3 py-1.5 whitespace-nowrap shadow-lg animate-in slide-in-from-left-2 duration-200">
                        {getChildName(photo.child_id)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {getPhotoOwnerNameSync(photo.user_id)}
                  </span>
                </div>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(photo.activity_date).toLocaleDateString('id-ID')}
                </span>
                {photo.caption && (
                  <p className={`text-sm text-gray-700 mt-2 ${
                    viewMode === 'compact' ? 'line-clamp-1' : 'line-clamp-2'
                  }`}>{photo.caption}</p>
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
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedPhoto ? getPhotoOwnerNameSync(selectedPhoto.user_id) : 'User'}
                </h3>
                {selectedPhoto?.child_id && (
                  <p className="text-xs text-gray-500">Bersama {getChildName(selectedPhoto.child_id)}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isPhotoOwner(selectedPhoto?.user_id || '') && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                    title="Hapus foto"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
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
