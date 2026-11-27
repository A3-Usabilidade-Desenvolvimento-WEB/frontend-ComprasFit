import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Recipe } from '../services/api';
import { defaultProfile, eligibleRecipes, filterAdjustment, planningInput } from './planner';

const recipe: Recipe = { id: 'r1', mealKind: 'main', hasProteinMain: true, name: 'Lentilha', servings: 2, vegetarian: true, steps: [], ingredients: [],
  preferences: { appliances: ['Fogão'], restrictions: ['Vegetariano', 'Vegano'], goals: ['Refeição leve'] } };
test('maps a weekly dinner to ordered labels and the API contract', () => {
  const profile = { ...defaultProfile, restrictions: ['Vegano'], days: ['Domingo', 'Terça-feira'] };
  assert.deepEqual(planningInput(profile, [recipe]), { budget: 135, people: 1, periodDays: 2,
    appliances: ['Fogão'], restrictions: ['Vegano'], mealsPerDay: 2, mealKind: 'main', buyingPreference: 'variety', vegetarian: true, vegan: true, requireProteinMain: false, recipeIds: ['r1'], dayLabels: ['Terça-feira', 'Domingo'] });
});
test('requires every restriction and a compatible appliance', () => {
  assert.deepEqual(eligibleRecipes({ ...defaultProfile, restrictions: ['Vegano','Glúten'] }, [recipe]), []);
  assert.throws(() => planningInput({ ...defaultProfile, appliances: ['Forno'] }, [recipe]));
});
test('goals prioritize compatible recipes from the server', () => {
  const other = { ...recipe, id: 'r2', preferences: { ...recipe.preferences, goals: ['Conforto e sabor'] } };
  const params = planningInput({ ...defaultProfile, goals: ['Conforto e sabor'] }, [recipe, other]);
  assert.deepEqual(params.recipeIds, ['r2', 'r1']);
  assert.equal(params.buyingPreference, 'variety');
});

test('a meta de proteína é obrigatória inclusive com outro objetivo ou sem candidatos', () => {
  const goal = 'Rico em proteína';
  const side: Recipe = { ...recipe, id: 'batata-cenoura', mealKind: 'side', hasProteinMain: false,
    preferences: { ...recipe.preferences, goals: ['Refeição leve', goal] } };
  const chicken: Recipe = { ...recipe, id: 'frango', vegetarian: false,
    preferences: { ...recipe.preferences, restrictions: [], goals: [] } };
  const profile = { ...defaultProfile, goals: [goal, 'Refeição leve'], restrictions: ['Vegano'] };
  assert.deepEqual(eligibleRecipes(profile, [side, chicken, recipe]), [recipe]);
  assert.deepEqual(planningInput(profile, [side, chicken, recipe]).recipeIds, ['r1']);
  assert.equal(planningInput(profile, [recipe]).requireProteinMain, true);
  assert.throws(() => planningInput(profile, [side, chicken]), /Nenhuma receita/);
  assert.deepEqual(eligibleRecipes(defaultProfile, [side]), []);
});

test('separa jantares de lanches e exclui acompanhamentos das duas opções', () => {
  const snack: Recipe = { ...recipe, id: 'bolo', mealKind: 'snack', hasProteinMain: false };
  const side: Recipe = { ...recipe, id: 'batata', mealKind: 'side', hasProteinMain: false };
  const catalog = [side, snack, recipe];
  assert.deepEqual(planningInput({ ...defaultProfile, coverage: 'dinner' }, catalog).recipeIds, ['r1']);
  const plan = planningInput({ ...defaultProfile, coverage: 'snack' }, catalog);
  assert.equal(plan.mealsPerDay, 1);
  assert.equal(plan.mealKind, 'snack');
  assert.deepEqual(plan.recipeIds, ['bolo']);
});

test('diferente prioriza pratos veganos menos usados no cardápio anterior', () => {
  const feijao = { ...recipe, id: 'feijao' };
  const lentilha = { ...recipe, id: 'lentilha' };
  const pasta = { ...recipe, id: 'pasta' };
  const side = { ...recipe, id: 'batata', mealKind: 'side' as const };
  const profile = { ...defaultProfile, goals: ['Diferente'], restrictions: ['Vegano'] };
  const params = planningInput(profile, [feijao, lentilha, pasta, side], ['feijao', 'lentilha', 'feijao']);
  assert.deepEqual(params.recipeIds, ['pasta', 'lentilha', 'feijao']);
  assert.equal(params.vegan, true);
  assert.deepEqual(planningInput({ ...profile, excludedRecipeIds: ['feijao'] }, [feijao, lentilha, pasta, side]).recipeIds, ['lentilha', 'pasta']);
});

test('distingue equipamentos obrigatórios, alternativos e preparo a frio', () => {
  const multi: Recipe = { ...recipe, preferences: { ...recipe.preferences, applianceOptions: [['Forno','Fogão'], ['Air fryer']] } };
  assert.deepEqual(eligibleRecipes(defaultProfile, [multi]), []);
  assert.equal(eligibleRecipes({ ...defaultProfile, appliances: ['Fogão','Forno'] }, [multi]).length, 1);
  assert.equal(eligibleRecipes({ ...defaultProfile, appliances: ['Air fryer'] }, [multi]).length, 1);
  const cold = { ...recipe, preferences: { ...recipe.preferences, applianceOptions: [[]] } };
  assert.equal(eligibleRecipes({ ...defaultProfile, appliances: [] }, [cold]).length, 1);
  const patch = filterAdjustment({ ...defaultProfile, restrictions: ['Vegano'] }, [multi])?.patch;
  assert.ok(patch);
  assert.equal(eligibleRecipes({ ...defaultProfile, restrictions: ['Vegano'], ...patch }, [multi]).length, 1);
});
