import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPlan, defaultProfile, type PlanEntry, type Profile } from '../data/planner';

type Preferences = { dark: boolean; reminders: boolean; weekStart: 'Segunda-feira' | 'Domingo'; language?: 'pt-BR' | 'en' | 'es' };
type SavedState = { profile: Profile; plan: PlanEntry[]; favorites: string[]; checked: string[]; completed: boolean; preferences: Preferences };
const initial: SavedState = { profile: defaultProfile, plan: [], favorites: [], checked: [], completed: false, preferences: { dark: false, reminders: false, weekStart: 'Segunda-feira', language: 'pt-BR' } };
const KEY = 'comprasfit:v1';
type Store = {
  state: SavedState; loaded: boolean; storageError: string | null;
  updateProfile: (patch: Partial<Profile>) => void;
  generate: (profile?: Profile) => void; toggleFavorite: (id: string) => void; toggleChecked: (id: string) => void;
  swap: (day: string, recipeId: string) => void; updatePreferences: (patch: Partial<Preferences>) => void;
  reset: () => void;
};
const Context = createContext<Store | null>(null);
function isSavedState(value: unknown): value is SavedState {
  if (!value || typeof value !== 'object') return false;
  const s = value as SavedState;
  return typeof s.completed === 'boolean' && typeof s.profile?.name === 'string' &&
    typeof s.profile.people === 'number' && s.profile.people >= 1 && typeof s.profile.budget === 'number' &&
    Array.isArray(s.profile.days) && Array.isArray(s.profile.goals) && Array.isArray(s.profile.restrictions) &&
    Array.isArray(s.profile.appliances) && typeof s.profile.market === 'string' &&
    Array.isArray(s.plan) && s.plan.every(p => typeof p.day === 'string' && typeof p.recipeId === 'string') &&
    Array.isArray(s.favorites) && Array.isArray(s.checked) && typeof s.preferences?.dark === 'boolean';
}

export function AppProvider({ children }: React.PropsWithChildren) {
  const [state, setState] = useState<SavedState>(initial);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isSavedState(parsed)) setState(parsed);
        else setStorageError('Os dados salvos não puderam ser recuperados. Configure um novo plano.');
      }
    }).catch(() => setStorageError('Não foi possível recuperar os dados deste dispositivo.'))
      .finally(() => setLoaded(true));
  }, []);
  useEffect(() => {
    if (!loaded) return;
    writes.current = writes.current.then(() => AsyncStorage.setItem(KEY, JSON.stringify(state)))
      .catch(() => setStorageError('Não foi possível salvar. As mudanças podem ser perdidas ao fechar o app.'));
  }, [state, loaded]);
  const toggle = (key: 'favorites' | 'checked', id: string) => setState(s => ({ ...s, [key]: s[key].includes(id) ? s[key].filter(item => item !== id) : [...s[key], id] }));
  return <Context.Provider value={{
    state, loaded, storageError,
    updateProfile: patch => setState(s => ({ ...s, profile: { ...s.profile, ...patch } })),
    generate: profile => setState(s => ({ ...s, profile: profile ?? s.profile, plan: createPlan(profile ?? s.profile), checked: [], completed: true })),
    toggleFavorite: id => toggle('favorites', id), toggleChecked: id => toggle('checked', id),
    swap: (day, recipeId) => setState(s => ({ ...s, plan: s.plan.map(entry => entry.day === day ? { day, recipeId } : entry), checked: [] })),
    updatePreferences: patch => setState(s => ({ ...s, preferences: { ...s.preferences, ...patch } })),
    reset: () => setState(initial),
  }}>{children}</Context.Provider>;
}

export function useApp() {
  const value = useContext(Context);
  if (!value) throw new Error('AppProvider is required');
  return value;
}
