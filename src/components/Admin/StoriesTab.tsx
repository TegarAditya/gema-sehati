import { FormEvent, useState } from 'react';
import { supabase, Story } from '../../lib/supabase';
import { useSupabaseQuery } from '../../lib/swrHooks';
import { mutate } from 'swr';
import { adminKeys, SWR_KEYS } from '../../lib/swrKeys';
import { StoryForm, defaultStoryForm } from './types';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export function StoriesTab() {
  const [storyForm, setStoryForm] = useState<StoryForm>(defaultStoryForm);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);

  const { data: stories = [], isLoading } = useSupabaseQuery<Story[]>(
    adminKeys.STORIES,
    async () => {
      const { data } = await supabase.from('stories').select('*').order('created_at', { ascending: false });
      return data ?? [];
    }
  );

  const invalidateStories = () => Promise.all([mutate(adminKeys.STORIES), mutate(SWR_KEYS.STORIES)]);

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
    await invalidateStories();
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
    if (!error) await invalidateStories();
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
      <form onSubmit={handleSubmitStory} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Manage Stories</h3>
          {editingStoryId && (
            <button
              type="button"
              onClick={() => { setEditingStoryId(null); setStoryForm(defaultStoryForm); }}
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
            onChange={(event) => setStoryForm({ ...storyForm, title: event.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Tema"
            value={storyForm.theme}
            onChange={(event) => setStoryForm({ ...storyForm, theme: event.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={storyForm.age_category}
            onChange={(event) =>
              setStoryForm({ ...storyForm, age_category: event.target.value as StoryForm['age_category'] })
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
            onChange={(event) => setStoryForm({ ...storyForm, image_url: event.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <textarea
          placeholder="Konten cerita"
          value={storyForm.content}
          onChange={(event) => setStoryForm({ ...storyForm, content: event.target.value })}
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
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
    </div>
  );
}
