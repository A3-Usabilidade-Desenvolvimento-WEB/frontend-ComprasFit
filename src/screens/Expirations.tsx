import React, { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button, Card, useTheme } from '../components/ui';
import { api, errorText, type Expiration } from '../services/api';
import { useApp } from '../state/AppState';

export function Expirations() {
  const { session } = useApp();
  const user = session?.user.id;
  const c = useTheme();
  const [rows, setRows] = useState<Expiration[]>([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let current = true;
    if (user) api.expirations(user).then(list => { if (current) setRows(list); })
      .catch(e => { if (current) setMessage(errorText(e)); });
    return () => { current = false; };
  }, [user, attempt]);
  async function register() {
    if (!user) return;
    setBusy(true); setMessage('');
    try {
      const added = await api.register(user, { name: name.trim(), expirationDate: date.trim() });
      setRows(old => [...old, added].sort((a,b) => a.expirationDate.localeCompare(b.expirationDate)));
      setName(''); setDate(''); setAttempt(n => n + 1);
    } catch (e) { setMessage(errorText(e)); } finally { setBusy(false); }
  }
  const input = { padding: 12, color: c.text, borderColor: c.border, borderWidth: 1, borderRadius: 12 };
  return <Card style={{ gap: 12 }}>
    <Text accessibilityRole="header" style={{ color: c.text, fontWeight: '700', fontSize: 20 }}>Validade dos alimentos</Text>
    {rows.map(row => <View key={row.id}><Text style={{ color: c.text }}>{row.name} · {row.expirationDate.split('-').reverse().join('/')}</Text>
      <Text style={{ color: c.muted }}>{row.daysLeft < 0 ? 'Vencido' : row.daysLeft === 0 ? 'Vence hoje' : 'Vence em ' + row.daysLeft + ' dias'}</Text></View>)}
    <TextInput accessibilityLabel="Nome do alimento" placeholder="Nome do alimento" placeholderTextColor={c.muted} style={input} value={name} onChangeText={setName} maxLength={100} />
    <TextInput accessibilityLabel="Data de validade" placeholder="AAAA-MM-DD" placeholderTextColor={c.muted} style={input} value={date} onChangeText={setDate} maxLength={10} />
    <Button title="Registrar validade" secondary busy={busy} disabled={!name.trim() || !date} onPress={register} />
    {!!message && <><Text accessibilityRole="alert" style={{ color: c.text }}>{message}</Text>
      <Button title="Atualizar validades" secondary onPress={() => { setMessage(''); setAttempt(n => n + 1); }} /></>}
  </Card>;
}
