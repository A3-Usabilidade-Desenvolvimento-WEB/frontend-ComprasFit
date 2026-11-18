import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Recipe } from '../services/api';
import { defaultProfile, eligibleRecipes, planningInput } from './planner';

const recipe: Recipe = { id: 'r1', name: 'Lentilha', servings: 2, vegetarian: true, steps: [], ingredients: [],
  preferences: { appliances: ['Fogão'], restrictions: ['Vegetariano', 'Vegano'], goals: ['Refeição leve'] } };
test('maps a weekly dinner to ordered labels and the API contract', () => {
  const profile = { ...defaultProfile, restrictions: ['Vegano'], days: ['Domingo', 'Terça-feira'] };
  assert.deepEqual(planningInput(profile, [recipe]), { budget: 135, people: 1, periodDays: 2,
    mealsPerDay: 1, buyingPreference: 'lowest_price', vegetarian: true, recipeIds: ['r1'], dayLabels: ['Terça-feira', 'Domingo'] });
});
test('requires every restriction and a compatible appliance', () => {
  assert.deepEqual(eligibleRecipes({ ...defaultProfile, restrictions: ['Vegano','Glúten'] }, [recipe]), []);
  assert.throws(() => planningInput({ ...defaultProfile, appliances: ['Forno'] }, [recipe]));
});
test('goals prioritize compatible recipes from the server', () => {
  const other = { ...recipe, id: 'r2', preferences: { ...recipe.preferences, goals: ['Diferente'] } };
  const params = planningInput({ ...defaultProfile, goals: ['Diferente'] }, [recipe, other]);
  assert.deepEqual(params.recipeIds, ['r2']);
  assert.equal(params.buyingPreference, 'variety');
});
