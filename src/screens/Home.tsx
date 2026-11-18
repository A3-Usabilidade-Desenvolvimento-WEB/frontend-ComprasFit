import React from 'react';
import { AppState, Pressable, ScrollView, Text, View } from 'react-native';
import { Button, Card, Icon, useTheme } from '../components/ui';
import { PlanReviewCard } from '../components/PlanReviewCard';
import { RecipeCard } from '../components/RecipeCard';
import { money } from '../data/planner';
import { useResponsive } from '../components/responsive';
import { useApp } from '../state/AppState';

export function Home({ onRecipe, onShopping, onEdit }: { onRecipe: (id: string, day?: string) => void; onShopping: () => void; onEdit: () => void }) {
  const { session, state, recipes, active, suggestions, suggestionStatus, loadMoreSuggestions } = useApp();
  const [hour, setHour] = React.useState(new Date().getHours());
  React.useEffect(() => { const sub = AppState.addEventListener('change', status => { if (status === 'active') setHour(new Date().getHours()); }); const interval = setInterval(() => setHour(new Date().getHours()), 60000); return () => { sub.remove(); clearInterval(interval); }; }, []);
  const greeting = hour >= 5 && hour < 12 ? 'BOM DIA' : hour >= 12 && hour < 18 ? 'BOA TARDE' : 'BOA NOITE';
  const c = useTheme();
  const { wide, columns } = useResponsive();
  const total = active?.total ?? 0;
  const list = active?.shoppingList.items ?? [];
  const people = active?.params.people ?? state.profile.people;
  const meals = state.plan.length;
  const days = active?.params.periodDays ?? state.profile.days.length;
  const checked = list.filter(item => item.purchased).length;
  const firstName = (state.profile.name || 'Chef').trim().split(' ')[0];
  const percent = (active?.budget ?? state.profile.budget) > 0 ? Math.min(100, Math.round(total / (active?.budget ?? state.profile.budget) * 100)) : 0;
  return <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={{ paddingHorizontal: wide ? 36 : 22, paddingTop: 28, paddingBottom: 48, gap: 25 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View style={{ flex: 1, gap: 7 }}>
        <Text style={{ color: c.green, fontSize: 14, fontWeight: '800', letterSpacing: 1.2 }}>COMPRASFiT  ·  {greeting}</Text>
        <Text accessibilityRole="header" style={{ color: c.text, fontSize: wide ? 35 : 30, fontWeight: '800', letterSpacing: -1.2 }}>Olá, {firstName} 👋</Text>
        <Text style={{ color: c.muted, fontSize: 16 }}>Seu planejamento, mais simples.</Text>
      </View>
      <View style={{ width: 48, height: 48, borderRadius: 17, backgroundColor: '#E9F7EE', alignItems: 'center', justifyContent: 'center' }}><Icon name="leaf-outline" color={c.green} size={26} /></View>
    </View>
    <View style={{ borderRadius: 27, padding: 24, backgroundColor: '#176C4A', gap: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: '#C7EBD8', fontSize: 15, fontWeight: '600' }}>Estimativa da lista de compras</Text>
        <Icon name="wallet-outline" color="#D7F3E4" size={23}/>
      </View>
      <View style={{ gap: 4 }}><Text style={{ color: '#FFFFFF', fontSize: 35, fontWeight: '800', letterSpacing: -1 }}>{money(total)}</Text><Text style={{ color: '#C7EBD8', fontSize: 15 }}>Limite de {money(active?.budget ?? state.profile.budget)}</Text></View>
      <View style={{ height: 8, borderRadius: 8, backgroundColor: '#478B70', overflow: 'hidden' }}><View style={{ height: '100%', width: `${percent}%`, borderRadius: 8, backgroundColor: total > (active?.budget ?? state.profile.budget) ? '#FFC77B' : '#B6F0CF' }}/></View>
      <Text style={{ color: '#DDF4E6', fontSize: 14 }}>{meals} refeições em {days} dias · {people} {people === 1 ? 'pessoa' : 'pessoas'}</Text>
      <Text style={{ color: '#DDF4E6', fontSize: 13, lineHeight: 19 }}>Inclui as embalagens para estas receitas. Os preços são referências acadêmicas e podem diferir dos preços do supermercado.</Text>
    </View>
    <Pressable onPress={onShopping} accessibilityRole="button" accessibilityLabel="Abrir lista de compras" style={{ flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 22, backgroundColor: '#F0F7F3', gap: 15 }}>
      <View style={{ width: 52, height: 52, borderRadius: 17, backgroundColor: '#D8EFE2', alignItems: 'center', justifyContent: 'center' }}><Icon name="basket-outline" color={c.green} size={26}/></View>
      <View style={{ flex: 1, gap: 4 }}><Text style={{ color: c.text, fontWeight: '800', fontSize: 19 }}>Lista de compras</Text><Text style={{ color: c.muted, fontSize: 14 }}>{checked} de {list.length} itens marcados</Text></View>
      <Icon name="arrow-forward" color={c.green} size={22}/>
    </Pressable>
    {!!session && !!active && <PlanReviewCard key={active.id} userId={session.user.id} planningId={active.id} />}
    <View style={{ gap: 15 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ gap: 4 }}><Text accessibilityRole="header" style={{ color: c.text, fontSize: 25, fontWeight: '800', letterSpacing: -.6 }}>Seu cardápio</Text><Text style={{ color: c.muted, fontSize: 15 }}>Receitas para sua semana</Text></View>
        <View style={{ paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#EDF6F0', borderRadius: 20 }}><Text style={{ color: c.green, fontWeight: '700', fontSize: 14 }}>{state.plan.length} refeições</Text></View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
        {[...state.plan].sort((a, b) => state.preferences.weekStart === 'Domingo' ? Number(b.day.startsWith('Domingo')) - Number(a.day.startsWith('Domingo')) : 0).map(entry => {
          const recipe = recipes.find(r => r.id === entry.recipeId);
          return recipe ? <View key={entry.day} style={{ width: columns === 3 ? '31.5%' : columns === 2 ? '48%' : '100%' }}><RecipeCard day={entry.day} recipe={recipe} onPress={() => onRecipe(recipe.id, entry.day)} /></View> : null;
        })}
      </View>
      {!state.plan.length && <Card><Text style={{ color: c.muted }}>Nenhuma receita compatível. Ajuste suas preferências para montar um plano.</Text></Card>}
    </View>
    <Button title="Editar planejamento" secondary icon="options-outline" onPress={onEdit}/>
    <View style={{ gap: 15 }}>
      {suggestions && <>
        <Text accessibilityRole="header" style={{ color: c.text, fontSize: 25, fontWeight: '800' }}>Sugestões para seu cardápio</Text>
        {suggestions.suggestions.length === 0 && <Text style={{ color: c.muted }}>Nenhuma outra receita combina com suas preferências e equipamentos.</Text>}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
          {suggestions.suggestions.map(item => {
            const recipe = recipes.find(candidate => candidate.id === item.recipeId);
            const missing = item.ingredients.length - item.ingredientsInList;
            const detail = missing === 0 ? 'Todos os ingredientes na lista de compras'
              : missing === 1 ? '1 ingrediente fora da lista de compras' : `${missing} ingredientes fora da lista de compras`;
            return recipe ? <View key={recipe.id} style={{ width: columns === 3 ? '31.5%' : columns === 2 ? '48%' : '100%' }}>
              <RecipeCard recipe={recipe} detail={detail} onPress={() => onRecipe(recipe.id)} />
            </View> : null;
          })}
        </View>
        {suggestions.suggestions.length > 0 && suggestions.nextOffset === null && <Text style={{ color: c.muted }}>Você viu todas as sugestões para este plano.</Text>}
      </>}
      {!!suggestionStatus?.error && <Text accessibilityRole="alert" style={{ color: c.text }}>{suggestionStatus.error}</Text>}
      {suggestions?.nextOffset !== null && <Button title={suggestions ? 'Mais sugestões' : 'Sugestões de receitas'} secondary busy={suggestionStatus?.busy} onPress={loadMoreSuggestions} />}
    </View>
  </ScrollView>;
}
