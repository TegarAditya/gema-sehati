export type AdminTab = 'overview' | 'users' | 'children' | 'stories' | 'mpasi' | 'videos' | 'analytics';

export type StoryForm = {
  title: string;
  content: string;
  age_category: '0-3' | '4-6' | '7-12';
  theme: string;
  image_url: string;
};

export type RecipeForm = {
  title: string;
  age_group: '6-8' | '8-10' | '10-12';
  category: string;
  ingredients: string;
  instructions: string;
  nutrition_info: string;
  allergenic_warning: string;
  prep_time_minutes: number;
  servings: number;
};

export type VideoForm = {
  youtube_id: string;
  title: string;
  description: string;
  display_order: number;
};

export const defaultStoryForm: StoryForm = {
  title: '',
  content: '',
  age_category: '4-6',
  theme: '',
  image_url: '',
};

export const defaultRecipeForm: RecipeForm = {
  title: '',
  age_group: '6-8',
  category: '',
  ingredients: '',
  instructions: '',
  nutrition_info: '',
  allergenic_warning: '',
  prep_time_minutes: 15,
  servings: 1,
};

export const defaultVideoForm: VideoForm = {
  youtube_id: '',
  title: '',
  description: '',
  display_order: 0,
};
