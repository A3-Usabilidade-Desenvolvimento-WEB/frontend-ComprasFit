import type { Recipe, PlanningInput } from '../services/api';
import { proteinGoal, weekdays } from './recipes';

export type MealCoverage = "dinner" | "lunch-dinner" | "snack";
export type Profile = { name: string; market: string; people: number; days: string[]; coverage: MealCoverage; budget: number; goals: string[]; restrictions: string[]; appliances: string[] };
export const defaultProfile: Profile = { name: '', market: '', people: 1, days: weekdays.slice(0, 5), coverage: 'lunch-dinner', budget: 135, goals: [], restrictions: [], appliances: ['Fogão'] };
export const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function eligibleRecipes(profile: Profile, recipes: Recipe[]) {
  return recipes.filter(recipe => {
    const { appliances, restrictions } = recipe.preferences;
    return recipe.mealKind === (profile.coverage === "snack" ? "snack" : "main")
      && (!profile.goals.includes(proteinGoal) || recipe.hasProteinMain)
      && appliances.some(a => profile.appliances.includes(a))
      && profile.restrictions.every(r => restrictions.includes(r));
  });
}

export function planningInput(profile: Profile, recipes: Recipe[]): PlanningInput {
  const available = eligibleRecipes(profile, recipes);
  if (!available.length) throw new Error('Nenhuma receita combina com seu objetivo, suas restrições e os equipamentos selecionados.');
  const otherGoals = profile.goals.filter(goal => goal !== proteinGoal);
  const preferred = available.filter(r => r.preferences.goals.some(g => otherGoals.includes(g)));
  const dayLabels = weekdays.filter(day => profile.days.includes(day));
  return {
    people: profile.people, budget: profile.budget, periodDays: dayLabels.length,
    mealsPerDay: profile.coverage === "lunch-dinner" ? 2 : 1,
    mealKind: profile.coverage === "snack" ? "snack" : "main",
    dayLabels, buyingPreference: 'variety',
    requireProteinMain: profile.goals.includes(proteinGoal),
    vegetarian: profile.restrictions.some(r => r === 'Vegetariano' || r === 'Vegano'),
    recipeIds: [...new Set([...preferred, ...available].map(r => r.id))],
  };
}
