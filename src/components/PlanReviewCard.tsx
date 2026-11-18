import React, { useState } from 'react';
import { Text } from 'react-native';
import { api, errorText, type PlanReview } from '../services/api';
import { Button, Card, useTheme } from './ui';

export function PlanReviewCard({ userId, planningId }: { userId: string; planningId: string }) {
  const c = useTheme();
  const [review, setReview] = useState<PlanReview>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function reviewCurrentPlan() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      setReview(await api.review(userId, planningId));
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
    {review?.tips.map(tip => <Text key={tip} style={{ color: c.text, lineHeight: 22 }}>{tip}</Text>)}
    {review?.source === 'gemini' && <Text style={{ color: c.muted, fontSize: 13 }}>Dicas priorizadas pelo Gemini</Text>}
    {!!error && <Text accessibilityRole="alert" style={{ color: c.text }}>{error}</Text>}
    {!!error && <Button title="Tentar novamente" secondary busy={busy} onPress={reviewCurrentPlan} />}
  </Card>;
}
