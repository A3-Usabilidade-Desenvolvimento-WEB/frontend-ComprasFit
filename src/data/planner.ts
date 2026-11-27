import type { Recipe, PlanningInput } from '../services/api';
import { proteinGoal, weekdays } from './recipes';

export type MealCoverage = "dinner" | "lunch-dinner" | "snack";
export type Profile = { name: string; market: string; buyingPreference: PlanningInput['buyingPreference']; people: number; days: string[]; coverage: MealCoverage; budget: number; excludedRecipeIds: string[]; goals: string[]; restrictions: string[]; appliances: string[] };
export const appliances = ['Fogão', 'Micro-ondas', 'Air fryer', 'Forno'];
export const defaultProfile: Profile = { name: '', market: '', buyingPreference: 'variety', people: 1, days: weekdays.slice(0, 5), excludedRecipeIds: [], coverage: 'lunch-dinner', budget: 135, goals: [], restrictions: [], appliances: ['Fogão'] };
export const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function eligibleRecipes(profile: Profile, recipes: Recipe[]) {
  return recipes.filter(recipe => {
    const { appliances, applianceOptions, restrictions } = recipe.preferences;
    const methods = applianceOptions ?? appliances.map(a => [a]);
    return !profile.excludedRecipeIds.includes(recipe.id)
      && recipe.mealKind === (profile.coverage === "snack" ? "snack" : "main")
      && (!profile.goals.includes(proteinGoal) || recipe.hasProteinMain)
      && methods.some(required => required.every(a => profile.appliances.includes(a)))
      && profile.restrictions.every(r => restrictions.includes(r));
  });
}

export function filterAdjustment(profile: Profile, recipes: Recipe[]) {
  const compatible = (patch: Partial<Profile>) => eligibleRecipes({ ...profile, ...patch }, recipes).length > 0;
  const missing = appliances.filter(a => !profile.appliances.includes(a));
  // Try the smallest equipment change that preserves all food restrictions.
  for (let count = 1; count <= missing.length; count++) {
    for (let mask = 1; mask < 2 ** missing.length; mask++) {
      const add = missing.filter((_, i) => mask & (1 << i));
      if (add.length === count && compatible({ appliances: [...profile.appliances, ...add] })) {
        return { label: 'Incluir ' + add.map(applianceLabel).join(' e '), patch: { appliances: [...profile.appliances, ...add] } };
      }
    }
  }
  const goals = profile.goals.filter(g => g !== proteinGoal);
  if (goals.length < profile.goals.length && compatible({ goals })) return { label: 'Retirar a meta de proteína principal', patch: { goals } };
  const coverage: MealCoverage = profile.coverage === 'snack' ? 'dinner' : 'snack';
  if (compatible({ coverage })) return { label: coverage === 'snack' ? 'Planejar só lanche' : 'Planejar só jantar', patch: { coverage } };
  const [excluded] = eligibleRecipes({ ...profile, excludedRecipeIds: [] }, recipes);
  if (excluded && profile.excludedRecipeIds.includes(excluded.id)) {
    return { label: 'Voltar a incluir ' + excluded.name, patch: { excludedRecipeIds: profile.excludedRecipeIds.filter(id => id !== excluded.id) } };
  }
  return null;
}

export const applianceLabel = (id: string) => id === 'Air fryer' ? 'Airfry' : id;

export function planningInput(profile: Profile, recipes: Recipe[], previousRecipeIds: string[] = [], vary = false): PlanningInput {
  const available = eligibleRecipes(profile, recipes);
  if (!available.length) throw new Error('Nenhuma receita combina com seu objetivo, suas restrições e os equipamentos selecionados.');
  const previousUses = new Map<string, number>();
  for (const id of previousRecipeIds) previousUses.set(id, (previousUses.get(id) ?? 0) + 1);
  const otherGoals = profile.goals.filter(goal => goal !== proteinGoal && goal !== 'Diferente');
  const matchesGoal = (recipe: Recipe) => recipe.preferences.goals.some(goal => otherGoals.includes(goal));
  available.sort((a, b) =>
    (previousUses.get(a.id) ?? 0) - (previousUses.get(b.id) ?? 0)
    || Number(matchesGoal(b)) - Number(matchesGoal(a))
    || Number(a.id === previousRecipeIds[0]) - Number(b.id === previousRecipeIds[0]));
  const dayLabels = weekdays.filter(day => profile.days.includes(day));
  return {
    people: profile.people, budget: profile.budget, periodDays: dayLabels.length,
    mealsPerDay: profile.coverage === "lunch-dinner" ? 2 : 1,
    mealKind: profile.coverage === "snack" ? "snack" : "main",
    appliances: profile.appliances, restrictions: profile.restrictions,
    dayLabels, buyingPreference: profile.buyingPreference,
    ...(profile.market ? { market: profile.market } : {}),
    ...((vary || profile.goals.includes('Diferente')) && previousRecipeIds.length ? { previousRecipeIds } : {}),
    requireProteinMain: profile.goals.includes(proteinGoal),
    vegan: profile.restrictions.includes('Vegano'),
    vegetarian: profile.restrictions.some(r => r === 'Vegetariano' || r === 'Vegano'),
    recipeIds: available.map(r => r.id),
  };
}
