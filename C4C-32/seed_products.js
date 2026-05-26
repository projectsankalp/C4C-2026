const { supabaseAdmin } = require('./server/config/supabase');

const INITIAL_PRODUCTS = [
  {
    title: 'Earthen Sanctuary Vase',
    price: 4250,
    categoryName: 'Pottery & Ceramics',
    description: 'Inspired by the shifting dunes of the Thar desert, each Earthen Sanctuary Vase is hand-thrown using local red clay. The intricate geometric patterns are etched by hand using traditional bone tools, a process that takes over six hours per piece. Fired in a community open pit using dried husks, it features a warm earthy hue that perfectly complements modern minimalist spaces.',
    image_urls: ['/images/earthen-sanctuary-vase.png'],
    stock: 15,
    is_available: true,
    sellerEmail: 'meera@karigar.com'
  },
  {
    title: 'Terracotta Uru',
    price: 3400,
    categoryName: 'Pottery & Ceramics',
    description: 'A classic water carafe reimagined as an art piece. Handcrafted with traditional high-fire techniques, providing a stunning natural cooling texture and structural elegance.',
    image_urls: ['/images/terracotta-uru.png'],
    stock: 12,
    is_available: true,
    sellerEmail: 'meera@karigar.com'
  },
  {
    title: 'Indigo Silk Stole',
    price: 7200,
    categoryName: 'Hand-loom Textiles',
    description: 'Woven on wooden handlooms in Varanasi using raw Mulberry silk. Hand-dyed using organic wild indigo vats, presenting a breathtaking sapphire finish with traditional borders.',
    image_urls: ['/images/indigo-silk-stole.png'],
    stock: 8,
    is_available: true,
    sellerEmail: 'parvati@karigar.com'
  },
  {
    title: 'Carved Walnut Bowl',
    price: 4850,
    categoryName: 'Wooden Carvings',
    description: 'Sculpted from single blocks of seasoned wild walnut trees in the Kashmir Valley. Smoothly finished with raw organic wax, showcasing gorgeous dark natural grains.',
    image_urls: ['/images/carved-walnut-bowl.png'],
    stock: 10,
    is_available: true,
    sellerEmail: 'parvati@karigar.com'
  },
  {
    title: 'Dhokra Metal Nandi',
    price: 12000,
    categoryName: 'Metalwork (Dhokra)',
    description: 'Crafted using the 4,000-year-old lost-wax casting technique (Dhokra) by tribal metal smiths of Bastar. Solid brass metal structure representing the sacred bull Nandi.',
    image_urls: ['/images/dhokra-metal-nandi.png'],
    stock: 3,
    is_available: true,
    sellerEmail: 'meera@karigar.com'
  }
];

async function getOrCreateArtisan(email, name) {
  // 1. Check if auth user exists
  const { data: listUsers } = await supabaseAdmin.auth.admin.listUsers();
  let user = listUsers?.users?.find(u => u.email === email);

  if (!user) {
    console.log(`Creating user for ${email}...`);
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: 'password123',
      email_confirm: true,
      user_metadata: { full_name: name, role: 'seller' }
    });
    if (authError) throw authError;
    user = authData.user;
  }

  // 2. Create profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) {
    console.log(`Creating profile for ${name}...`);
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: user.id,
        full_name: name,
        role: 'seller',
        village: 'Bhuj',
        district: 'Kutch',
        state: 'Gujarat',
        bio: `${name} is a master artisan.`
      });
    if (profileError) throw profileError;
  }

  return user.id;
}

async function seedProducts() {
  console.log('Seeding products...');
  
  const meeraId = await getOrCreateArtisan('meera@karigar.com', 'Meera Devi');
  const parvatiId = await getOrCreateArtisan('parvati@karigar.com', 'Parvati Devi');

  // Fetch category UUID mapping
  const { data: cats } = await supabaseAdmin.from('categories').select('id, name');
  const catMap = {};
  cats.forEach(c => { catMap[c.name] = c.id; });

  for (const item of INITIAL_PRODUCTS) {
    const categoryId = catMap[item.categoryName];
    const sellerId = item.sellerEmail === 'meera@karigar.com' ? meeraId : parvatiId;

    // Check if product already exists
    const { data: existing } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('title', item.title)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabaseAdmin
        .from('products')
        .insert({
          title: item.title,
          description: item.description,
          price: item.price,
          stock: item.stock,
          category_id: categoryId,
          image_urls: item.image_urls,
          seller_id: sellerId,
          is_available: true
        });
      
      if (error) {
        console.error(`Failed to insert product ${item.title}:`, error.message);
      } else {
        console.log(`Inserted product: ${item.title}`);
      }
    } else {
      console.log(`Product already exists: ${item.title}`);
    }
  }

  console.log('Product seeding completed!');
  process.exit(0);
}

seedProducts().catch(err => {
  console.error('Seed products error:', err);
  process.exit(1);
});
