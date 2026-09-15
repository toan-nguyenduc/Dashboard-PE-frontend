import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

export const getAntdTheme = (isDark: boolean): ThemeConfig => {
  return {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#90caf9', // primary color matching Material UI dark palette
      fontFamily: 'Inter, Roboto, sans-serif',
      borderRadius: 8,
      colorBgContainer: isDark ? '#1e1e1e' : '#ffffff',
      colorBgElevated: isDark ? '#1e1e1e' : '#ffffff',
      colorBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    components: {
      Table: {
        headerBg: isDark ? '#121212' : '#f8f9fa',
        rowHoverBg: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9',
        headerSplitColor: 'transparent',
      },
      Drawer: {
        colorBgElevated: isDark ? '#121212' : '#ffffff',
      },
    },
    cssVar: { prefix: 'antd' },
    hashed: false,
  };
};
