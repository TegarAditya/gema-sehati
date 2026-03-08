import { FormEvent } from 'react';
import { Video } from '../../lib/supabase';
import { VideoForm } from './types';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface VideosTabProps {
  videos: Video[];
  videoForm: VideoForm;
  editingVideoId: string | null;
  onSubmitVideo: (event: FormEvent) => void;
  onEditVideo: (video: Video) => void;
  onDeleteVideo: (videoId: string) => void;
  onVideoFormChange: (form: VideoForm) => void;
  onCancelEdit: () => void;
}

export function VideosTab({
  videos,
  videoForm,
  editingVideoId,
  onSubmitVideo,
  onEditVideo,
  onDeleteVideo,
  onVideoFormChange,
  onCancelEdit,
}: VideosTabProps) {
  return (
    <div className="space-y-4">
      <form onSubmit={onSubmitVideo} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Manage Videos</h3>
          {editingVideoId && (
            <button
              type="button"
              onClick={onCancelEdit}
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
            onChange={(event) => onVideoFormChange({ ...videoForm, youtube_id: event.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            placeholder="Display Order"
            value={videoForm.display_order}
            onChange={(event) => onVideoFormChange({ ...videoForm, display_order: parseInt(event.target.value) || 0 })}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <input
          type="text"
          placeholder="Judul Video"
          value={videoForm.title}
          onChange={(event) => onVideoFormChange({ ...videoForm, title: event.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <textarea
          placeholder="Deskripsi Video"
          value={videoForm.description}
          onChange={(event) => onVideoFormChange({ ...videoForm, description: event.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" />
          {editingVideoId ? 'Update Video' : 'Add Video'}
        </button>
      </form>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">YouTube ID</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{video.title}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{video.youtube_id}</td>
                <td className="px-4 py-3">{video.display_order}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{video.description.substring(0, 50)}{video.description.length > 50 ? '...' : ''}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditVideo(video)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => onDeleteVideo(video.id)}
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
        {videos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No videos yet. Add one to get started!
          </div>
        )}
      </div>
    </div>
  );
}
