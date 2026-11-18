import type { Recipe, PlanningInput } from '../services/api';
import { weekdays } from './recipes';

export type Profile = { name: string; market: string; people: number; days: string[]; budget: number; goals: string[]; restrictions: string[]; appliances: string[] };
export const defaultProfile: Profile = { name: '', market: '', people: 1, days: weekdays.slice(0, 5), budget: 135, goals: [], restrictions: [], appliances: ['Fogão'] };
export const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function eligibleRecipes(profile: Profile, recipes: Recipe[]) {
  return recipes.filter(recipe => {
    const { appliances, restrictions } = recipe.preferences;
    return appliances.some(a => profile.appliances.includes(a))
      && profile.restrictions.every(r => restrictions.includes(r));
  });
}

export function planningInput(profile: Profile, recipes: Recipe[]): PlanningInput {
  const available = eligibleRecipes(profile, recipes);
  if (!available.length) throw new Error('Nenhuma receita combina com suas restrições e equipamentos.');
  const preferred = available.filter(r => r.preferences.goals.some(g => profile.goals.includes(g)));
  const dayLabels = weekdays.filter(day => profile.days.includes(day));
  return {
    people: profile.people, budget: profile.budget, periodDays: dayLabels.length, mealsPerDay: 1,
    dayLabels, buyingPreference: profile.goals.includes('Diferente') ? 'variety' : 'lowest_price',
    vegetarian: profile.restrictions.some(r => r === 'Vegetariano' || r === 'Vegano'),
    recipeIds: (preferred.length ? preferred : available).map(r => r.id),
  };
}
