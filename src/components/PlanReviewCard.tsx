import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { api, errorText, type PlanReview } from '../services/api';
import { Button, Card, useTheme } from './ui';

export function PlanReviewCard({ userId, planningId, eligibleRecipeIds }: { userId: string; planningId: string; eligibleRecipeIds: string[] }) {
  const c = useTheme();
  const [review, setReview] = useState<PlanReview>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function reviewCurrentPlan() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      setReview(await api.review(userId, planningId, eligibleRecipeIds));
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setBusy(false);
    }
  }

  if (!review && !error) {
    return <Button title="Analisar meu cardápio" secondary busy={busy} onPress={reviewCurrentPlan} />;
  }
  return <Card style={{ gap: 10 }}>
    <Text accessibilityRole="header" style={{ color: c.text, fontSize: 19, fontWeight: '700' }}>Análise do cardápio</Text>
    {review?.sections?.map(section => <View key={section.title} style={{ gap: 3 }}>
      <Text accessibilityRole="header" style={{ color: c.forest, fontSize: 15, fontWeight: '700' }}>{section.title}</Text>
      <Text style={{ color: c.text, lineHeight: 22 }}>{section.detail}</Text>
    </View>)}
    {!!review?.tips.length && <Text accessibilityRole="header" style={{ color: c.forest, fontSize: 15, fontWeight: '700' }}>Próximos passos</Text>}
    {review?.tips.map(tip => <Text key={tip} style={{ color: c.text, lineHeight: 22 }}>{tip}</Text>)}
    {review?.source === 'gemini' && <Text style={{ color: c.muted, fontSize: 13 }}>Dicas priorizadas pelo Gemini</Text>}
    {!!error && <Text accessibilityRole="alert" style={{ color: c.text }}>{error}</Text>}
    {!!error && <Button title="Tentar novamente" secondary busy={busy} onPress={reviewCurrentPlan} />}
  </Card>;
}
