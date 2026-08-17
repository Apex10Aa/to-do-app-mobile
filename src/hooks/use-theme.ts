import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  // useColorScheme can return null/undefined during first render; fall back to 'light'
  const resolved = scheme === 'dark' ? 'dark' : 'light';
  return Colors[resolved];
}
