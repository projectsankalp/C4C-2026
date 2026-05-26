import translate from 'translate';
import fs from 'fs';

// Import all your arrays
import { BUSINESS_STAGES } from './src/components/data/businessStages';
import { REVENUE_RANGES } from './src/components/data/revenueRanges';
import { NEED_CATEGORIES } from './src/components/data/needCategories';
import { REGISTRATIONS } from './src/components/data/registrations';

translate.engine = 'google'; 

const TARGET_LANGUAGES = ['hi', 'ta', 'bn', 'kan', 'te']; 

async function translateArray(array: any[], lang: string) {
  const translatedArray = [];
  
  for (const item of array) {
    console.log(`Translating ${item.label} to ${lang}...`);
    
    translatedArray.push({
      ...item,
      label: await translate(item.label, { to: lang }),
      description: item.description ? await translate(item.description, { to: lang }) : undefined,
      capital: item.capital ? await translate(item.capital, { to: lang }) : undefined,
      supportFocus: item.supportFocus ? await translate(item.supportFocus, { to: lang }) : undefined,
    });
  }
  return translatedArray;
}

async function run() {
  for (const lang of TARGET_LANGUAGES) {
    console.log(`\n--- Generating ${lang.toUpperCase()} ---`);
    
    // Create the locale folder automatically if it doesn't exist
    const dir = `./src/locales/${lang}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Await all translations
    const translatedStages = await translateArray(BUSINESS_STAGES, lang);
    const translatedRevenue = await translateArray(REVENUE_RANGES, lang);
    const translatedNeeds = await translateArray(NEED_CATEGORIES, lang);
    const translatedRegistrations = await translateArray(REGISTRATIONS, lang);
    
    // Save to localized JSON files
    fs.writeFileSync(`${dir}/businessStages.json`, JSON.stringify(translatedStages, null, 2));
    fs.writeFileSync(`${dir}/revenueRanges.json`, JSON.stringify(translatedRevenue, null, 2));
    fs.writeFileSync(`${dir}/needCategories.json`, JSON.stringify(translatedNeeds, null, 2));
    fs.writeFileSync(`${dir}/registrations.json`, JSON.stringify(translatedRegistrations, null, 2));
  }
  console.log("\n✅ All Translations Complete!");
}

run();