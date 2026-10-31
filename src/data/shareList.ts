import { Share } from 'react-native';

export async function shareList(message: string): Promise<string> {
  await Share.share({ message });
  return '';
}

export function downloadList(_message: string): void {
  // The native app uses the system sharing sheet instead.
}
