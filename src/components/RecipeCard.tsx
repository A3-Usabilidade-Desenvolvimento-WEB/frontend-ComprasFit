import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import type { Recipe } from '../services/api';
import { recipePhotos } from '../data/images';
import { Icon, useTheme } from './ui';
import { useApp } from '../state/AppState';

export function RecipeCard({ recipe, day, onPress }: { recipe: Recipe; day?: string; onPress: () => void }) {
  const c = useTheme();
  const { state, toggleFavorite } = useApp();
  const favorite = state.favorites.includes(recipe.id);
  const photo = recipePhotos[recipe.id];

  return <View style={{ borderRadius: 22, overflow: 'hidden', backgroundColor: c.white, borderWidth: 1, borderColor: c.border }}>
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Ver receita: ${recipe.name}`}>
      {photo && <View>
        <Image source={photo.source} resizeMode="cover" style={{ width: '100%', height: 165 }} />
        {day && <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: '#FFFFFF', paddingVertical: 7, paddingHorizontal: 12, borderRadius: 14 }}>
          <Text style={{ fontWeight: '800', color: '#176C4A', fontSize: 14 }}>{day}</Text>
        </View>}
      </View>}
      <View style={{ padding: 16, gap: 9, paddingRight: photo ? 16 : 60 }}>
        {!photo && day && <Text style={{ color: c.green, fontWeight: '700' }}>{day}</Text>}
        <Text style={{ color: c.text, fontSize: 19, fontWeight: '800', lineHeight: 22 }}>{recipe.name}</Text>
        <Text style={{ color: c.muted }}>{recipe.preparationMinutes != null && `${recipe.preparationMinutes} min · `}{recipe.ingredients.length} ingredientes · {recipe.servings} porções na receita-base</Text>
      </View>
    </Pressable>
    <Pressable onPress={() => toggleFavorite(recipe.id)} accessibilityRole="button" accessibilityLabel={favorite ? `Remover ${recipe.name} dos favoritos` : `Favoritar ${recipe.name}`} hitSlop={8} style={{ position: 'absolute', top: 12, right: 12, backgroundColor: photo ? '#FFFFFF' : c.white, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }}>
      <Icon name={favorite ? 'heart' : 'heart-outline'} color={favorite ? '#CE5A6D' : c.green} size={20} />
    </Pressable>
  </View>;
}
