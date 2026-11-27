import { requireAuth } from './auth';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL?.trim() || 'https://backend-compras-fit.vercel.app').replace(/\/+$/, '');
type Unit = 'g' | 'ml' | 'un';
type FoodRole = "Proteína vegetal" | "Proteína animal" | "Carboidrato" | "Hortaliça" | "Laticínio" | "Fruta" | "Molho" | "Gordura";
export interface Product {
  foodRole: FoodRole | null;
  id: string; name: string; category: string; unit: Unit; packageSize: number;
  price: { value: number; store: string; updatedAt: string } | null;
}
export interface Recipe {
  mealKind: "main" | "snack" | "side";
  hasProteinMain: boolean;
  id: string; name: string; servings: number; vegetarian: boolean; steps: string[];
  preparationMinutes?: number | null;
  preferences: { restrictions: string[]; appliances: string[]; applianceOptions?: string[][]; goals: string[] };
  ingredients: { foodRole: FoodRole | null; mainProtein: boolean; productId: string; name: string; quantity: number; unit: Unit | null }[];
}
export interface PlanningInput {
  budget: number; people: number; periodDays: number; mealsPerDay: number;
  buyingPreference: 'lowest_price' | 'variety'; vegetarian: boolean;
  market?: string;
  appliances?: string[]; restrictions?: string[];
  vegan?: boolean;
  requireProteinMain?: boolean;
  mealKind?: "main" | "snack";
  previousRecipeIds?: string[];
  recipeIds?: string[]; mealRecipeIds?: string[]; dayLabels?: string[];
}
export interface ShoppingItem {
  id: string; productId: string; name: string; category: string; unit: Unit;
  quantityNeeded: number; packageSize: number; packages: number; leftover: number;
  priceReference?: { store: string; date: string; url: string | null };
  unitPrice: number; subtotal: number; purchased: boolean;
}
export interface Planning {
  id: string; createdAt: string; params: PlanningInput; budget: number; total: number; difference: number;
  fitsBudget: boolean; meals: { day: number; slot: number; recipeId: string; recipeName: string }[];
  shoppingList: { items: ShoppingItem[]; total: number };
}
export interface Summary {
  id: string; createdAt: string; budget: number; total: number; periodDays: number; people: number;
  itemsPurchased: number; itemsTotal: number;
}
export interface Expiration {
  id: string; name: string; productId: string | null; expirationDate: string;
  daysLeft: number; status: 'expired' | 'expiring_soon' | 'ok'; registeredAt: string;
}
export type PlanReview = { source: "gemini" | "rules"; tips: string[]; sections?: { title: string; detail: string }[] };

export interface Suggestions {
  source: 'catalog';
  suggestions: { recipeId: string; name: string; ingredients: string[]; steps: string[]; ingredientsInList: number }[];
  nextOffset: number | null;
}

export class ApiError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}
export function errorText(error: unknown) {
  return error instanceof Error ? error.message : 'Não foi possível completar a operação.';
}
async function request<T>(path: string, userId?: string, method = 'GET', body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (userId) {
    const { data, error } = await requireAuth().getSession();
    if (error || !data.session || data.session.user.id !== userId) throw new ApiError(401, 'Entre novamente para continuar.');
    headers.Authorization = 'Bearer ' + data.session.access_token;
  }
  async function send() {
    try { return await fetch(API_URL + '/api' + path, { method, headers, body: JSON.stringify(body) }); }
    catch { throw new ApiError(0, 'Não foi possível alcançar a API. Verifique a conexão e tente novamente.'); }
  }
  let response = await send();
  if (response.status === 401 && userId) {
    const client = requireAuth();
    const { data: current } = await client.getSession();
    if (current.session?.user.id === userId) {
      const { data } = 'Bearer ' + current.session.access_token === headers.Authorization
        ? await client.refreshSession()
        : { data: current };
      if (data.session?.user.id === userId) {
        headers.Authorization = 'Bearer ' + data.session.access_token;
        response = await send();
      }
    }
  }
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const details = Array.isArray(result?.details) ? result.details.map((d: { message: string }) => d.message) : [];
    if (Array.isArray(result?.suggestions)) details.push(...result.suggestions);
    if (typeof result?.excess === 'number') details.unshift('Excesso de R$ ' + result.excess.toFixed(2).replace('.', ',') + '.');
    const message = response.status === 401 ? 'Sessão inválida ou expirada. Entre novamente.' : result?.error || 'A API retornou HTTP ' + response.status + '.';
    throw new ApiError(response.status, [message, ...details].join(' '));
  }
  if (result === null) throw new ApiError(response.status, 'Resposta inválida da API.');
  return result as T;
}

const planPath = (id: string) => '/planejamento/' + encodeURIComponent(id);
export const api = {
  products: () => request<Product[]>('/produtos'),
  stores: () => request<string[]>('/supermercados'),
  recipes: () => request<Recipe[]>('/receitas'),
  history: (user: string) => request<Summary[]>('/planejamento', user),
  plan: (user: string, id: string) => request<Planning>(planPath(id), user),
  create: (user: string, input: PlanningInput) => request<Planning>('/planejamento', user, 'POST', input),
  purchase: (user: string, id: string, item: ShoppingItem) => request<ShoppingItem>(
    planPath(id) + '/itens/' + encodeURIComponent(item.id), user, 'PATCH', { purchased: !item.purchased }),
  review: (user: string, planningId: string, eligibleRecipeIds: string[]) =>
    request<PlanReview>('/ia/revisao', user, 'POST', { planningId, eligibleRecipeIds }),
  suggestions: (user: string, planningId: string, offset: number, eligibleRecipeIds: string[]) =>
    request<Suggestions>('/ia/sugestao', user, 'POST', { planningId, offset, eligibleRecipeIds }),
  expirations: (user: string) => request<Expiration[]>('/validade', user),
  register: (user: string, input: { name?: string; productId?: string; expirationDate: string }) =>
    request<Expiration>('/validade', user, 'POST', input),
};
