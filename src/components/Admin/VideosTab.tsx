import { FormEvent, useState } from 'react';
import { supabase, Video } from '../../lib/supabase';
import { useSupabaseQuery } from '../../lib/swrHooks';
import { mutate } from 'swr';
import { adminKeys, SWR_KEYS } from '../../lib/swrKeys';
import { VideoForm, defaultVideoForm } from './types';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';

export function VideosTab() {
  const [videoForm, setVideoForm] = useState<VideoForm>(defaultVideoForm);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [draggedVideo, setDraggedVideo] = useState<string | null>(null);
  const [dragOverVideo, setDragOverVideo] = useState<string | null>(null);

  const { data: videos = [], isLoading } = useSupabaseQuery<Video[]>(
    adminKeys.VIDEOS,
    async () => {
      const { data } = await supabase.from('videos').select('*').order('display_order', { ascending: true });
      return data ?? [];
    }
  );

  const invalidateVideos = () => Promise.all([mutate(adminKeys.VIDEOS), mutate(SWR_KEYS.VIDEOS)]);

  const handleSubmitVideo = async (event: FormEvent) => {
    event.preventDefault();
    if (editingVideoId) {
      const { error } = await supabase.from('videos').update(videoForm).eq('id', editingVideoId);
      if (error) return;
    } else {
      const { error } = await supabase.from('videos').insert(videoForm);
      if (error) return;
    }
    setVideoForm(defaultVideoForm);
    setEditingVideoId(null);
    await invalidateVideos();
  };

  const handleEditVideo = (video: Video) => {
    setEditingVideoId(video.id);
    setVideoForm({
      youtube_id: video.youtube_id,
      title: video.title,
      description: video.description,
      display_order: video.display_order,
    });
  };

  const handleDeleteVideo = async (videoId: string) => {
    const confirmed = window.confirm('Delete this video?');
    if (!confirmed) return;
    const { error } = await supabase.from('videos').delete().eq('id', videoId);
    if (!error) await invalidateVideos();
  };

  const handleReorderVideos = async (reorderedVideos: Video[]) => {
    try {
      await Promise.all(
        reorderedVideos.map(video =>
          supabase.from('videos').update({ display_order: video.display_order }).eq('id', video.id)
        )
      );
      await invalidateVideos();
    } catch (error) {
      console.error('Error reordering videos:', error);
    }
  };

  const handleDragStart = (videoId: string) => setDraggedVideo(videoId);
  const handleDragOver = (e: React.DragEvent, videoId: string) => {
    e.preventDefault();
    setDragOverVideo(videoId);
  };
  const handleDragLeave = () => setDragOverVideo(null);
  const handleDragEnd = () => { setDraggedVideo(null); setDragOverVideo(null); };

  const handleDrop = (e: React.DragEvent, targetVideoId: string) => {
    e.preventDefault();
    if (!draggedVideo || draggedVideo === targetVideoId) {
      setDraggedVideo(null);
      setDragOverVideo(null);
      return;
    }
    const draggedIndex = videos.findIndex(v => v.id === draggedVideo);
    const targetIndex = videos.findIndex(v => v.id === targetVideoId);
    const newVideos = [...videos];
    const [movedVideo] = newVideos.splice(draggedIndex, 1);
    newVideos.splice(targetIndex, 0, movedVideo);
    const updatedVideos = newVideos.map((video, index) => ({ ...video, display_order: index + 1 }));
    handleReorderVideos(updatedVideos);
    setDraggedVideo(null);
    setDragOverVideo(null);
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmitVideo} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Manage Videos</h3>
          {editingVideoId && (
            <button
              type="button"
              onClick={() => { setEditingVideoId(null); setVideoForm(defaultVideoForm); }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel Edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="YouTube ID (e.g., dQw4w9WgXcQ)"
            value={videoForm.youtube_id}
            onChange={(event) => setVideoForm({ ...videoForm, youtube_id: event.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            placeholder="Display Order"
            value={videoForm.display_order}
            onChange={(event) => setVideoForm({ ...videoForm, display_order: parseInt(event.target.value) || 0 })}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <input
          type="text"
          placeholder="Judul Video"
          value={videoForm.title}
          onChange={(event) => setVideoForm({ ...videoForm, title: event.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <textarea
          placeholder="Deskripsi Video"
          value={videoForm.description}
          onChange={(event) => setVideoForm({ ...videoForm, description: event.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" />
          {editingVideoId ? 'Update Video' : 'Add Video'}
        </button>
      </form>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-2 bg-blue-50 border-b border-gray-200">
          <p className="text-sm text-blue-700 font-medium">💡 Tip: Drag videos by the grip icon to reorder them</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: '600px' }}>
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 w-8"></th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">YouTube ID</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr
                key={video.id}
                draggable
                onDragStart={() => handleDragStart(video.id)}
                onDragOver={(e) => handleDragOver(e, video.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, video.id)}
                onDragEnd={handleDragEnd}
                className={`border-t border-gray-100 transition cursor-move ${
                  draggedVideo === video.id
                    ? 'opacity-50 bg-gray-100'
                    : dragOverVideo === video.id
                    ? 'bg-blue-50 border-t-2 border-blue-400'
                    : ''
                }`}
              >
                <td className="px-4 py-3 text-gray-400 hover:text-gray-600">
                  <GripVertical className="w-4 h-4" />
                </td>
                <td className="px-4 py-3 font-medium">{video.title}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{video.youtube_id}</td>
                <td className="px-4 py-3 font-semibold text-blue-600">{video.display_order}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{video.description.substring(0, 50)}{video.description.length > 50 ? '...' : ''}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditVideo(video)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
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
        {videos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No videos yet. Add one to get started!
          </div>
        )}
      </div>
    </div>
  );
}
