import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useSupabaseQuery } from '../lib/swrHooks';
import { SWR_KEYS } from '../lib/swrKeys';
import { ChefHat, Clock, Users, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

export function MPASI() {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'6-8' | '8-10' | '10-12'>('6-8');
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  // SWR query with age_group-specific key for proper caching
  const { data: recipes = [], isLoading } = useSupabaseQuery(
    [SWR_KEYS.MPASI_RECIPES, selectedAgeGroup],
    async () => {
      const { data } = await supabase
        .from('mpasi_recipes')
        .select('*')
        .eq('age_group', selectedAgeGroup)
        .order('category', { ascending: true });
      return data || [];
    }
  );

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Puree': 'bg-orange-100 text-orange-700',
      'Porridge': 'bg-yellow-100 text-yellow-700',
      'Finger Food': 'bg-green-100 text-green-700',
      'Snack': 'bg-pink-100 text-pink-700',
      'Soup': 'bg-blue-100 text-blue-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ChefHat className="w-6 h-6 text-orange-600" />
          Resep MPASI
        </h3>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>MPASI</strong> (Makanan Pengganti ASI) adalah makanan pelengkap yang diberikan saat bayi berusia 6 bulan. Pilih usia bayi Anda untuk melihat resep yang sesuai.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['6-8', '8-10', '10-12'] as const).map((age) => (
          <button
            key={age}
            onClick={() => setSelectedAgeGroup(age)}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition ${
              selectedAgeGroup === age
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-500'
            }`}
          >
            {age} Bulan
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : recipes.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Belum ada resep untuk usia ini</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <button
                onClick={() => setExpandedRecipe(expandedRecipe === recipe.id ? null : recipe.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="text-left flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-semibold text-gray-900">{recipe.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(recipe.category)}`}>
                      {recipe.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {recipe.prep_time_minutes} menit
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {recipe.servings} porsi
                    </span>
                  </div>
                </div>
                <div>
                  {expandedRecipe === recipe.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {expandedRecipe === recipe.id && (
                <div className="border-t border-gray-200 px-6 py-4 space-y-4 bg-gray-50">
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">Bahan-bahan:</h5>
                    <ul className="space-y-1">
                      {recipe.ingredients.split('\n').map((ingredient: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          <span>{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">Cara Membuat:</h5>
                    <ol className="space-y-2">
                      {recipe.instructions.split('\n').map((instruction: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-600 font-medium min-w-fit">{idx + 1}.</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h5 className="font-semibold text-gray-900 text-sm mb-1">Informasi Gizi:</h5>
                    <p className="text-sm text-gray-700">{recipe.nutrition_info}</p>
                  </div>

                  {recipe.allergenic_warning && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-gray-900 text-sm">Catatan Alergen:</h5>
                        <p className="text-sm text-gray-700">{recipe.allergenic_warning}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
        <h4 className="font-semibold text-gray-900 mb-3">Tips Pemberian MPASI:</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-orange-600">•</span>
            <span>Mulai dengan satu jenis makanan baru per minggu untuk memantau reaksi alergi</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-600">•</span>
            <span>Berikan makanan dalam keadaan hangat, tidak terlalu panas</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-600">•</span>
            <span>Gunakan sendok plastik lembut dan bersih saat memberi makan</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-600">•</span>
            <span>Perhatikan tanda-tanda alergi seperti ruam, muntah, atau diare</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-600">•</span>
            <span>Simpan MPASI yang sudah matang dalam wadah tertutup di kulkas maksimal 3 hari</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
