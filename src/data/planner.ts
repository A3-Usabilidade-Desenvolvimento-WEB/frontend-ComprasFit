import { recipes, weekdays } from './recipes';

export type Profile = { name: string; market: string; people: number; days: string[]; budget: number; goals: string[]; restrictions: string[]; appliances: string[] };
export type PlanEntry = { day: string; recipeId: string };
export const defaultProfile: Profile = { name: '', market: 'Verdemar', people: 1, days: weekdays.slice(0, 5), budget: 135, goals: [], restrictions: [], appliances: ['Fogão'] };
export const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function eligibleRecipes(profile: Profile) {
  return recipes.filter(recipe => {
    const vegetarian = profile.restrictions.includes('Vegetariano') || profile.restrictions.includes('Vegano');
    if (vegetarian && recipe.id !== 'vegetais') return false;
    if (profile.restrictions.some(restriction => recipe.restrictions.includes(restriction))) return false;
    return recipe.appliances.some(appliance => profile.appliances.includes(appliance));
  });
}

// Demonstration only: prices and nutrition are local estimates, not store quotes.
export function createPlan(profile: Profile): PlanEntry[] {
  const available = eligibleRecipes(profile).sort((a, b) => {
    const score = (goals: string[]) => goals.filter(goal => profile.goals.includes(goal)).length;
    return score(b.goals) - score(a.goals);
  });
  if (!available.length) return [];
  const cheapest = [...available].sort((a, b) => a.cost - b.cost)[0]!;
  const orderedDays = weekdays.filter(day => profile.days.includes(day));
  let remaining = profile.budget;
  return orderedDays.map((day, index) => {
    const preferred = available[index % available.length]!;
    const remainingMinimum = cheapest.cost * profile.people * (orderedDays.length - index - 1);
    const recipe = preferred.cost * profile.people + remainingMinimum <= remaining ? preferred : cheapest;
    remaining -= recipe.cost * profile.people;
    return { day, recipeId: recipe.id };
  });
}

export function planCost(plan: PlanEntry[], people: number) {
  return plan.reduce((sum, entry) => sum + (recipes.find(r => r.id === entry.recipeId)?.cost ?? 0) * people, 0);
}

export function shoppingList(plan: PlanEntry[], people: number) {
  const items = new Map<string, { id: string; name: string; emoji: string; category: string; unit: string; quantity: number }>();
  for (const entry of plan) {
    const recipe = recipes.find(r => r.id === entry.recipeId);
    for (const ingredient of recipe?.ingredients ?? []) {
      const id = `${ingredient.name}:${ingredient.unit}`;
      const existing = items.get(id);
      if (existing) existing.quantity += ingredient.quantity * people;
      else items.set(id, { ...ingredient, id, quantity: ingredient.quantity * people });
    }
  }
  return [...items.values()].sort((a, b) => a.category.localeCompare(b.category));
}
