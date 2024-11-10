import { ref } from 'vue';
import { useQuasar } from 'quasar';

export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

export const themes: Theme[] = [
  {
    name: 'Tecnológico',
    primary: '3498db',
    secondary: '1abc9c',
    accent: 'e8f6f3',
    background: 'FFFFFF'
  },
  {
    name: 'Azul Marino',
    primary: '1A237E',
    secondary: 'FF7043',
    accent: 'E8EAF6',
    background: 'FFFFFF'
  },
  {
    name: 'Gris Profesional',
    primary: '424242',
    secondary: 'BBDEFB',
    accent: '2E7D32',
    background: 'FFFDE7'
  },
  {
    name: 'Mandarina',
    primary: 'FF8C42',
    secondary: '37474F',
    accent: 'A5D6A7',
    background: 'FFFFFF'
  },
  {
    name: 'Azul Cielo',
    primary: '64B5F6',
    secondary: 'F9A825',
    accent: 'ECEFF1',
    background: '212121'
  },
  {
    name: 'Verde Oliva',
    primary: '8D6E63',
    secondary: 'FF7043',
    accent: 'E0E0E0',
    background: 'FFFFFF'
  },
  {
    name: 'Azul Marino Profundo',
    primary: '0D47A1',
    secondary: 'FF5722',
    accent: 'C8E6C9',
    background: '37474F'
  },
  {
    name: 'Marrón Elegante',
    primary: '3E2723',
    secondary: 'AED581',
    accent: 'F5F5F5',
    background: 'FFF8E1'
  },
  {
    name: 'Gris Oscuro',
    primary: '263238',
    secondary: 'FF8F00',
    accent: 'B3E5FC',
    background: 'FFFFFF'
  },
  {
    name: 'Azul Corporativo',
    primary: '0D47A1',
    secondary: '66BB6A',
    accent: 'CFD8DC',
    background: 'FFAB91'
  },
  {
    name: 'Negro Moderno',
    primary: '212121',
    secondary: 'FF7043',
    accent: 'A5D6A7',
    background: 'F1F1F1'
  },
  {
    name: 'Verde Naturaleza',
    primary: '2E7D32',
    secondary: 'FDD835',
    accent: 'F1F8E9',
    background: 'FFFFFF'
  },
  {
    name: 'Púrpura Real',
    primary: '4A148C',
    secondary: '00BCD4',
    accent: 'F3E5F5',
    background: 'FFFFFF'
  },
  {
    name: 'Rojo Ejecutivo',
    primary: 'B71C1C',
    secondary: '455A64',
    accent: 'FFEBEE',
    background: 'FAFAFA'
  },
  {
    name: 'Verde Agua',
    primary: '00695C',
    secondary: 'FF6F00',
    accent: 'E0F2F1',
    background: 'FFFFFF'
  },
  {
    name: 'Índigo Noche',
    primary: '1A237E',
    secondary: '00BFA5',
    accent: 'E8EAF6',
    background: 'FFFFFF'
  },
  {
    name: 'Ámbar Dorado',
    primary: 'FF6F00',
    secondary: '37474F',
    accent: 'FFF8E1',
    background: 'FFFFFF'
  },
  {
    name: 'Verde Bosque',
    primary: '1B5E20',
    secondary: 'FFA000',
    accent: 'E8F5E9',
    background: 'FFFFFF'
  },
  {
    name: 'Azul Nórdico',
    primary: '0277BD',
    secondary: 'FFB300',
    accent: 'E1F5FE',
    background: 'FFFFFF'
  },
  {
    name: 'Gris Plata',
    primary: '455A64',
    secondary: '00BCD4',
    accent: 'ECEFF1',
    background: 'FFFFFF'
  }
];

export function useTheme() {
  const $q = useQuasar();
  const currentTheme = ref(themes[0]);

  function setTheme(theme: Theme) {
    if (!theme) return;
    
    currentTheme.value = theme;
    
    // Update CSS variables
    document.documentElement.style.setProperty('--q-primary', `#${theme.primary}`);
    document.documentElement.style.setProperty('--q-secondary', `#${theme.secondary}`);
    document.documentElement.style.setProperty('--q-accent', `#${theme.accent}`);
    document.documentElement.style.setProperty('--q-background', `#${theme.background}`);
    
    // Update body background
    document.body.style.backgroundColor = `#${theme.background}`;
    
    // Update Quasar dark mode based on background color
    const isDark = theme.background === '212121' || theme.background === '37474F';
    if ($q && typeof $q.dark?.set === 'function') {
      $q.dark.set(isDark);
    }

    // Update Quasar brand colors if available
    if ($q && typeof $q.brand?.set === 'function') {
      $q.brand.set({
        primary: theme.primary,
        secondary: theme.secondary,
        accent: theme.accent
      });
    }
  }

  return {
    currentTheme,
    themes,
    setTheme
  };
}