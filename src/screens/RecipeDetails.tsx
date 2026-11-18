import React, { useRef, useState } from 'react';
import { FlatList, Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Icon, ui, useTheme } from '../components/ui';
import { errorText, type Recipe } from '../services/api';
import { recipePhotos } from '../data/images';
import { eligibleRecipes } from '../data/planner';
import { useResponsive } from '../components/responsive';
import { useApp } from '../state/AppState';

function RecipeContent({ recipe, onBack, backLabel, children }: {
  recipe: Recipe;
  onBack: () => void;
  backLabel: string;
  children?: React.ReactNode;
}) {
  const { state, active, toggleFavorite } = useApp();
  const c = useTheme();
  const { wide } = useResponsive();
  const people = active?.params.people ?? state.profile.people;
  const photo = recipePhotos[recipe.id];
  const credit = photo?.credit;
  const sideBySide = wide && !!photo;
  const favorite = state.favorites.includes(recipe.id);

  return <ScrollView contentContainerStyle={{ padding: wide ? 28 : 0, paddingBottom: 30 }}>
    <View style={{ flexDirection: sideBySide ? 'row' : 'column', gap: sideBySide ? 20 : 0, alignItems: sideBySide ? 'flex-start' : 'stretch' }}>
      <View style={{ width: sideBySide ? '43%' : '100%' }}>
        <View style={{ minHeight: photo ? (sideBySide ? 400 : 260) : undefined, backgroundColor: c.white, justifyContent: 'space-between', borderRadius: wide ? 22 : 0, overflow: 'hidden' }}>
          {photo && <Image source={photo.source} accessibilityLabel={recipe.name} resizeMode="cover" style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} />}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
            <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={backLabel} style={styles.roundButton}><Icon name="arrow-back" /></Pressable>
            <Pressable onPress={() => toggleFavorite(recipe.id)} accessibilityRole="button" accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} style={styles.roundButton}><Icon name={favorite ? 'heart' : 'heart-outline'} color={favorite ? '#C65C69' : '#20291F'} /></Pressable>
          </View>
          <View style={{ backgroundColor: photo ? '#152013B3' : c.white, padding: 20 }}><Text accessibilityRole="header" style={{ color: photo ? '#FFFFFF' : c.text, fontSize: 28, lineHeight: 32, fontWeight: '800' }}>{recipe.name}</Text></View>
        </View>
        {credit && <Text accessibilityRole="link" onPress={() => { void Linking.openURL(credit.url); }} style={{ paddingHorizontal: 12, paddingVertical: 8, color: c.muted, fontSize: 12, textDecorationLine: 'underline' }}>Foto ilustrativa · {credit.author}</Text>}
        {photo && !credit && <Text style={{ paddingHorizontal: 12, paddingVertical: 8, color: c.muted, fontSize: 12 }}>Imagem ilustrativa gerada por IA para esta receita</Text>}
      </View>
      <View style={{ padding: 22, gap: 20, flex: sideBySide ? 1 : undefined, minWidth: 0 }}>
        <Text style={{ color: c.muted }}>{recipe.preparationMinutes != null && `${recipe.preparationMinutes} min · `}{people} porção(ões) · Receita-base para {recipe.servings}</Text>
        {children}
        <Text accessibilityRole="header" style={{ fontSize: 22, fontWeight: '700', color: c.text }}>Ingredientes</Text>
        <Card style={{ padding: 0 }}>{recipe.ingredients.map((ingredient, i) => <View key={ingredient.name} style={[ui.row, { padding: 16, borderTopWidth: i ? 1 : 0, borderColor: c.border }]}><View style={{ flex: 1, gap: 3 }}><Text style={{ color: c.text }}>{ingredient.name}</Text>{ingredient.foodRole && <Text style={{ color: ingredient.mainProtein ? c.green : c.muted, fontSize: 13 }}>{ingredient.foodRole}{ingredient.mainProtein ? ' · principal' : ''}</Text>}</View><Text style={{ color: c.muted }}>{(ingredient.quantity * people / recipe.servings).toLocaleString('pt-BR')} {ingredient.unit}</Text></View>)}</Card>
        <Text accessibilityRole="header" style={{ fontSize: 22, fontWeight: '700', color: c.text }}>Modo de preparo</Text>
        {recipe.steps.map((step, i) => <View key={step} style={[ui.row, { alignItems: 'flex-start' }]}><Text style={{ color: c.forest, backgroundColor: '#E3EDC8', width: 28, height: 28, textAlign: 'center', paddingTop: 4, borderRadius: 14, overflow: 'hidden', fontWeight: '700' }}>{i + 1}</Text><Text style={{ color: c.text, fontSize: 17, lineHeight: 23, flex: 1 }}>{step}</Text></View>)}
      </View>
    </View>
  </ScrollView>;
}

export function RecipeDetails({ id, day, onBack, onReplace }: { id: string; day?: string; onBack: () => void; onReplace: (id: string) => void }) {
  const { state, swap, recipes, toggleExcludedRecipe } = useApp();
  const c = useTheme();
  const { columns } = useResponsive();
  const [choosing, setChoosing] = useState(false);
  const [preview, setPreview] = useState<Recipe | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return <Button title="Voltar ao início" onPress={onBack} />;
  const excluded = state.profile.excludedRecipeIds.includes(id);
  const alternatives = eligibleRecipes(state.profile, recipes).filter(r => r.id !== id);

  function goBackInPicker() {
    if (saving.current) return;
    setMessage('');
    if (preview) setPreview(null);
    else setChoosing(false);
  }

  async function confirmSwap() {
    if (!day || !preview || saving.current) return;
    saving.current = true;
    setBusy(true);
    setMessage('');
    try {
      await swap(day, preview.id);
      setChoosing(false);
      setPreview(null);
      onReplace(preview.id);
    } catch (e) {
      setMessage(errorText(e));
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  return <>
    <RecipeContent key={id} recipe={recipe} onBack={onBack} backLabel="Voltar">
      {!!day && <Button title="Trocar esta refeição" icon="swap-horizontal" secondary onPress={() => setChoosing(true)} />}
      <Button title={excluded ? 'Voltar a incluir esta receita' : 'Evitar nos próximos cardápios'} secondary onPress={() => toggleExcludedRecipe(id)} />
    </RecipeContent>
    {choosing && <Modal visible animationType="slide" onRequestClose={goBackInPicker}>
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center' }}>
        <View style={{ flex: 1, width: '100%', maxWidth: 1120 }}>
          {preview && <RecipeContent recipe={preview} onBack={goBackInPicker} backLabel="Voltar às opções">
            {!!message && <Text accessibilityRole="alert" style={{ color: c.text }}>{message}</Text>}
            <Text style={{ color: c.muted }}>Substituir {recipe.name} no cardápio de {day}.</Text>
            <Button title="Confirmar troca" busy={busy} onPress={confirmSwap} />
          </RecipeContent>}
          <View style={{ flex: 1, display: preview ? 'none' : 'flex' }}>
            <View style={{ padding: 20, gap: 8, borderBottomWidth: 1, borderColor: c.border }}>
              <Pressable onPress={goBackInPicker} accessibilityRole="button" accessibilityLabel="Cancelar troca" style={{ alignSelf: 'flex-start', paddingVertical: 8 }}>
                <Text style={{ color: c.green, fontWeight: '700' }}>Cancelar troca</Text>
              </Pressable>
              <Text accessibilityRole="header" style={{ fontSize: 26, fontWeight: '800', color: c.text }}>Trocar refeição</Text>
              <Text style={{ color: c.muted }}>Escolha uma receita para {day}. Toque na imagem para ver os ingredientes e o preparo.</Text>
            </View>
            <FlatList key={columns} data={alternatives} numColumns={columns} keyExtractor={r => r.id}
              contentContainerStyle={{ padding: 16, gap: 12 }} columnWrapperStyle={columns > 1 ? { gap: 12 } : undefined}
              ListEmptyComponent={<Text style={{ color: c.muted }}>Não há outras receitas compatíveis no catálogo.</Text>}
              renderItem={({ item }) => {
                const photo = recipePhotos[item.id];
                return <Pressable accessibilityRole="button" accessibilityLabel={`Visualizar ${item.name}`} onPress={() => setPreview(item)}
                  style={({ pressed }) => [styles.option, { width: columns === 3 ? '32%' : columns === 2 ? '48%' : '100%', backgroundColor: c.white, borderColor: c.border, opacity: pressed ? 0.8 : 1 }]}>
                  {photo && <Image source={photo.source} resizeMode="cover" style={styles.thumbnail} />}
                  <View style={{ flex: 1, padding: 12, gap: 6 }}>
                    <Text style={{ color: c.text, fontSize: 16, lineHeight: 21, fontWeight: '700' }}>{item.name}</Text>
                    <Text style={{ color: c.muted, fontSize: 13 }}>{item.preparationMinutes != null && `${item.preparationMinutes} min · `}{item.ingredients.length} ingredientes</Text>
                  </View>
                </Pressable>;
              }} />
          </View>
        </View>
      </SafeAreaView>
    </Modal>}
  </>;
}

const styles = StyleSheet.create({
  roundButton: { padding: 11, backgroundColor: '#FFFFFFEE', borderRadius: 30 },
  option: { flexDirection: 'row', alignItems: 'center', minHeight: 98, overflow: 'hidden', borderRadius: 16, borderWidth: 1 },
  thumbnail: { width: '33%', height: 104 },
});
