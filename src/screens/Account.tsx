import React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { requireAuth } from '../services/auth';
import { errorText } from '../services/api';
import { Button, Card, Heading, Icon, useTheme } from '../components/ui';
import { useApp } from '../state/AppState';
import { normalizePersonName, personNameError, personNameMaxLength } from '../data/personName';

const inputStyle = (color: string, borderColor: string) => ({ color, borderColor, borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 18, marginTop: 7 });

export function Account({ onBack }: { onBack?: () => void }) {
  const c = useTheme();
  const { state, session, updateProfile } = useApp();
  const [mode, setMode] = React.useState<'signup' | 'login' | 'profile'>(session ? 'profile' : 'login');
  const [name, setName] = React.useState(state.profile.name || '');
  const [email, setEmail] = React.useState(session?.user.email || '');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');
  async function perform(action: () => Promise<void>) {
    setMessage(''); setBusy(true);
    try { await action(); } catch (error) { setMessage(errorText(error)); } finally { setBusy(false); }
  }
  const save = () => perform(async () => {
    const validName = normalizePersonName(name);
    if (!validName) throw new Error(personNameError);
    if (password.length < 8) throw new Error('Use uma senha com pelo menos 8 caracteres.');
    if (password !== confirm) throw new Error('As senhas precisam ser iguais.');
    const { data, error } = await requireAuth().signUp({ email: email.trim(), password, options: { data: { name: validName } } });
    if (error) throw error;
    setPassword(''); setConfirm('');
    if (!data.session) { setMode('login'); setMessage('Confira seu e-mail para confirmar a conta e depois entre.'); }
  });
  const login = () => perform(async () => {
    const { error } = await requireAuth().signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
  });
  const guest = () => perform(async () => {
    const { error } = await requireAuth().signInAnonymously();
    if (error) throw error;
  });
  const updateName = () => perform(async () => {
    const validName = normalizePersonName(name);
    if (!validName) throw new Error(personNameError);
    const { error } = await requireAuth().updateUser({ data: { name: name.trim() } });
    if (error) throw error;
    setName(validName);
    updateProfile({ name: validName }); setMessage('Nome atualizado.');
  });
  const logout = () => perform(async () => {
    const { error } = await requireAuth().signOut({ scope: 'local' });
    if (error) throw error;
  });
  const field = (label: string, value: string, onChangeText: (value: string) => void, options: { secure?: boolean; email?: boolean; maxLength?: number } = {}) =>
    <View><Text style={{ color: c.text, fontWeight: '600' }}>{label}</Text><TextInput accessibilityLabel={label} style={inputStyle(c.text, c.border)} value={value} onChangeText={onChangeText} maxLength={options.maxLength} secureTextEntry={options.secure} autoCapitalize={options.email || options.secure ? 'none' : 'sentences'} keyboardType={options.email ? 'email-address' : 'default'} autoCorrect={!options.email && !options.secure} /></View>;
  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, gap: 20 }}>
    {onBack && <Pressable onPress={onBack} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Icon name="arrow-back" color={c.text} /><Text style={{ color: c.text }}>Voltar</Text></Pressable>}
    <Heading title="Minha conta" subtitle="Seu perfil, do seu jeito." />
    <Card style={{ gap: 18 }}>
      {mode === 'signup' && <><Text style={{ color: c.text, fontSize: 21, fontWeight: '700' }}>Criar conta</Text>{field('Nome', name, setName, { maxLength: personNameMaxLength })}{field('E-mail', email, setEmail, { email: true })}{field('Senha (mínimo 8 caracteres)', password, setPassword, { secure: true })}{field('Confirmar senha', confirm, setConfirm, { secure: true })}<Button title="Cadastrar" busy={busy} onPress={save} /><Button title="Já tenho conta" secondary onPress={() => { setMode('login'); setMessage(''); }} /></>}
      {mode === 'login' && <><Text style={{ color: c.text, fontSize: 21, fontWeight: '700' }}>Entrar na conta</Text>{field('E-mail', email, setEmail, { email: true })}{field('Senha', password, setPassword, { secure: true })}<Button title="Entrar" busy={busy} onPress={login} /><Button title="Criar conta" secondary onPress={() => { setMode('signup'); setMessage(''); }} /></>}
      {mode === 'profile' && <><Text style={{ color: c.text, fontSize: 21, fontWeight: '700' }}>Meu perfil</Text>{field('Nome', name, setName, { maxLength: personNameMaxLength })}<Text style={{ color: c.muted }}>{email}</Text><Button title="Salvar nome" busy={busy} onPress={updateName} /><Button title="Sair da conta" secondary onPress={logout} /></>}
      {!session && mode === 'login' && <Button title="Entrar como visitante" secondary busy={busy} onPress={guest} />}
      {session?.user.is_anonymous && <Text style={{ color: c.muted }}>Ao sair, você perde o acesso a esta sessão de visitante.</Text>}
      {!!message && <Text accessibilityRole="alert" style={{ color: c.forest, lineHeight: 21 }}>{message}</Text>}
    </Card>
  </ScrollView>;
}
