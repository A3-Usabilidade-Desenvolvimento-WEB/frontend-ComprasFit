import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createPlan, defaultProfile, eligibleRecipes, planCost, shoppingList } from './planner';

test('plans only selected days in weekday order', () => {
  const plan = createPlan({ ...defaultProfile, days: ['Sexta-feira', 'Segunda-feira'] });
  assert.deepEqual(plan.map(entry => entry.day), ['Segunda-feira', 'Sexta-feira']);
});

test('vegetarian restriction excludes animal ingredients', () => {
  const plan = createPlan({ ...defaultProfile, restrictions: ['Vegetariano'] });
  assert.ok(plan.length > 0);
  assert.ok(plan.every(entry => entry.recipeId === 'vegetais'));
  const list = shoppingList(plan, 2);
  assert.ok(!list.some(item => /frango|atum/i.test(item.name)));
});

test('respects fish and gluten restrictions together', () => {
  const available = eligibleRecipes({ ...defaultProfile, restrictions: ['Peixe', 'Glúten'] });
  assert.deepEqual(available.map(recipe => recipe.id), ['arroz', 'vegetais']);
});

test('unsupported appliance combinations produce no recipes', () => {
  assert.deepEqual(createPlan({ ...defaultProfile, appliances: ['Air fryer'] }), []);
});

test('aggregates repeated ingredients and scales to people', () => {
  const plan = [{ day: 'Segunda-feira', recipeId: 'arroz' }, { day: 'Terça-feira', recipeId: 'macarrao' }];
  const list = shoppingList(plan, 2);
  assert.equal(list.find(item => item.name === 'Peito de frango')?.quantity, 600);
  assert.equal(list.find(item => item.name === 'Brócolis')?.quantity, 400);
  assert.equal(list.filter(item => item.name === 'Brócolis').length, 1);
  assert.equal(planCost(plan, 2), 48.5);
});

test('falls back to cheaper meals when budget requires it', () => {
  const profile = { ...defaultProfile, budget: 40, days: defaultProfile.days };
  const plan = createPlan(profile);
  assert.equal(plan.length, 5);
  assert.ok(planCost(plan, 1) <= profile.budget);
});

test('retains all selected days when the minimum exceeds budget', () => {
  const profile = { ...defaultProfile, people: 12, budget: 30 };
  const plan = createPlan(profile);
  assert.equal(plan.length, profile.days.length);
  assert.ok(planCost(plan, profile.people) > profile.budget);
});
