-- Check categories and their product counts
SELECT 
    c.id,
    c.name,
    c.name_ar,
    COUNT(DISTINCT p.id) as product_count,
    COUNT(DISTINCT bp.product_id) as branch_product_count
FROM categories c
LEFT JOIN products p ON (p.category = c.name OR p.category = c.name_ar)
LEFT JOIN branch_products bp ON bp.product_id = p.id
WHERE c.parent_id IS NULL
GROUP BY c.id, c.name, c.name_ar
ORDER BY c.display_order, c.name_ar;

-- Show sample products with their categories
SELECT DISTINCT category, COUNT(*) as count
FROM products
GROUP BY category
ORDER BY count DESC
LIMIT 20;
