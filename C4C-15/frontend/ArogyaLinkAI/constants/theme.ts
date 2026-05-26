/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#111827',
    textMuted: '#6B7280',
    textInverse: '#ffffff',
    background: '#F4F7F9',
    cardBackground: '#ffffff',
    tint: '#19a38c',
    icon: '#6B7280',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#19a38c',
    border: '#E2E8F0',
    headerBackground: '#19a38c',
    primary: '#2563EB',
    success: '#16A34A',
    danger: '#DC2626',
    warning: '#EA580C',
    overlay: 'rgba(0,0,0,0.35)',
    iconBgRed: '#FEE2E2',
    iconBgOrange: '#FFEDD5',
    iconBgBlue: '#DBEAFE',
    iconBgGreen: '#DCFCE7',
  },
  dark: {
    text: '#F9FAFB',
    textMuted: '#9CA3AF',
    textInverse: '#ffffff',
    background: '#111827',
    cardBackground: '#1F2937',
    tint: '#34D399',
    icon: '#9CA3AF',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#34D399',
    border: '#374151',
    headerBackground: '#1F2937',
    primary: '#3B82F6',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F97316',
    overlay: 'rgba(0,0,0,0.7)',
    iconBgRed: '#7F1D1D',
    iconBgOrange: '#7C2D12',
    iconBgBlue: '#1E3A8A',
    iconBgGreen: '#064E3B',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
