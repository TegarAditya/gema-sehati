import { FormEvent, useState } from 'react';
import { supabase, MPASIRecipe } from '../../lib/supabase';
import { useSupabaseQuery } from '../../lib/swrHooks';
import { mutate } from 'swr';
import { adminKeys, SWR_KEYS } from '../../lib/swrKeys';
import { RecipeForm, defaultRecipeForm } from './types';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export function MPASITab() {
  const [recipeForm, setRecipeForm] = useState<RecipeForm>(defaultRecipeForm);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);

  const { data: recipes = [], isLoading } = useSupabaseQuery<MPASIRecipe[]>(
    adminKeys.MPASI_RECIPES,
    async () => {
      const { data } = await supabase.from('mpasi_recipes').select('*').order('created_at', { ascending: false });
      return data ?? [];
    }
  );

  // Also invalidate compound age-group keys: ['mpasi-recipes', '6-8'] etc. used by the public MPASI component
  const invalidateRecipes = async () => {
    await mutate(adminKeys.MPASI_RECIPES);
    await mutate((k: unknown) => Array.isArray(k) && k[0] === SWR_KEYS.MPASI_RECIPES);
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
    await invalidateRecipes();
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
    if (!error) await invalidateRecipes();
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
      <form onSubmit={handleSubmitRecipe} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Manage MPASI Recipes</h3>
          {editingRecipeId && (
            <button
              type="button"
              onClick={() => { setEditingRecipeId(null); setRecipeForm(defaultRecipeForm); }}
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
            onChange={(event) => setRecipeForm({ ...recipeForm, title: event.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <select
            value={recipeForm.age_group}
            onChange={(event) =>
              setRecipeForm({ ...recipeForm, age_group: event.target.value as RecipeForm['age_group'] })
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
            onChange={(event) => setRecipeForm({ ...recipeForm, category: event.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <textarea
          placeholder="Ingredients (satu baris per bahan)"
          value={recipeForm.ingredients}
          onChange={(event) => setRecipeForm({ ...recipeForm, ingredients: event.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          required
        />

        <textarea
          placeholder="Instructions (satu baris per langkah)"
          value={recipeForm.instructions}
          onChange={(event) => setRecipeForm({ ...recipeForm, instructions: event.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Nutrition Info"
            value={recipeForm.nutrition_info}
            onChange={(event) => setRecipeForm({ ...recipeForm, nutrition_info: event.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Allergenic Warning"
            value={recipeForm.allergenic_warning}
            onChange={(event) => setRecipeForm({ ...recipeForm, allergenic_warning: event.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="number"
            min={1}
            value={recipeForm.prep_time_minutes}
            onChange={(event) => setRecipeForm({ ...recipeForm, prep_time_minutes: Number(event.target.value) })}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Prep Time (minutes)"
            required
          />
          <input
            type="number"
            min={1}
            value={recipeForm.servings}
            onChange={(event) => setRecipeForm({ ...recipeForm, servings: Number(event.target.value) })}
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
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
    </div>
  );
}
