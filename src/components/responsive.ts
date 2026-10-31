import { Platform, useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width } = useWindowDimensions();
  const wide = Platform.OS === 'web' && width >= 900;
  const columns = Platform.OS === 'web' && width >= 1400 ? 3 : Platform.OS === 'web' && width >= 700 ? 2 : 1;
  return { wide, columns, width };
}
