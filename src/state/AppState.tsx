import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { defaultProfile, eligibleRecipes, planningInput, type Profile } from '../data/planner';
import { weekdays } from '../data/recipes';
import { normalizePersonName, personNameError } from '../data/personName';
import { api, errorText, type Planning, type Recipe, type Suggestions } from '../services/api';
import { auth } from '../services/auth';

type Preferences = { dark: boolean; reminders: boolean; weekStart: 'Segunda-feira' | 'Domingo'; language?: 'pt-BR' | 'en' | 'es' };
type LocalState = { profile: Profile; favorites: string[]; preferences: Preferences };
const defaults: LocalState = { profile: defaultProfile, favorites: [], preferences: { dark: false, reminders: false, weekStart: 'Segunda-feira', language: 'pt-BR' } };

function readLocal(raw: string | null): LocalState {
  if (!raw) return defaults;
  const data = JSON.parse(raw) as LocalState;
  if (!data?.profile || !Array.isArray(data.favorites) || !data.preferences ||
      !['days','goals','restrictions','appliances'].every(k => Array.isArray(data.profile[k as keyof Profile]))) {
    throw new Error('Preferências salvas neste aparelho estão inválidas.');
  }
  return { ...defaults, ...data };
}
function useStore(session: Session | null, ready: boolean) {
  const userId = session?.user.id;
  const key = 'comprasfit:v2:' + userId;
  const [local, setLocal] = useState<LocalState>(defaults);
  const [suggestionPage, setSuggestionPage] = useState<(Suggestions & { planningId: string }) | null>(null);
  const [suggestionStatus, setSuggestionStatus] = useState<{ planningId: string; busy: boolean; error: string } | null>(null);
  const pendingSuggestions = useRef(new Set<string>());
  const latestSuggestionRequest = useRef<string>(undefined);
  const [active, setActive] = useState<Planning | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [storageError, setStorageError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const writes = useRef(Promise.resolve());
  const pendingItems = useRef(new Set<string>());
  const savingPlan = useRef(false);

  useEffect(() => {
    if (!userId) return;
    let current = true;
    setLoaded(false);
    setLoadError('');
    async function restore(owner: string) {
      const [raw, catalog, stores, history] = await Promise.all([
        AsyncStorage.getItem(key), api.recipes(), api.stores(), api.history(owner),
      ]);
      // Version 1 had no account owner. Only device appearance can be safely reused.
      const legacy = raw ? null : await AsyncStorage.getItem('comprasfit:v1');
      const plan = history[0] ? await api.plan(owner, history[0].id) : null;
      if (!current) return;
      let saved = defaults;
      try { saved = raw ? readLocal(raw) : { ...defaults, preferences: readLocal(legacy).preferences }; } catch (error) { setStorageError(errorText(error)); }
      const profile = { ...saved.profile, name: normalizePersonName(saved.profile.name) ?? normalizePersonName(session?.user.user_metadata.name) ?? '',
        market: stores.includes(saved.profile.market) ? saved.profile.market : stores[0] ?? '' };
      if (plan) {
        profile.people = plan.params.people;
        profile.budget = plan.budget;
        profile.days = plan.params.dayLabels ?? weekdays.slice(0, plan.params.periodDays);
        if (plan.params.vegetarian && !profile.restrictions.includes('Vegano') && !profile.restrictions.includes('Vegetariano')) {
          profile.restrictions = [...profile.restrictions, 'Vegetariano'];
        }
      }
      setLocal({ ...saved, profile });
      setRecipes(catalog);
      setMarkets(stores);
      setActive(plan);
      setLoaded(true);
    }
    restore(userId).catch(error => { if (current) setLoadError(errorText(error)); });
    return () => { current = false; };
  }, [userId, key, attempt]);

  useEffect(() => {
    if (!loaded || !userId) return;
    writes.current = writes.current.then(() => AsyncStorage.setItem(key, JSON.stringify(local)))
      .catch(() => setStorageError('Não foi possível salvar as preferências neste aparelho.'));
  }, [key, userId, local, loaded]);

  async function savePlan(profile: Profile, input: Planning['params']) {
    if (!userId || savingPlan.current) throw new Error('Aguarde a conclusão do planejamento.');
    savingPlan.current = true;
    try {
      const result = await api.create(userId, input);
      setActive(result);
      setLocal(old => ({ ...old, profile }));
    } finally { savingPlan.current = false; }
  }
  const suggestions = suggestionPage?.planningId === active?.id ? suggestionPage : null;
  const status = suggestionStatus?.planningId === active?.id ? suggestionStatus : null;

  async function loadMoreSuggestions() {
    if (!active || !userId || suggestions?.nextOffset === null || pendingSuggestions.current.has(active.id)) return;
    const planningId = active.id;
    const eligibleIds = eligibleRecipes(local.profile, recipes).map(recipe => recipe.id);
    pendingSuggestions.current.add(planningId);
    latestSuggestionRequest.current = planningId;
    setSuggestionStatus({ planningId, busy: true, error: '' });
    try {
      const page = await api.suggestions(userId, planningId, suggestions?.nextOffset ?? 0, eligibleIds);
      if (latestSuggestionRequest.current !== planningId) return;
      setSuggestionPage({ ...page, planningId, suggestions: [...(suggestions?.suggestions ?? []), ...page.suggestions] });
      setSuggestionStatus({ planningId, busy: false, error: '' });
    } catch (error) {
      if (latestSuggestionRequest.current === planningId) setSuggestionStatus({ planningId, busy: false, error: errorText(error) });
    } finally {
      pendingSuggestions.current.delete(planningId);
    }
  }

  const plan = active?.meals.map(meal => {
    const label = active.params.dayLabels?.[meal.day - 1] || 'Dia ' + meal.day;
    return { recipeId: meal.recipeId, day: active.params.mealsPerDay > 1 ? label + ' · ' + meal.slot : label };
  }) ?? [];

  return {
    session, recipes, markets, active, loaded: ready && (!userId || loaded), storageError, loadError,
    suggestions, suggestionStatus: status, loadMoreSuggestions,
    retry: () => setAttempt(n => n + 1),
    state: { ...local, plan, completed: !!active },
    updateProfile: (patch: Partial<Profile>) => setLocal(s => ({ ...s, profile: { ...s.profile, ...patch } })),
    updatePreferences: (patch: Partial<Preferences>) => setLocal(s => ({ ...s, preferences: { ...s.preferences, ...patch } })),
    toggleFavorite: (id: string) => setLocal(s => ({ ...s, favorites: s.favorites.includes(id) ? s.favorites.filter(f => f !== id) : [...s.favorites, id] })),
    generate: async (profile: Profile) => {
      const name = normalizePersonName(profile.name);
      if (!name) throw new Error(personNameError);
      await savePlan({ ...profile, name }, planningInput(profile, recipes));
    },
    swap: async (day: string, id: string) => {
      if (!active) return;
      const mealRecipeIds = plan.map(entry => entry.day === day ? id : entry.recipeId);
      await savePlan(local.profile, { ...active.params, mealRecipeIds, recipeIds: [...new Set(mealRecipeIds)] });
    },
    toggleChecked: async (id: string) => {
      const item = active?.shoppingList.items.find(i => i.id === id);
      if (!active || !userId || !item || pendingItems.current.has(id)) return;
      pendingItems.current.add(id);
      try {
        const updated = await api.purchase(userId, active.id, item);
        setActive(p => p?.id === active.id ? { ...p, shoppingList: { ...p.shoppingList,
          items: p.shoppingList.items.map(i => i.id === id ? updated : i) } } : p);
      } finally { pendingItems.current.delete(id); }
    },
    reset: () => setLocal(s => ({ ...s, favorites: [], preferences: defaults.preferences })),
  };
}
const Context = createContext<ReturnType<typeof useStore> | null>(null);
function UserStore({ session, ready, children }: React.PropsWithChildren<{ session: Session | null; ready: boolean }>) {
  return <Context.Provider value={useStore(session, ready)}>{children}</Context.Provider>;
}
export function AppProvider({ children }: React.PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!auth);
  useEffect(() => {
    if (!auth) return;
    const { data } = auth.onAuthStateChange((_event, next) => { setSession(next); setReady(true); });
    const listener = Platform.OS !== 'web' ? AppState.addEventListener('change', status => {
      if (status === 'active') auth?.startAutoRefresh(); else auth?.stopAutoRefresh();
    }) : undefined;
    return () => { listener?.remove(); data.subscription.unsubscribe(); };
  }, []);
  return <UserStore key={session?.user.id || 'guest'} session={session} ready={ready}>{children}</UserStore>;
}
export function useApp() {
  const value = useContext(Context);
  if (!value) throw new Error('AppProvider is required');
  return value;
}
