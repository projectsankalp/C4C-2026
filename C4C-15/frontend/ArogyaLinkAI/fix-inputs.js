const fs = require('fs');
const files = [
  'app/index.tsx',
  'app/add-patient.tsx',
  'app/patient-list.tsx',
  'app/patient-survey.tsx',
  'app/visits.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Replace any hardcoded placeholderTextColor
  content = content.replace(/placeholderTextColor="[^"]+"/g, "placeholderTextColor={colors.textMuted}");

  // Remove the inline style hack I previously added in index.tsx
  content = content.replace(/style=\{\[styles\.input, \{ color: colors\.text \}\]\}/g, 'style={styles.input}');
  content = content.replace(/style=\{\[styles\.passwordInput, \{ color: colors\.text \}\]\}/g, 'style={styles.passwordInput}');

  // Add color: colors.text to any style key ending in 'Input' or just 'input'
  content = content.replace(/(\s+)(\w*input|Input): \{\r?\n/gi, '$1$2: {\n$1  color: colors.text,\n');

  // Some components might have hardcoded icon colors next to inputs
  content = content.replace(/color="#[A-Fa-f0-9]+"/g, 'color={colors.icon}');

  fs.writeFileSync(file, content);
}
