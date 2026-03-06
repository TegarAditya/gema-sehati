import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Child, GrowthRecord, ImmunizationRecord, MPASIRecipe, ReadingLog, Story, UserProfile } from '../../lib/supabase';
import { Shield, Users, BookOpen, ChefHat, BarChart3, Baby } from 'lucide-react';
import { AdminTab, StoryForm, RecipeForm, defaultStoryForm, defaultRecipeForm } from './types';
import { OverviewTab } from './OverviewTab';
import { UsersTab } from './UsersTab';
import { ChildrenTab } from './ChildrenTab';
import { StoriesTab } from './StoriesTab';
import { MPASITab } from './MPASITab';
import { AnalyticsTab } from './AnalyticsTab';

const itemsPerPage = 10;

export function Admin() {
  const { isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [usersSearchQuery, setUsersSearchQuery] = useState('');
  const [usersCurrentPage, setUsersCurrentPage] = useState(1);
  const [childrenSearchQuery, setChildrenSearchQuery] = useState('');
  const [childrenCurrentPage, setChildrenCurrentPage] = useState(1);

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
        <OverviewTab
          users={users}
          children={children}
          readingLogs={readingLogs}
          immunizations={immunizations}
        />
      )}

      {activeTab === 'users' && (
        <UsersTab
          users={users}
          children={children}
          searchQuery={usersSearchQuery}
          onSearchChange={setUsersSearchQuery}
          currentPage={usersCurrentPage}
          onPageChange={setUsersCurrentPage}
          itemsPerPage={itemsPerPage}
          onToggleUserActive={handleToggleUserActive}
        />
      )}

      {activeTab === 'children' && (
        <ChildrenTab
          children={children}
          users={users}
          growthRecords={growthRecords}
          readingLogs={readingLogs}
          immunizations={immunizations}
          searchQuery={childrenSearchQuery}
          onSearchChange={setChildrenSearchQuery}
          currentPage={childrenCurrentPage}
          onPageChange={setChildrenCurrentPage}
          itemsPerPage={itemsPerPage}
          selectedChildId={selectedChildId}
          onSelectChild={setSelectedChildId}
        />
      )}

      {activeTab === 'stories' && (
        <StoriesTab
          stories={stories}
          storyForm={storyForm}
          editingStoryId={editingStoryId}
          onSubmitStory={handleSubmitStory}
          onEditStory={handleEditStory}
          onDeleteStory={handleDeleteStory}
          onStoryFormChange={setStoryForm}
          onCancelEdit={() => {
            setEditingStoryId(null);
            setStoryForm(defaultStoryForm);
          }}
        />
      )}

      {activeTab === 'mpasi' && (
        <MPASITab
          recipes={recipes}
          recipeForm={recipeForm}
          editingRecipeId={editingRecipeId}
          onSubmitRecipe={handleSubmitRecipe}
          onEditRecipe={handleEditRecipe}
          onDeleteRecipe={handleDeleteRecipe}
          onRecipeFormChange={setRecipeForm}
          onCancelEdit={() => {
            setEditingRecipeId(null);
            setRecipeForm(defaultRecipeForm);
          }}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsTab
          growthRecords={growthRecords}
          immunizations={immunizations}
          readingLogs={readingLogs}
          children={children}
        />
      )}
    </div>
  );
}
