import React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Button, Card, Heading, Icon, useTheme } from '../components/ui';
import { useApp } from '../state/AppState';

const ACCOUNT_KEY = 'comprasfit_local_account_v1';
const SESSION_KEY = 'comprasfit_local_session_v1';
type LocalAccount = { name: string; email: string; password: string };
const inputStyle = (color: string, borderColor: string) => ({ color, borderColor, borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 18, marginTop: 7 });

export function Account({ onBack }: { onBack: () => void }) {
  const c = useTheme();
  const { state, updateProfile } = useApp();
  const [mode, setMode] = React.useState<'landing' | 'signup' | 'login' | 'profile'>('landing');
  const [name, setName] = React.useState(state.profile.name || '');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');
  React.useEffect(() => {
    Promise.all([SecureStore.getItemAsync(ACCOUNT_KEY), SecureStore.getItemAsync(SESSION_KEY)])
      .then(([raw, session]) => {
        if (raw) {
          const account: LocalAccount = JSON.parse(raw);
          setName(account.name); setEmail(account.email);
          if (session === account.email) { setMode('profile'); updateProfile({ name: account.name }); }
        }
      }).catch(() => setMessage('Não foi possível ler a conta local deste aparelho.'));
  }, []);
  const save = async () => {
    setMessage(''); setBusy(true);
    try {
      const cleanName = name.trim(); const cleanEmail = email.trim().toLowerCase();
      if (!cleanName || !/^\S+@\S+\.\S+$/.test(cleanEmail) || password.length < 8 || password !== confirm) {
        setMessage('Preencha nome, e-mail válido e senha de pelo menos 8 caracteres, com confirmação igual.'); return;
      }
      if (await SecureStore.getItemAsync(ACCOUNT_KEY)) { setMessage('Já existe uma conta local neste aparelho. Entre com ela.'); return; }
      await SecureStore.setItemAsync(ACCOUNT_KEY, JSON.stringify({ name: cleanName, email: cleanEmail, password }));
      await SecureStore.setItemAsync(SESSION_KEY, cleanEmail);
      updateProfile({ name: cleanName }); setPassword(''); setConfirm(''); setMode('profile');
    } catch { setMessage('Não foi possível salvar a conta no armazenamento seguro.'); }
    finally { setBusy(false); }
  };
  const login = async () => {
    setMessage(''); setBusy(true);
    try {
      const raw = await SecureStore.getItemAsync(ACCOUNT_KEY);
      const account: LocalAccount | null = raw ? JSON.parse(raw) : null;
      if (!account || account.email !== email.trim().toLowerCase() || account.password !== password) {
        setMessage('E-mail ou senha incorretos, ou nenhuma conta local cadastrada.'); return;
      }
      await SecureStore.setItemAsync(SESSION_KEY, account.email);
      updateProfile({ name: account.name }); setName(account.name); setPassword(''); setMode('profile');
    } catch { setMessage('Não foi possível entrar na conta local.'); }
    finally { setBusy(false); }
  };
  const updateName = async () => {
    setMessage(''); setBusy(true);
    try {
      const raw = await SecureStore.getItemAsync(ACCOUNT_KEY);
      if (!raw || !name.trim()) { setMessage('Informe um nome válido.'); return; }
      const account: LocalAccount = JSON.parse(raw);
      await SecureStore.setItemAsync(ACCOUNT_KEY, JSON.stringify({ ...account, name: name.trim() }));
      updateProfile({ name: name.trim() }); setMessage('Nome atualizado!');
    } catch { setMessage('Não foi possível atualizar o perfil.'); }
    finally { setBusy(false); }
  };
  const logout = async () => {
    try { await SecureStore.deleteItemAsync(SESSION_KEY); setPassword(''); setMode('landing'); setMessage('Você saiu da conta local. Seus dados do planejamento continuam neste celular.'); }
    catch { setMessage('Não foi possível encerrar a sessão.'); }
  };
  const field = (label: string, value: string, onChangeText: (value: string) => void, options: { secure?: boolean; email?: boolean } = {}) =>
    <View><Text style={{ color: c.text, fontWeight: '600' }}>{label}</Text><TextInput accessibilityLabel={label} style={inputStyle(c.text, c.border)} value={value} onChangeText={onChangeText} secureTextEntry={options.secure} autoCapitalize={options.email ? 'none' : 'sentences'} keyboardType={options.email ? 'email-address' : 'default'} autoCorrect={!options.email && !options.secure} /></View>;
  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, gap: 20 }}>
    <Pressable onPress={onBack} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Icon name="arrow-back" color={c.text} /><Text style={{ color: c.text }}>Voltar às configurações</Text></Pressable>
    <Heading title="Minha conta" subtitle="Seu perfil, do seu jeito." />
    <Card style={{ gap: 18 }}>
      {mode === 'landing' && <><Text style={{ color: c.text, fontSize: 20, fontWeight: '700' }}>Você escolhe como usar</Text><Text style={{ color: c.muted, lineHeight: 22 }}>Criar uma conta é opcional. Você pode continuar planejando suas compras sem cadastro.</Text><Button title="Criar conta" onPress={() => { setMode('signup'); setMessage(''); }} /><Button title="Entrar" secondary onPress={() => { setMode('login'); setMessage(''); }} /><Button title="Continuar sem conta" secondary onPress={onBack} /></>}
      {mode === 'signup' && <><Text style={{ color: c.text, fontSize: 21, fontWeight: '700' }}>Criar conta local</Text>{field('Nome', name, setName)}{field('E-mail', email, setEmail, { email: true })}{field('Senha (mínimo 8 caracteres)', password, setPassword, { secure: true })}{field('Confirmar senha', confirm, setConfirm, { secure: true })}<Button title="Cadastrar" busy={busy} onPress={save} /><Button title="Já tenho conta" secondary onPress={() => { setMode('login'); setMessage(''); }} /></>}
      {mode === 'login' && <><Text style={{ color: c.text, fontSize: 21, fontWeight: '700' }}>Entrar na conta</Text>{field('E-mail', email, setEmail, { email: true })}{field('Senha', password, setPassword, { secure: true })}<Button title="Entrar" busy={busy} onPress={login} /><Button title="Voltar" secondary onPress={() => { setMode('landing'); setMessage(''); }} /></>}
      {mode === 'profile' && <><Text style={{ color: c.text, fontSize: 21, fontWeight: '700' }}>Perfil local</Text>{field('Nome', name, setName)}<Text style={{ color: c.muted }}>{email}</Text><Button title="Salvar nome" busy={busy} onPress={updateName} /><Button title="Sair da conta" secondary onPress={logout} /></>}
      {!!message && <Text accessibilityRole="alert" style={{ color: c.forest, lineHeight: 21 }}>{message}</Text>}
    </Card>
    <Text style={{ color: c.muted, fontSize: 14, lineHeight: 19 }}>Versão sem backend: somente uma conta local por aparelho, sem sincronização, redefinição de senha ou autenticação online. As credenciais são guardadas no armazenamento seguro do dispositivo. Não use uma senha importante nesta demonstração.</Text>
  </ScrollView>;
}
