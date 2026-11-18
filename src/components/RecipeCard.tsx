import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { type Recipe } from '../services/api';
import { recipeImages } from '../data/images';
import { Card, Icon, ui, useTheme } from './ui';
import { useApp } from '../state/AppState';

export function RecipeCard({ recipe, day, onPress }: { recipe: Recipe; day?: string; onPress: () => void }) {
  const c = useTheme();
  const { state, toggleFavorite } = useApp();
  return <View style={{ borderRadius: 22, overflow: 'hidden', backgroundColor: c.white, borderWidth: 1, borderColor: c.border }}>
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Ver receita: ${recipe.name}`}>
      <View>
        {recipeImages[recipe.id] ? <Image source={recipeImages[recipe.id]} resizeMode="cover" style={{ width: '100%', height: 165 }} /> : <View style={{ height: 100, backgroundColor: c.white, alignItems: 'center', justifyContent: 'center' }}><Icon name="restaurant-outline" color={c.green} size={32} /></View>}
        {!!day && <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: '#FFFFFF', paddingVertical: 7, paddingHorizontal: 12, borderRadius: 14 }}><Text style={{ fontWeight: '800', color: '#176C4A', fontSize: 14 }}>{day}</Text></View>}
      </View>
      <View style={{ padding: 16, gap: 9 }}>
        <Text style={{ color: c.text, fontSize: 19, fontWeight: '800', lineHeight: 22 }}>{recipe.name}</Text>
        <Text style={{ color: c.muted }}>{recipe.preparationMinutes != null && `${recipe.preparationMinutes} min · `}{recipe.ingredients.length} ingredientes · {recipe.servings} porções na receita-base</Text>
      </View>
    </Pressable>
    <Pressable onPress={() => toggleFavorite(recipe.id)} accessibilityRole="button" accessibilityLabel={state.favorites.includes(recipe.id) ? `Remover ${recipe.name} dos favoritos` : `Favoritar ${recipe.name}`} hitSlop={10} style={{ position: 'absolute', top: 12, right: 12, backgroundColor: '#FFFFFF', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }}><Icon name={state.favorites.includes(recipe.id) ? 'heart' : 'heart-outline'} color={state.favorites.includes(recipe.id) ? '#CE5A6D' : '#176C4A'} size={20}/></Pressable>
  </View>;
}
