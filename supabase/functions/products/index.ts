// Supabase Edge Function: Products API (read-only)
// Using Supabase REST API directly via fetch
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const branchId = url.searchParams.get("branchId");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Fetch products using Supabase REST API
    let productsUrl = `${supabaseUrl}/rest/v1/products?select=id,name,description,category,image_url`;
    if (category) {
      productsUrl += `&category=eq.${encodeURIComponent(category)}`;
    }

    const productsRes = await fetch(productsUrl, {
      headers: {
        "apikey": supabaseKey!,
        "Authorization": `Bearer ${supabaseKey}`,
      },
    });

    if (!productsRes.ok) {
      throw new Error(`Products fetch failed: ${productsRes.statusText}`);
    }

    const products = await productsRes.json();

    // If branchId provided, fetch branch inventory
    if (branchId && products.length > 0) {
      const productIds = products.map((p: any) => p.id).join(",");
      const bpUrl = `${supabaseUrl}/rest/v1/branch_products?branch_id=eq.${branchId}&product_id=in.(${productIds})&select=product_id,price,is_available,stock_quantity`;

      const bpRes = await fetch(bpUrl, {
        headers: {
          "apikey": supabaseKey!,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      });

      if (bpRes.ok) {
        const branchProducts = await bpRes.json();
        const inventory: Record<number, any> = {};
        
        for (const bp of branchProducts) {
          inventory[bp.product_id] = {
            price: bp.price,
            is_available: bp.is_available,
            stock_quantity: bp.stock_quantity,
          };
        }

        // Merge inventory into products
        for (const product of products) {
          if (inventory[product.id]) {
            Object.assign(product, inventory[product.id]);
          }
        }
      }
    }

    return new Response(JSON.stringify({ items: products }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || String(err) }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
