const fs = require('fs');
const files = [
  'app/dashboard.tsx',
  'app/add-patient.tsx',
  'app/patient-list.tsx',
  'app/patient-survey.tsx',
  'app/visits.tsx',
  'app/index.tsx'
];

const colorMap = {
  'color="#fff"': 'color={colors.textInverse}',
  'color="#ffffff"': 'color={colors.textInverse}',
  'color="#111827"': 'color={colors.text}',
  'color="#6B7280"': 'color={colors.textMuted}',
  'color="#D1FAE5"': 'color={colors.iconBgGreen}',
  'color="#DC2626"': 'color={colors.danger}',
  'color="#EA580C"': 'color={colors.warning}',
  'color="#2563EB"': 'color={colors.primary}',
  'color="#16A34A"': 'color={colors.success}',
  'color="#7C3AED"': 'color={colors.primary}',
  'color="#19a38c"': 'color={colors.tint}',
  "backgroundColor: '#F4F7F9'": "backgroundColor: colors.background",
  "backgroundColor: '#dff5f0'": "backgroundColor: colors.background",
  "backgroundColor: '#fff'": "backgroundColor: colors.cardBackground",
  "backgroundColor: '#ffffff'": "backgroundColor: colors.cardBackground",
  "backgroundColor: '#f5f7f7'": "backgroundColor: colors.cardBackground",
  "backgroundColor: '#19a38c'": "backgroundColor: colors.headerBackground",
  "backgroundColor: 'rgba(0,0,0,0.35)'": "backgroundColor: colors.overlay",
  "backgroundColor: '#FEE2E2'": "backgroundColor: colors.iconBgRed",
  "backgroundColor: '#FFEDD5'": "backgroundColor: colors.iconBgOrange",
  "backgroundColor: '#DBEAFE'": "backgroundColor: colors.iconBgBlue",
  "backgroundColor: '#DCFCE7'": "backgroundColor: colors.iconBgGreen",
  "color: '#111827'": "color: colors.text",
  "color: '#111'": "color: colors.text",
  "color: '#374151'": "color: colors.text",
  "color: '#6B7280'": "color: colors.textMuted",
  "color: '#6b6b6b'": "color: colors.textMuted",
  "color: '#9CA3AF'": "color: colors.textMuted",
  "color: '#8a8a8a'": "color: colors.textMuted",
  "color: '#fff'": "color: colors.textInverse",
  "color: '#D1FAE5'": "color: colors.textInverse",
  "color: '#ff4d4d'": "color: colors.danger",
  "color: '#19a38c'": "color: colors.tint",
  "borderColor: '#E5E7EB'": "borderColor: colors.border",
};

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Convert StyleSheet.create to createStyles if not already
  if (content.includes('const styles = StyleSheet.create({')) {
    content = content.replace('const styles = StyleSheet.create({', 'const createStyles = (colors: any) => StyleSheet.create({');
    
    // Inject hook if not present
    if (!content.includes('useColorScheme')) {
      content = content.replace("import {", "import { useColorScheme } from 'react-native';\nimport { Colors } from '../constants/theme';\nimport {");
      
      const componentMatch = content.match(/export default function \w+\(\) \{/);
      if (componentMatch) {
        content = content.replace(componentMatch[0], componentMatch[0] + "\n  const colorScheme = useColorScheme() ?? 'light';\n  const colors = Colors[colorScheme as keyof typeof Colors];\n  const styles = createStyles(colors);\n");
      }
    }
  }

  // Replace colors
  for (const [key, value] of Object.entries(colorMap)) {
    content = content.split(key).join(value);
  }

  fs.writeFileSync(file, content);
}
