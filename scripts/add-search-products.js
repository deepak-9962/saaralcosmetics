const fs = require('fs');

const filePath = 'src/lib/supabase/data.ts';
let content = fs.readFileSync(filePath, 'utf8');

const searchFunc = `
export async function searchProducts(searchTerm: string, limit = 10): Promise<Product[]> {
  const cleanTerm = searchTerm.trim();
  if (!cleanTerm) return listFeaturedProducts(limit);

  try {
    const supabase = getSupabaseBrowserClient() as any;
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .or(\`name.ilike.%\${cleanTerm}%,description.ilike.%\${cleanTerm}%,category.ilike.%\${cleanTerm}%\`)
      .order("price", { ascending: true })
      .limit(limit);

    if (error) throw error;
    if (data && data.length > 0) {
      const seen = new Set<string>();
      return data
        .map((row: any) => normalizeProduct(row))
        .filter((p: Product) => {
          if (seen.has(p.name)) return false;
          seen.add(p.name);
          return true;
        });
    }
  } catch (err) {
    console.warn("Supabase search fallback:", err);
  }

  const lower = cleanTerm.toLowerCase();
  return MOCK_PRODUCTS.filter(
    (p) =>
      p.is_active &&
      (p.name.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower) ||
        (p.description && p.description.toLowerCase().includes(lower)))
  ).slice(0, limit);
}
`;

if (!content.includes('export async function searchProducts')) {
  const target = 'export async function getProductVariants';
  if (content.includes(target)) {
    content = content.replace(target, searchFunc + '\n' + target);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('SUCCESS: searchProducts inserted.');
  } else {
    console.error('ERROR: Target string not found in data.ts');
    process.exit(1);
  }
} else {
  console.log('INFO: searchProducts already exists in data.ts');
}

