const { supabaseAdmin } = require('./server/config/supabase');

const categories = [
  { name: 'Pottery & Ceramics', icon_name: 'pottery' },
  { name: 'Hand-loom Textiles', icon_name: 'textile' },
  { name: 'Metalwork (Dhokra)', icon_name: 'metal' },
  { name: 'Wooden Carvings', icon_name: 'wood' },
];

async function seed() {
  console.log('Seeding categories...');
  for (const cat of categories) {
    const { data: existing } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('name', cat.name)
      .maybeSingle();

    if (!existing) {
      const { data, error } = await supabaseAdmin
        .from('categories')
        .insert(cat)
        .select()
        .single();
      
      if (error) {
        console.error(`Failed to insert category ${cat.name}:`, error.message);
      } else {
        console.log(`Inserted category: ${cat.name} (${data.id})`);
      }
    } else {
      console.log(`Category already exists: ${cat.name} (${existing.id})`);
    }
  }
  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
