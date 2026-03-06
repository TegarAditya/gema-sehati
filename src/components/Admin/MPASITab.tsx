import { FormEvent } from 'react';
import { MPASIRecipe } from '../../lib/supabase';
import { RecipeForm } from './types';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface MPASITabProps {
  recipes: MPASIRecipe[];
  recipeForm: RecipeForm;
  editingRecipeId: string | null;
  onSubmitRecipe: (event: FormEvent) => void;
  onEditRecipe: (recipe: MPASIRecipe) => void;
  onDeleteRecipe: (recipeId: string) => void;
  onRecipeFormChange: (form: RecipeForm) => void;
  onCancelEdit: () => void;
}

export function MPASITab({
  recipes,
  recipeForm,
  editingRecipeId,
  onSubmitRecipe,
  onEditRecipe,
  onDeleteRecipe,
  onRecipeFormChange,
  onCancelEdit,
}: MPASITabProps) {
  return (
    <div className="space-y-4">
      <form onSubmit={onSubmitRecipe} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Manage MPASI Recipes</h3>
          {editingRecipeId && (
            <button
              type="button"
              onClick={onCancelEdit}
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
            onChange={(event) => onRecipeFormChange({ ...recipeForm, title: event.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <select
            value={recipeForm.age_group}
            onChange={(event) =>
              onRecipeFormChange({ ...recipeForm, age_group: event.target.value as RecipeForm['age_group'] })
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
            onChange={(event) => onRecipeFormChange({ ...recipeForm, category: event.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <textarea
          placeholder="Ingredients (satu baris per bahan)"
          value={recipeForm.ingredients}
          onChange={(event) => onRecipeFormChange({ ...recipeForm, ingredients: event.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          required
        />

        <textarea
          placeholder="Instructions (satu baris per langkah)"
          value={recipeForm.instructions}
          onChange={(event) => onRecipeFormChange({ ...recipeForm, instructions: event.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Nutrition Info"
            value={recipeForm.nutrition_info}
            onChange={(event) => onRecipeFormChange({ ...recipeForm, nutrition_info: event.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Allergenic Warning"
            value={recipeForm.allergenic_warning}
            onChange={(event) => onRecipeFormChange({ ...recipeForm, allergenic_warning: event.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="number"
            min={1}
            value={recipeForm.prep_time_minutes}
            onChange={(event) => onRecipeFormChange({ ...recipeForm, prep_time_minutes: Number(event.target.value) })}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Prep Time (minutes)"
            required
          />
          <input
            type="number"
            min={1}
            value={recipeForm.servings}
            onChange={(event) => onRecipeFormChange({ ...recipeForm, servings: Number(event.target.value) })}
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
                      onClick={() => onEditRecipe(recipe)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => onDeleteRecipe(recipe.id)}
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
  );
}
