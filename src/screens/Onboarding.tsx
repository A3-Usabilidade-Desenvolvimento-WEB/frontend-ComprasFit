import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Button, Chip, Heading, Icon, ui, useTheme } from '../components/ui';
import { marketImages } from '../data/images';
import { goalOptions, weekdays } from '../data/recipes';
import { appliances, eligibleRecipes, money } from '../data/planner';
import type { MealCoverage, Profile } from '../data/planner';
import { useResponsive } from '../components/responsive';
import { useApp } from '../state/AppState';
import { normalizePersonName, personNameError, personNameMaxLength } from '../data/personName';


const mealOptions: { label: string; value: MealCoverage }[] = [
  { label: 'Almoço e jantar', value: 'lunch-dinner' },
  { label: 'Só jantar', value: 'dinner' },
  { label: 'Só lanche', value: 'snack' },
];

export function Onboarding({ onFinish, editing = false, onCancel, initialStep = 1, welcomeOnly = false, onStart }: { onFinish: () => void; editing?: boolean; onCancel?: () => void; initialStep?: number; welcomeOnly?: boolean; onStart?: () => void }) {
  const [step, setStep] = useState(welcomeOnly ? 0 : initialStep);
  const { state, generate, recipes, markets } = useApp();
  const [profile, setProfile] = useState(state.profile);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const updateProfile = (patch: Partial<Profile>) => setProfile(current => ({ ...current, ...patch }));
  const c = useTheme();
  const { wide } = useResponsive();
  const toggle = (key: 'days' | 'goals' | 'restrictions' | 'appliances', value: string) => {
    let next = profile[key].includes(value) ? profile[key].filter(item => item !== value) : [...profile[key], value];
    if (key === 'goals' && next.length > 3) return;
    if (key === 'restrictions') next = value === 'Nenhuma' ? [] : next;
    updateProfile({ [key]: next });
  };
  const validName = normalizePersonName(profile.name);
  const valid = step === 1 ? validName !== null : step === 4 ? profile.days.length > 0 : step === 8 ? eligibleRecipes(profile, recipes).length > 0 : true;
  const alternativeAppliances = step === 8 && !valid
    ? appliances.filter(appliance => eligibleRecipes({ ...profile, appliances: [appliance] }, recipes).length > 0)
    : [];
  const finish = async () => {
    if (generating) return;
    if (!validName) {
      setStep(1);
      setMessage(personNameError);
      return;
    }
    setGenerating(true); setMessage('');
    try { await generate({ ...profile, name: validName }); onFinish(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Falha ao gerar o planejamento.'); }
    finally { setGenerating(false); }
  };
  if (generating) return <View style={{ flex: 1, backgroundColor: c.bg, paddingHorizontal: 30, paddingTop: 52, paddingBottom: 42, justifyContent: 'space-between' }}>
    <Text accessibilityRole="header" style={{ fontSize: 26, fontWeight: '800', color: c.text, lineHeight: 33 }}>Estamos planejando sua semana</Text>
    <View style={{ alignItems: 'center', gap: 22 }}>
      <Text style={{ fontSize: 92 }}>🛒</Text>
      <ActivityIndicator size="large" color={c.green} />
      <Text style={{ fontSize: 16, color: c.muted, textAlign: 'center' }}>Organizando suas refeições e sua lista de compras…</Text>
    </View>
  </View>;
  if (step === 0) return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
    <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingHorizontal: 22, paddingTop: wide ? 36 : 22, paddingBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12 }}>
        <View style={{ width: 40, height: 40, backgroundColor: '#E8F5EC', borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}><Icon name="leaf" color={c.forest} size={27} /></View>
        <Text style={{ fontSize: 29, fontWeight: '800', color: c.forest, letterSpacing: -1 }}>ComprasFit</Text>
      </View>
      <Text style={{ color: c.muted, fontSize: 14, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 }}>SUA ROTINA MAIS LEVE</Text>
      <View style={{ width: '100%', maxWidth: 410, height: wide ? 360 : 300, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <View style={{ position: 'absolute', width: 270, height: 270, borderRadius: 150, backgroundColor: '#EFF8EE' }} />
        <Image source={require('../../assets/salada.jpg')} style={{ position: 'absolute', left: 0, top: 22, width: 105, height: 105, borderRadius: 52, transform: [{ rotate: '-17deg' }] }} />
        <Image source={require('../../assets/arroz.jpg')} style={{ position: 'absolute', right: -6, top: 66, width: 96, height: 96, borderRadius: 48, transform: [{ rotate: '14deg' }] }} />
        <Image source={require('../../assets/macarrao.jpg')} style={{ position: 'absolute', left: 6, bottom: 10, width: 92, height: 92, borderRadius: 46, transform: [{ rotate: '11deg' }] }} />
        <View style={{ width: 190, height: 282, borderRadius: 31, backgroundColor: '#18392C', padding: 7, transform: [{ rotate: '-5deg' }], elevation: 9, shadowColor: '#143A2B', shadowOpacity: 0.2, shadowRadius: 15, shadowOffset: { width: 0, height: 9 } }}>
          <View style={{ flex: 1, borderRadius: 25, backgroundColor: '#FFFFFF', padding: 12, overflow: 'hidden' }}>
            <View style={{ width: 49, height: 8, borderRadius: 5, backgroundColor: '#18392C', alignSelf: 'center', marginBottom: 18 }} />
            <Text style={{ color: '#1B4937', fontSize: 13, fontWeight: '800' }}>ComprasFit</Text>
            <Text style={{ color: '#203A2E', fontSize: 18, fontWeight: '800', marginTop: 12 }}>Seu cardápio,</Text>
            <Text style={{ color: '#203A2E', fontSize: 18, fontWeight: '800' }}>do seu jeito.</Text>
            <View style={{ marginTop: 15, padding: 11, backgroundColor: '#EAF5E9', borderRadius: 12 }}>
              <Text style={{ color: '#377351', fontSize: 11, fontWeight: '700' }}>PLANEJAMENTO DA SEMANA</Text>
              <Text style={{ color: '#193F2E', fontSize: 16, fontWeight: '800', marginTop: 5 }}>Coma bem 🌿</Text>
              <Text style={{ color: '#4D745D', fontSize: 11, marginTop: 4 }}>Receitas e compras em um só lugar</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 7, marginTop: 12 }}>
              <Image source={require('../../assets/salada.jpg')} style={{ width: 62, height: 57, borderRadius: 9 }} />
              <Image source={require('../../assets/macarrao.jpg')} style={{ width: 62, height: 57, borderRadius: 9 }} />
            </View>
            <View style={{ height: 8, width: '70%', backgroundColor: '#E6EEE8', borderRadius: 4, marginTop: 13 }} />
            <View style={{ height: 8, width: '50%', backgroundColor: '#E6EEE8', borderRadius: 4, marginTop: 6 }} />
          </View>
        </View>
      </View>
      <Text accessibilityRole="header" style={{ color: c.text, fontSize: wide ? 39 : 32, lineHeight: wide ? 46 : 39, fontWeight: '800', textAlign: 'center', letterSpacing: -1.1, marginTop: 12 }}>Coma bem. Planeje menos.{ '\n' }Viva mais.</Text>
      <Text style={{ color: c.muted, fontSize: 17, lineHeight: 23, textAlign: 'center', marginTop: 12, maxWidth: 360 }}>Monte seu jantar do seu jeito: dentro do orçamento, com o que você gosta e usando o que já tem na cozinha.</Text>
    </ScrollView>
    <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 22, backgroundColor: '#FFFFFF', width: '100%', maxWidth: 480, alignSelf: 'center' }}><Button title="Começar" icon="arrow-forward" onPress={() => welcomeOnly ? onStart?.() : setStep(1)} /></View>
  </View>;
  const titles = ['','Qual é seu nome?', 'Escolha seu supermercado', 'Para quantas pessoas você cozinha?', 'Em quais dias você vai cozinhar?', 'Qual é seu orçamento semanal?', 'Qual é seu objetivo?', 'Alguma restrição alimentar?', 'Quais eletrodomésticos você possui?'];
  const subtitles = ['', 'Vamos deixar tudo com a sua cara.', 'Seu mercado favorito para planejar a semana.', 'Selecione o número de pessoas.', 'Escolha os dias das suas refeições planejadas.', 'Escolha quanto você quer investir nas refeições.', 'Escolha até 3 opções que combinam com você.', 'Selecione todas que se aplicam.', 'Selecione pelo menos um para o planejamento.'];
  return <View style={{ flex: 1, width: '100%', maxWidth: wide ? 660 : undefined, alignSelf: 'center', paddingVertical: wide ? 20 : 0 }}>
    <View style={[ui.row, { padding: 24 }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => editing && step === initialStep ? onCancel?.() : setStep(Math.max(editing ? 1 : 0, step - 1))} hitSlop={12}><Icon name="arrow-back" color={c.text} /></Pressable>
      <View style={{ flex: 1, height: 4, borderRadius: 4, backgroundColor: c.border }}><View style={{ height: 4, borderRadius: 4, backgroundColor: c.green, width: `${step / 8 * 100}%` }} /></View>
      <Text style={{ color: c.muted, fontSize: 14 }}>{step}/8</Text>
    </View>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 26, paddingBottom: 24, flexGrow: 1 }}>
      <Heading title={titles[step]!} subtitle={subtitles[step]} />
      <View style={{ flex: 1, justifyContent: step === 1 || step === 2 ? 'flex-start' : 'center', paddingVertical: 32, gap: 16 }}>
        {step === 1 && <TextInput accessibilityLabel="Seu nome" placeholder="Digite aqui" placeholderTextColor={c.muted} value={profile.name} onChangeText={name => { setMessage(''); updateProfile({ name }); }} autoCapitalize="words" maxLength={personNameMaxLength} returnKeyType="next" onSubmitEditing={() => valid && setStep(2)} style={{ backgroundColor: c.white, color: c.text, borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 18, fontSize: 20 }} />}
        {step === 1 && !!profile.name && !validName && !message && <Text accessibilityRole="alert" style={{ color: c.text }}>{personNameError}</Text>}
        {step === 2 && <><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{markets.length === 0 && <Text style={{ color: c.muted }}>Nenhum supermercado cadastrado. Você pode continuar.</Text>}{markets.map((market) => <View key={market} style={{ width: '30%', flexGrow: 1 }}><Pressable accessibilityRole="button" accessibilityLabel={market} onPress={() => updateProfile({ market })} style={{ alignItems: 'center', padding: 10, borderWidth: profile.market === market ? 2 : 1, borderColor: profile.market === market ? c.green : c.border, borderRadius: 18, gap: 6 }}>{marketImages[market] ? <Image source={marketImages[market]} resizeMode="contain" style={{ width: 64, height: 44 }} /> : <Icon name="basket-outline" color={c.green} />}<Text style={{ color: c.text, fontSize: 13, textAlign: 'center' }}>{market}</Text></Pressable></View>)}</View><Text style={{ color: c.muted, fontSize: 14 }}>Sua preferência fica salva neste dispositivo. O orçamento usa preços acadêmicos de referência.</Text></>}
        {step === 3 && <><View style={[ui.row, { justifyContent: 'center', gap: 35 }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Diminuir pessoas" disabled={profile.people <= 1} onPress={() => updateProfile({ people: profile.people - 1 })} style={{ padding: 12, backgroundColor: c.white, borderRadius: 30, opacity: profile.people <= 1 ? .35 : 1 }}><Icon name="remove" color={c.text} /></Pressable>
          <Text style={{ fontSize: 74, fontWeight: '800', color: c.text }}>{profile.people}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Aumentar pessoas" disabled={profile.people >= 12} onPress={() => updateProfile({ people: profile.people + 1 })} style={{ padding: 12, backgroundColor: c.white, borderRadius: 30, opacity: profile.people >= 12 ? .35 : 1 }}><Icon name="add" color={c.text} /></Pressable>
        </View><Text style={{ textAlign: 'center', color: c.muted }}>{profile.people === 1 ? 'pessoa' : 'pessoas'}</Text></>}
        {step === 4 && <>
          <Text accessibilityRole="header" style={{ color: c.text, fontSize: 17, fontWeight: '700' }}>Refeições por dia</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {mealOptions.map(option => <Chip key={option.value} title={option.label} selected={profile.coverage === option.value} onPress={() => updateProfile({ coverage: option.value })} />)}
          </View>
          <Text style={{ textAlign: 'center', color: c.muted }}>{profile.days.length} dias selecionados</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{weekdays.map(day => <View key={day} style={{ width: '46%', flexGrow: 1 }}><Chip title={day} selected={profile.days.includes(day)} onPress={() => toggle('days', day)} /></View>)}</View></>}
        {step === 5 && <><Text style={{ fontSize: 58, fontWeight: '800', textAlign: 'center', color: c.text }}>{money(profile.budget)}</Text><Text style={{ textAlign: 'center', color: c.muted }}>de limite para as refeições selecionadas</Text><Slider accessibilityLabel="Orçamento semanal" minimumValue={30} maximumValue={750} step={5} value={profile.budget} onValueChange={budget => updateProfile({ budget })} minimumTrackTintColor={c.green} maximumTrackTintColor={c.border} thumbTintColor={c.green} style={{ width: '100%', height: 48 }} /><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: c.muted }}>R$ 30</Text><Text style={{ color: c.muted }}>R$ 750</Text></View></>}
        {step === 6 && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{goalOptions.map(goal => <View key={goal.name} style={{ width: '46%', flexGrow: 1 }}><Chip title={goal.label ?? goal.name} emoji={goal.emoji} color={goal.color} selected={profile.goals.includes(goal.name)} onPress={() => toggle('goals', goal.name)} /></View>)}</View>}
        {step === 7 && <><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{['Nenhuma', 'Vegetariano', 'Vegano', 'Peixe', 'Glúten'].map((restriction, i) => <View key={restriction} style={{ width: '46%', flexGrow: 1 }}><Chip title={restriction} emoji={['🍽️','🥕','🥬','🐟','🌾'][i]} selected={restriction === 'Nenhuma' ? !profile.restrictions.length : profile.restrictions.includes(restriction)} onPress={() => toggle('restrictions', restriction)} /></View>)}</View><Text style={{ color: c.muted, fontSize: 14 }}>Confira sempre os rótulos dos produtos em caso de alergias.</Text></>}
        {step === 8 && <><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{appliances.map((appliance, i) => <View key={appliance} style={{ width: '46%', flexGrow: 1 }}><Chip title={appliance} emoji={['🍳','♨️','🥘','🍞'][i]} selected={profile.appliances.includes(appliance)} onPress={() => toggle('appliances', appliance)} /></View>)}</View>{!valid && <Text style={{ color: '#B44335', lineHeight: 22 }}>{alternativeAppliances.length
          ? `Selecione um equipamento com receitas compatíveis: ${alternativeAppliances.join(', ')}.`
          : 'Nenhuma receita combina com o tipo de refeição e as restrições selecionadas. Volte para ajustar suas escolhas.'}</Text>}</>}
      </View>
    </ScrollView>
    {!!message && <Text accessibilityRole="alert" style={{ paddingHorizontal: 24, color: c.text }}>{message}</Text>}
    <View style={{ padding: 24 }}><Button title={step === 8 ? 'Montar minha semana' : 'Continuar'} disabled={!valid} onPress={() => step === 8 ? finish() : setStep(step + 1)} icon="arrow-forward" /></View>
  </View>;
}
