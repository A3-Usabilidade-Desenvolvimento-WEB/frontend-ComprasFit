import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Recipe } from '../services/api';
import { defaultProfile, eligibleRecipes, planningInput } from './planner';

const recipe: Recipe = { id: 'r1', hasProteinMain: true, name: 'Lentilha', servings: 2, vegetarian: true, steps: [], ingredients: [],
  preferences: { appliances: ['Fogão'], restrictions: ['Vegetariano', 'Vegano'], goals: ['Refeição leve'] } };
test('maps a weekly dinner to ordered labels and the API contract', () => {
  const profile = { ...defaultProfile, restrictions: ['Vegano'], days: ['Domingo', 'Terça-feira'] };
  assert.deepEqual(planningInput(profile, [recipe]), { budget: 135, people: 1, periodDays: 2,
    mealsPerDay: 1, buyingPreference: 'lowest_price', vegetarian: true, requireProteinMain: false, recipeIds: ['r1'], dayLabels: ['Terça-feira', 'Domingo'] });
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

test('a meta de proteína é obrigatória inclusive com outro objetivo ou sem candidatos', () => {
  const goal = 'Rico em proteína';
  const side: Recipe = { ...recipe, id: 'batata-cenoura', hasProteinMain: false,
    preferences: { ...recipe.preferences, goals: ['Refeição leve', goal] } };
  const chicken: Recipe = { ...recipe, id: 'frango', vegetarian: false,
    preferences: { ...recipe.preferences, restrictions: [], goals: [] } };
  const profile = { ...defaultProfile, goals: [goal, 'Refeição leve'], restrictions: ['Vegano'] };
  assert.deepEqual(eligibleRecipes(profile, [side, chicken, recipe]), [recipe]);
  assert.deepEqual(planningInput(profile, [side, chicken, recipe]).recipeIds, ['r1']);
  assert.equal(planningInput(profile, [recipe]).requireProteinMain, true);
  assert.throws(() => planningInput(profile, [side, chicken]), /Nenhuma receita/);
  assert.deepEqual(eligibleRecipes(defaultProfile, [side]), [side]);
});
