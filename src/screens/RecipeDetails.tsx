import React, { useState } from 'react';
import { ImageBackground, Pressable, ScrollView, Text, View } from 'react-native';
import { Button, Card, Chip, Icon, ui, useTheme } from '../components/ui';
import { recipes } from '../data/recipes';
import { recipeImages } from '../data/images';
import { eligibleRecipes, money } from '../data/planner';
import { useResponsive } from '../components/responsive';
import { useApp } from '../state/AppState';

export function RecipeDetails({ id, day, onBack, onReplace }: { id: string; day?: string; onBack: () => void; onReplace: (id: string) => void }) {
  const { state, toggleFavorite, swap } = useApp();
  const c = useTheme();
  const { wide } = useResponsive();
  const [choosing, setChoosing] = useState(false);
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return <Button title="Voltar ao início" onPress={onBack} />;
  const favorite = state.favorites.includes(id);
  const alternatives = eligibleRecipes(state.profile).filter(r => r.id !== id);
  return <ScrollView contentContainerStyle={{ paddingBottom: 30, padding: wide ? 28 : 0 }}>
    <View style={{ flexDirection: wide ? 'row' : 'column', gap: wide ? 20 : 0, alignItems: wide ? 'flex-start' : 'stretch' }}>
    <ImageBackground source={recipeImages[recipe.id]} style={{ height: wide ? 450 : 290, width: wide ? '43%' : '100%', justifyContent: 'space-between', borderRadius: wide ? 22 : 0, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Voltar" style={{ padding: 11, backgroundColor: '#FFFFFFEE', borderRadius: 30 }}><Icon name="arrow-back" /></Pressable>
        <Pressable onPress={() => toggleFavorite(id)} accessibilityRole="button" accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} style={{ padding: 11, backgroundColor: '#FFFFFFEE', borderRadius: 30 }}><Icon name={favorite ? 'heart' : 'heart-outline'} color={favorite ? '#C65C69' : '#20291F'} /></Pressable>
      </View>
      <View style={{ backgroundColor: '#152013A8', padding: 20 }}><Text style={{ color: '#FFFFFF', fontSize: 28, lineHeight: 30, fontWeight: '800' }}>{recipe.name}</Text></View>
    </ImageBackground>
    <View style={{ padding: 22, gap: 20, flex: wide ? 1 : undefined, minWidth: 0 }}>
      <Card><View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 24 }}>
        {[['🔥', `${recipe.kcal}`, 'KCAL'], ['⏱️', `${recipe.minutes} min`, 'TEMPO'], ['👥', `${state.profile.people}`, 'PORÇÕES'], ['🌾', `${recipe.carbs} g`, 'CARBO'], ['💪', `${recipe.protein} g`, 'PROTEÍNA'], ['💧', `${recipe.fat} g`, 'GORDURA']].map(([emoji, value, label]) => <View key={label} style={{ width: '33.33%', alignItems: 'center', gap: 5 }}><Text style={{ fontSize: 23 }}>{emoji}</Text><Text style={{ fontWeight: '700', color: c.text }}>{value}</Text><Text style={{ fontSize: 11, letterSpacing: .6, color: c.muted }}>{label}</Text></View>)}
      </View></Card>
      <Text style={{ color: c.muted, fontSize: 14, lineHeight: 18 }}>Nutrição ilustrativa por pessoa. Estimativa para a receita: {money(recipe.cost * state.profile.people)}. A imagem do bowl de vegetais é apenas ilustrativa.</Text>
      <Text accessibilityRole="header" style={{ fontSize: 22, fontWeight: '700', color: c.text }}>Ingredientes</Text>
      <Card style={{ padding: 0 }}>{recipe.ingredients.map((ingredient, i) => <View key={ingredient.name} style={[ui.row, { padding: 16, borderTopWidth: i ? 1 : 0, borderColor: c.border }]}><Text style={{ fontSize: 26 }}>{ingredient.emoji}</Text><Text style={{ flex: 1, color: c.text }}>{ingredient.name}</Text><Text style={{ color: c.muted }}>{(ingredient.quantity * state.profile.people).toLocaleString('pt-BR')} {ingredient.unit}</Text></View>)}</Card>
      <Text accessibilityRole="header" style={{ fontSize: 22, fontWeight: '700', color: c.text }}>Modo de preparo</Text>
      {recipe.steps.map((step, i) => <View key={step} style={[ui.row, { alignItems: 'flex-start' }]}><Text style={{ color: c.forest, backgroundColor: '#E3EDC8', width: 28, height: 28, textAlign: 'center', paddingTop: 4, borderRadius: 14, overflow: 'hidden', fontWeight: '700' }}>{i + 1}</Text><Text style={{ color: c.text, fontSize: 17, lineHeight: 23, flex: 1 }}>{step}</Text></View>)}
      {!!day && <Button title={choosing ? 'Cancelar troca' : 'Trocar esta refeição'} icon="swap-horizontal" secondary onPress={() => setChoosing(!choosing)} />}
      {choosing && <View style={{ gap: 10 }}><Text style={{ color: c.muted }}>Escolha uma receita para {day}. O custo e a lista serão atualizados.</Text>{alternatives.map(alternative => <Chip key={alternative.id} title={`${alternative.name} · ${money(alternative.cost * state.profile.people)}`} selected={false} onPress={() => { swap(day!, alternative.id); setChoosing(false); onReplace(alternative.id); }} />)}{!alternatives.length && <Text style={{ color: c.muted }}>Não há outras receitas compatíveis no catálogo de demonstração.</Text>}</View>}
    </View>
    </View>
  </ScrollView>;
}
