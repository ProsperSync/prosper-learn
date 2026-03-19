import { useColorScheme } from 'react-native';

export interface ThemeColors {
  primary: { main: string; light: string; dark: string };
  background: { primary: string; secondary: string };
  text: { primary: string; secondary: string; disabled: string };
  border: { default: string; light: string };
  success: string;
  warning: string;
  error: string;
}

const lightColors: ThemeColors = {
  primary: { main: '#4CAF50', light: '#81C784', dark: '#388E3C' },
  background: { primary: '#FFFFFF', secondary: '#F2F2F7' },
  text: { primary: '#1A1A1A', secondary: '#666666', disabled: '#999999' },
  border: { default: '#E0E0E0', light: '#F0F0F0' },
  success: '#4CAF50',
  warning: '#FF9500',
  error: '#F44336',
};

const darkColors: ThemeColors = {
  primary: { main: '#66BB6A', light: '#A5D6A7', dark: '#2E7D32' },
  background: { primary: '#1C1C1E', secondary: '#2C2C2E' },
  text: { primary: '#FFFFFF', secondary: '#ABABAB', disabled: '#666666' },
  border: { default: '#3A3A3C', light: '#48484A' },
  success: '#66BB6A',
  warning: '#FFB74D',
  error: '#EF5350',
};

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    colors: isDark ? darkColors : lightColors,
    isDark,
  };
}