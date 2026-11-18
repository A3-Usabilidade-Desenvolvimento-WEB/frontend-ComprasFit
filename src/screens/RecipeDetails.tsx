import React, { useState } from 'react';
import { ImageBackground, Pressable, ScrollView, Text, View } from 'react-native';
import { Button, Card, Chip, Icon, ui, useTheme } from '../components/ui';
import { errorText } from '../services/api';
import { recipeImages } from '../data/images';
import { eligibleRecipes } from '../data/planner';
import { useResponsive } from '../components/responsive';
import { useApp } from '../state/AppState';

export function RecipeDetails({ id, day, onBack, onReplace }: { id: string; day?: string; onBack: () => void; onReplace: (id: string) => void }) {
  const { state, toggleFavorite, swap, recipes, active } = useApp();
  const c = useTheme();
  const { wide } = useResponsive();
  const [choosing, setChoosing] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const people = active?.params.people ?? state.profile.people;
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return <Button title="Voltar ao início" onPress={onBack} />;
  const favorite = state.favorites.includes(id);
  const alternatives = eligibleRecipes(state.profile, recipes).filter(r => r.id !== id);
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
      <Text style={{ color: c.muted }}>{recipe.preparationMinutes != null && `${recipe.preparationMinutes} min · `}{people} porção(ões) · Receita-base para {recipe.servings}</Text>
      <Text accessibilityRole="header" style={{ fontSize: 22, fontWeight: '700', color: c.text }}>Ingredientes</Text>
      <Card style={{ padding: 0 }}>{recipe.ingredients.map((ingredient, i) => <View key={ingredient.name} style={[ui.row, { padding: 16, borderTopWidth: i ? 1 : 0, borderColor: c.border }]}><Text style={{ flex: 1, color: c.text }}>{ingredient.name}</Text><Text style={{ color: c.muted }}>{(ingredient.quantity * people / recipe.servings).toLocaleString('pt-BR')} {ingredient.unit}</Text></View>)}</Card>
      <Text accessibilityRole="header" style={{ fontSize: 22, fontWeight: '700', color: c.text }}>Modo de preparo</Text>
      {recipe.steps.map((step, i) => <View key={step} style={[ui.row, { alignItems: 'flex-start' }]}><Text style={{ color: c.forest, backgroundColor: '#E3EDC8', width: 28, height: 28, textAlign: 'center', paddingTop: 4, borderRadius: 14, overflow: 'hidden', fontWeight: '700' }}>{i + 1}</Text><Text style={{ color: c.text, fontSize: 17, lineHeight: 23, flex: 1 }}>{step}</Text></View>)}
      {!!message && <Text accessibilityRole="alert" style={{ color: c.text }}>{message}</Text>}
      {!!day && <Button busy={busy} title={choosing ? 'Cancelar troca' : 'Trocar esta refeição'} icon="swap-horizontal" secondary onPress={() => setChoosing(!choosing)} />}
      {choosing && <View style={{ gap: 10 }}><Text style={{ color: c.muted }}>Escolha uma receita para {day}. A API salvará um novo plano e recalculará a lista de compras.</Text>{alternatives.map(alternative => <Chip key={alternative.id} title={alternative.name} selected={false} onPress={async () => {
        if (busy || !day) return;
        setBusy(true); setMessage('');
        try { await swap(day, alternative.id); setChoosing(false); onReplace(alternative.id); }
        catch (e) { setMessage(errorText(e)); } finally { setBusy(false); }
      }} />)}{!alternatives.length && <Text style={{ color: c.muted }}>Não há outras receitas compatíveis no catálogo.</Text>}</View>}
    </View>
    </View>
  </ScrollView>;
}
