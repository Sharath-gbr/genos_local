export interface Recipe {
  id: string;
  name: string;
  image: string;
  ingredients: string;
  instructions: string;
  calories: number;
  carbs: number;
  proteins: number;
  fats: number;
  dietType: string[];
  mealType: string[];
  phase: string[];
  proteinMealType: string[];
} 