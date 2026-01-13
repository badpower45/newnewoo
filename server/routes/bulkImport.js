import express from 'express';
import multer from 'multer';
import * as xlsx from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../database.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
            'text/csv'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only Excel and CSV files are allowed.'));
        }
    }
});

// Column mapping (support both English and Arabic names)
const COLUMN_MAPPING = {
    // Required fields
    'name': ['name', 'product_name', 'اسم المنتج', 'الاسم', 'المنتج', 'اسم'],
    'barcode': ['barcode', 'الباركود', 'باركود', 'Barcode'],
    'old_price': ['old_price', 'originalPrice', 'السعر قبل', 'السعر القديم', 'سعر قبل', 'السعر الاصلي', 'discount_price'],
    'price': ['price', 'السعر بعد', 'السعر', 'سعر بعد', 'سعر', 'Price', 'السعر الحالي'],
    'category': ['category', 'التصنيف الاساسي', 'التصنيف الأساسي', 'القسم', 'الفئة', 'Category', 'التصنيف'],
    'subcategory': ['subcategory', 'sub_category', 'التصنيف الثانوي', 'تصنيف ثانوي', 'Subcategory'],
    'branch_id': ['branch_id', 'branchId', 'الفرع', 'فرع', 'معرف الفرع', 'Branch'],
    'stock_quantity': ['stock_quantity', 'stockQuantity', 'الكمية', 'الكميه', 'كمية', 'كميه', 'Stock', 'عدد القطع المتوفره', 'المخزون'],
    'image': ['image', 'image_url', 'الصورة', 'صورة', 'صوره', 'Image', 'لينك الصوره'],
    'expiry_date': ['expiry_date', 'expiryDate', 'تاريخ الصلاحيه', 'تاريخ الصلاحية', 'صلاحيه', 'صلاحية', 'Expiry']
};

const normalizeCategoryValue = (value = '') =>
    value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/أ|إ|آ/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/\s+/g, '')
        .replace(/[-_]/g, '');

const buildCategoryIndex = async () => {
    const { rows } = await query('SELECT id, name, name_ar, parent_id FROM categories');
    const byId = new Map();
    const rootMap = new Map();
    const subMapByParent = new Map();
    const subMapGlobal = new Map();

    rows.forEach((row) => {
        byId.set(row.id, row);
        const keys = [row.name, row.name_ar].filter(Boolean).map(normalizeCategoryValue);
        if (row.parent_id) {
            const map = subMapByParent.get(row.parent_id) || new Map();
            keys.forEach((key) => {
                if (!map.has(key)) map.set(key, row);
                if (!subMapGlobal.has(key)) subMapGlobal.set(key, row);
            });
            subMapByParent.set(row.parent_id, map);
        } else {
            keys.forEach((key) => {
                if (!rootMap.has(key)) rootMap.set(key, row);
            });
        }
    });

    return { byId, rootMap, subMapByParent, subMapGlobal };
};

const mapCategoryValues = (rawCategory, rawSubcategory, categoryIndex) => {
    const categoryKey = rawCategory ? normalizeCategoryValue(rawCategory) : '';
    const subcategoryKey = rawSubcategory ? normalizeCategoryValue(rawSubcategory) : '';
    const matchedCategory = categoryKey ? categoryIndex.rootMap.get(categoryKey) : null;
    const subMap = matchedCategory ? categoryIndex.subMapByParent.get(matchedCategory.id) : null;
    const matchedSubcategory = subcategoryKey
        ? (subMap?.get(subcategoryKey) || categoryIndex.subMapGlobal.get(subcategoryKey))
        : null;
    const parentCategory = !matchedCategory && matchedSubcategory?.parent_id
        ? categoryIndex.byId.get(matchedSubcategory.parent_id)
        : null;

    return {
        category: (matchedCategory || parentCategory)?.name_ar || (matchedCategory || parentCategory)?.name || rawCategory || null,
        subcategory: matchedSubcategory?.name_ar || matchedSubcategory?.name || rawSubcategory || null,
        matchedCategory: Boolean(matchedCategory || parentCategory),
        matchedSubcategory: Boolean(matchedSubcategory)
    };
};

// Find column value by multiple possible names
function findColumnValue(row, possibleNames) {
    for (const name of possibleNames) {
        const lowerName = name.toLowerCase();
        for (const [key, value] of Object.entries(row)) {
            if (key.toLowerCase() === lowerName && value !== undefined && value !== null && value !== '') {
                return value;
            }
        }
    }
    return null;
}

// Extract and map data from row (FLEXIBLE - allows partial data)
function mapRowToProduct(row, rowIndex) {
    const product = {};
    const errors = [];
    const warnings = [];
    
    // Required fields (but we'll be flexible)
    const allFields = [
        'name', 'barcode', 'old_price', 'price', 'category', 
        'subcategory', 'branch_id', 'stock_quantity', 'image', 'expiry_date'
    ];
    
    // Extract all available fields
    for (const field of allFields) {
        const value = findColumnValue(row, COLUMN_MAPPING[field]);
        if (value || value === 0) {
            product[field] = value;
        } else {
            // Just warn, don't fail
            warnings.push(`Missing field: ${field}`);
        }
    }
    
    // Basic validation (very lenient)
    if (product.price) {
        const priceNum = parseFloat(product.price);
        if (isNaN(priceNum) || priceNum < 0) {
            errors.push('السعر بعد غير صحيح - يجب أن يكون رقم');
        } else {
            product.price = priceNum;
        }
    }
    
    if (product.old_price) {
        const oldPriceNum = parseFloat(product.old_price);
        if (isNaN(oldPriceNum) || oldPriceNum < 0) {
            warnings.push('السعر قبل غير صحيح');
            product.old_price = null;
        } else {
            product.old_price = oldPriceNum;
        }
    }
    
    if (product.stock_quantity) {
        const stockNum = parseInt(product.stock_quantity);
        if (isNaN(stockNum) || stockNum < 0) {
            warnings.push('الكمية غير صحيحة');
            product.stock_quantity = 0;
        } else {
            product.stock_quantity = stockNum;
        }
    }
    
    if (product.branch_id) {
        const branchNum = parseInt(product.branch_id);
        if (isNaN(branchNum) || branchNum <= 0) {
            warnings.push('معرف الفرع غير صحيح');
            product.branch_id = 1; // Default branch
        } else {
            product.branch_id = branchNum;
        }
    }
    
    // Calculate discount percentage
    if (product.old_price && product.price && product.old_price > product.price) {
        product.discount_percentage = Math.round(((product.old_price - product.price) / product.old_price) * 100);
    } else {
        product.discount_percentage = 0;
    }
    
    return { product, errors, warnings, rowIndex };
}

// POST /api/products/bulk-import - Import products from Excel
router.post('/bulk-import', [verifyToken, isAdmin, upload.single('file')], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        console.log('Processing Excel file:', req.file.originalname);
        console.log('File size:', req.file.size, 'bytes');
        console.log('File mimetype:', req.file.mimetype);
        
        // Read Excel file
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            return res.status(400).json({ error: 'لا يوجد أوراق في ملف Excel' });
        }
        
        console.log('Available sheets:', workbook.SheetNames);
        
        // Try to find "Products" sheet first, otherwise use first sheet with data
        let sheetName = workbook.SheetNames.find(name => 
            name.toLowerCase() === 'products' || 
            name.toLowerCase() === 'منتجات' ||
            name.toLowerCase() === 'sheet1'
        );
        
        // If no specific sheet found, find first sheet with actual data
        if (!sheetName) {
            for (const name of workbook.SheetNames) {
                const testSheet = workbook.Sheets[name];
                const testRows = xlsx.utils.sheet_to_json(testSheet);
                if (testRows.length > 0) {
                    sheetName = name;
                    break;
                }
            }
        }
        
        // Fallback to first sheet
        if (!sheetName) {
            sheetName = workbook.SheetNames[0];
        }
        
        console.log('Using sheet:', sheetName);
        const worksheet = workbook.Sheets[sheetName];
        
        // Get the range to check if sheet has data
        const range = xlsx.utils.decode_range(worksheet['!ref'] || 'A1');
        const hasData = range.e.r > 0; // Check if there are rows beyond header
        
        console.log('Sheet range:', worksheet['!ref']);
        console.log('Has data beyond header:', hasData);
        
        // Convert to JSON - include header even if empty
        const rows = xlsx.utils.sheet_to_json(worksheet, { defval: null });
        
        console.log('Parsed rows:', rows.length);
        
        if (rows.length === 0) {
            // Check if headers exist
            const headers = xlsx.utils.sheet_to_json(worksheet, { header: 1 })[0];
            console.log('Headers found:', headers);
            
            // Check if there are other sheets with data
            const otherSheetsWithData = workbook.SheetNames.filter(name => {
                const sheet = workbook.Sheets[name];
                const testRows = xlsx.utils.sheet_to_json(sheet);
                return testRows.length > 0;
            });
            
            let suggestionMsg = '';
            if (otherSheetsWithData.length > 0) {
                suggestionMsg = ` - تم العثور على بيانات في: ${otherSheetsWithData.join(', ')}. تأكد من استخدام الورقة الصحيحة.`;
            }
            
            return res.status(400).json({ 
                error: `ملف Excel فارغ - الورقة "${sheetName}" لا تحتوي على بيانات${suggestionMsg}`,
                details: headers ? 'تم العثور على عناوين الأعمدة فقط، لكن لا توجد بيانات. تأكد من إضافة صفوف البيانات تحت الـ Headers.' : 'الملف فارغ تماماً',
                availableSheets: workbook.SheetNames,
                sheetsWithData: otherSheetsWithData
            });
        }
        
        console.log(`Found ${rows.length} rows in Excel`);
        
        // Generate batch ID for this import
        const batchId = uuidv4();
        const userId = req.user?.id || null;
        const categoryIndex = await buildCategoryIndex();
        
        // Parse and save ALL rows as drafts (flexible approach)
        const savedDrafts = [];
        const parseErrors = [];
        
        rows.forEach((row, index) => {
            const { product, errors, warnings, rowIndex } = mapRowToProduct(row, index + 2);
            const rawCategory = product.category || null;
            const rawSubcategory = product.subcategory || null;
            const mappedCategory = mapCategoryValues(rawCategory, rawSubcategory, categoryIndex);
            product.category = mappedCategory.category;
            product.subcategory = mappedCategory.subcategory;
            if (rawCategory && !mappedCategory.matchedCategory) {
                warnings.push(`التصنيف الأساسي غير مطابق: ${rawCategory}`);
            }
            if (rawSubcategory && !mappedCategory.matchedSubcategory) {
                warnings.push(`التصنيف الفرعي غير مطابق: ${rawSubcategory}`);
            }
            
            // Save even if there are warnings - we'll let user fix them later
            savedDrafts.push({
                product,
                warnings,
                errors,
                rowIndex
            });
        });
        
        console.log(`Parsed ${savedDrafts.length} products, preparing to save as drafts...`);
        
        // Save all as draft products
        const imported = [];
        const updated = [];
        const importErrors = [];
        const newCategories = [];
        
        await query('BEGIN');
        
        try {
            // First, create any new categories that don't exist
            const existingCategories = new Set();
            const categoriesResult = await query('SELECT name, name_ar FROM categories WHERE parent_id IS NULL');
            categoriesResult.rows.forEach(cat => {
                existingCategories.add(normalizeCategoryValue(cat.name));
                existingCategories.add(normalizeCategoryValue(cat.name_ar));
            });
            
            // Collect unique categories from products
            const categoriesToAdd = new Map();
            for (const { product } of savedDrafts) {
                if (product.category) {
                    const normalized = normalizeCategoryValue(product.category);
                    if (!existingCategories.has(normalized) && !categoriesToAdd.has(normalized)) {
                        categoriesToAdd.set(normalized, product.category);
                    }
                }
            }
            
            // Insert new categories
            for (const [normalized, originalName] of categoriesToAdd.entries()) {
                try {
                    console.log(`Creating new category: ${originalName}`);
                    const { rows: newCat } = await query(`
                        INSERT INTO categories (name, name_ar, icon, bg_color, display_order, is_active, parent_id)
                        VALUES ($1, $2, $3, $4, (SELECT COALESCE(MAX(display_order), 0) + 1 FROM categories WHERE parent_id IS NULL), true, NULL)
                        RETURNING id, name, name_ar
                    `, [
                        originalName,
                        originalName,
                        '📦',
                        'bg-gray-50'
                    ]);
                    
                    newCategories.push(newCat[0]);
                    existingCategories.add(normalized);
                    console.log(`✅ Created category: ${originalName} (ID: ${newCat[0].id})`);
                } catch (err) {
                    console.error(`Error creating category ${originalName}:`, err.message);
                }
            }
            
            for (const { product, warnings, errors } of savedDrafts) {
                try {
                    // Check if product exists (by barcode or name)
                    let existingProduct = null;
                    
                    if (product.barcode && product.barcode.trim() !== '') {
                        // Try to find by barcode first
                        const { rows } = await query(
                            'SELECT id FROM draft_products WHERE barcode = $1 AND status != $2 LIMIT 1',
                            [product.barcode.trim(), 'rejected']
                        );
                        if (rows.length > 0) {
                            existingProduct = rows[0];
                        }
                    }
                    
                    // If not found by barcode, try by name
                    if (!existingProduct && product.name && product.name.trim() !== '') {
                        const { rows } = await query(
                            'SELECT id FROM draft_products WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) AND status != $2 LIMIT 1',
                            [product.name.trim(), 'rejected']
                        );
                        if (rows.length > 0) {
                            existingProduct = rows[0];
                        }
                    }
                    
                    if (existingProduct) {
                        // UPDATE existing product
                        const { rows: updatedDraft } = await query(`
                            UPDATE draft_products SET
                                name = COALESCE($1, name),
                                category = COALESCE($2, category),
                                subcategory = COALESCE($3, subcategory),
                                image = COALESCE($4, image),
                                barcode = COALESCE($5, barcode),
                                old_price = COALESCE($6, old_price),
                                price = COALESCE($7, price),
                                discount_percentage = COALESCE($8, discount_percentage),
                                branch_id = COALESCE($9, branch_id),
                                stock_quantity = COALESCE($10, stock_quantity),
                                expiry_date = COALESCE($11, expiry_date),
                                status = $12,
                                import_batch_id = $13,
                                imported_by = $14,
                                validation_errors = $15,
                                updated_at = NOW()
                            WHERE id = $16
                            RETURNING id, name, category, status
                        `, [
                            product.name || null,
                            product.category || null,
                            product.subcategory || null,
                            product.image || null,
                            product.barcode || null,
                            product.old_price || null,
                            product.price || null,
                            product.discount_percentage || 0,
                            product.branch_id || null,
                            product.stock_quantity || null,
                            product.expiry_date || null,
                            errors.length > 0 ? 'draft' : 'validated',
                            batchId,
                            userId,
                            JSON.stringify({ errors, warnings }),
                            existingProduct.id
                        ]);
                        
                        updated.push({
                            id: updatedDraft[0].id,
                            name: updatedDraft[0].name,
                            category: updatedDraft[0].category,
                            status: updatedDraft[0].status
                        });
                        
                        console.log(`📝 Updated product: ${product.name} (ID: ${updatedDraft[0].id})`);
                    } else {
                        // INSERT new product
                        const { rows: insertedDraft } = await query(`
                            INSERT INTO draft_products (
                                name, category, subcategory, image, barcode,
                                old_price, price, discount_percentage,
                                branch_id, stock_quantity, expiry_date,
                                status, import_batch_id, imported_by,
                                validation_errors, created_at, updated_at
                            ) VALUES (
                                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
                                $12, $13, $14, $15, NOW(), NOW()
                            ) RETURNING id, name, category, status
                        `, [
                            product.name || 'منتج بدون اسم',
                            product.category || null,
                            product.subcategory || null,
                            product.image || null,
                            product.barcode || null,
                            product.old_price || null,
                            product.price || null,
                            product.discount_percentage || 0,
                            product.branch_id || 1,
                            product.stock_quantity || 0,
                            product.expiry_date || null,
                            errors.length > 0 ? 'draft' : 'validated',
                            batchId,
                            userId,
                            JSON.stringify({ errors, warnings })
                        ]);
                        
                        imported.push({
                            id: insertedDraft[0].id,
                            name: insertedDraft[0].name,
                            category: insertedDraft[0].category,
                            status: insertedDraft[0].status
                        });
                        
                        console.log(`➕ Added new product: ${product.name} (ID: ${insertedDraft[0].id})`);
                    }
                } catch (err) {
                    console.error('Error saving draft product:', product.name, err);
                    importErrors.push({
                        name: product.name || 'Unknown',
                        error: err.message
                    });
                }
            }
            
            await query('COMMIT');
            
            const totalProcessed = imported.length + updated.length;
            console.log(`Successfully processed ${totalProcessed} products (${imported.length} new, ${updated.length} updated, ${newCategories.length} categories created)`);
            
            let message = `تم معالجة ${totalProcessed} منتج بنجاح`;
            if (imported.length > 0) {
                message += ` (${imported.length} جديد`;
            }
            if (updated.length > 0) {
                message += imported.length > 0 ? `, ${updated.length} محدّث)` : ` (${updated.length} محدّث)`;
            } else if (imported.length > 0) {
                message += ')';
            }
            if (newCategories.length > 0) {
                message += `. تم إنشاء ${newCategories.length} تصنيف جديد`;
            }
            
            res.json({
                success: true,
                message: message,
                imported: imported.length,
                updated: updated.length,
                failed: importErrors.length,
                total: rows.length,
                newCategories: newCategories.length,
                batchId: batchId,
                redirectTo: `/admin/draft-products/${batchId}`,
                details: {
                    imported: imported,
                    updated: updated,
                    newCategories: newCategories.map(c => ({ name: c.name_ar || c.name, id: c.id })),
                    validationErrors: [],
                    importErrors: importErrors
                }
            });
            
        } catch (err) {
            await query('ROLLBACK');
            throw err;
        }
        
    } catch (err) {
        console.error('Bulk import error:', err);
        res.status(500).json({ 
            error: 'Failed to import products',
            message: err.message 
        });
    }
});

// GET /api/products/drafts - Get all draft products
router.get('/drafts', [verifyToken, isAdmin], async (req, res) => {
    try {
        const { batchId } = req.query;
        
        let queryText = `
            SELECT * FROM draft_products
            WHERE 1=1
        `;
        const params = [];
        
        if (batchId) {
            queryText += ` AND import_batch_id = $1`;
            params.push(batchId);
        }
        
        queryText += ` ORDER BY created_at DESC`;
        
        const { rows } = await query(queryText, params);
        
        res.json({
            success: true,
            drafts: rows
        });
    } catch (err) {
        console.error('Error fetching drafts:', err);
        res.status(500).json({ error: 'Failed to fetch draft products' });
    }
});

// GET /api/products/drafts/:id - Get single draft product
router.get('/drafts/:id', [verifyToken, isAdmin], async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await query('SELECT * FROM draft_products WHERE id = $1', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Draft product not found' });
        }
        
        res.json({
            success: true,
            draft: rows[0]
        });
    } catch (err) {
        console.error('Error fetching draft:', err);
        res.status(500).json({ error: 'Failed to fetch draft product' });
    }
});

// PUT /api/products/drafts/:id - Update draft product
router.put('/drafts/:id', [verifyToken, isAdmin], async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Build update query dynamically
        const allowedFields = [
            'name', 'category', 'subcategory', 'image', 'barcode',
            'old_price', 'price', 'discount_percentage',
            'branch_id', 'stock_quantity', 'expiry_date', 'status', 'notes'
        ];
        
        const setClause = [];
        const values = [];
        let paramCounter = 1;
        
        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                setClause.push(`${field} = $${paramCounter}`);
                values.push(updates[field]);
                paramCounter++;
            }
        }
        
        if (setClause.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        setClause.push(`updated_at = NOW()`);
        values.push(id);
        
        const queryText = `
            UPDATE draft_products
            SET ${setClause.join(', ')}
            WHERE id = $${paramCounter}
            RETURNING *
        `;
        
        const { rows } = await query(queryText, values);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Draft product not found' });
        }
        
        res.json({
            success: true,
            draft: rows[0]
        });
    } catch (err) {
        console.error('Error updating draft:', err);
        res.status(500).json({ error: 'Failed to update draft product' });
    }
});

// POST /api/products/drafts/:id/publish - Publish draft to products
router.post('/drafts/:id/publish', [verifyToken, isAdmin], async (req, res) => {
    try {
        const { id } = req.params;
        
        // Use the database function to publish
        const { rows } = await query('SELECT * FROM publish_draft_product($1)', [id]);
        
        if (!rows[0].success) {
            return res.status(400).json({ error: rows[0].message });
        }
        
        res.json({
            success: true,
            message: 'Product published successfully',
            productId: rows[0].product_id
        });
    } catch (err) {
        console.error('Error publishing draft:', err);
        res.status(500).json({ error: 'Failed to publish product' });
    }
});

// POST /api/products/drafts/batch/publish - Publish multiple drafts
router.post('/drafts/batch/publish', [verifyToken, isAdmin], async (req, res) => {
    try {
        const { draftIds } = req.body;
        
        if (!Array.isArray(draftIds) || draftIds.length === 0) {
            return res.status(400).json({ error: 'No draft IDs provided' });
        }
        
        const results = [];
        
        await query('BEGIN');
        
        for (const draftId of draftIds) {
            try {
                const { rows } = await query('SELECT * FROM publish_draft_product($1)', [draftId]);
                results.push({
                    draftId,
                    success: rows[0].success,
                    productId: rows[0].product_id,
                    message: rows[0].message
                });
            } catch (err) {
                results.push({
                    draftId,
                    success: false,
                    error: err.message
                });
            }
        }
        
        await query('COMMIT');
        
        const successCount = results.filter(r => r.success).length;
        
        res.json({
            success: true,
            message: `Published ${successCount} of ${draftIds.length} products`,
            results
        });
    } catch (err) {
        await query('ROLLBACK');
        console.error('Error batch publishing:', err);
        res.status(500).json({ error: 'Failed to publish products' });
    }
});

// DELETE /api/products/drafts/:id - Delete draft product
router.delete('/drafts/:id', [verifyToken, isAdmin], async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await query('DELETE FROM draft_products WHERE id = $1 RETURNING id', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Draft product not found' });
        }
        
        res.json({
            success: true,
            message: 'Draft product deleted'
        });
    } catch (err) {
        console.error('Error deleting draft:', err);
        res.status(500).json({ error: 'Failed to delete draft product' });
    }
});

// POST /api/products/setup-draft-table - Setup draft_products table (run migration)
router.post('/setup-draft-table', [verifyToken, isAdmin], async (req, res) => {
    try {
        console.log('Setting up draft_products table...');
        
        // Read migration file
        const migrationPath = path.join(__dirname, '..', 'migrations', 'add_draft_products_table.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        // Execute migration
        await query(migrationSQL);
        
        // Verify table exists
        const result = await query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'draft_products'
            );
        `);

        res.json({
            success: true,
            message: 'Draft products table setup completed',
            tableExists: result.rows[0].exists
        });
    } catch (err) {
        console.error('Error setting up draft table:', err);
        res.status(500).json({ 
            error: 'Failed to setup draft table',
            message: err.message 
        });
    }
});

// GET /api/products/bulk-import/template - Download Excel template
router.get('/bulk-import/template', (req, res) => {
    try {
        // Create template with example data
        const templateData = [
            {
                'name': 'شوكولاتة جالاكسي',
                'name_en': 'Galaxy Chocolate',
                'price': 25.50,
                'old_price': 30.00,
                'discount_percentage': 15,
                'category': 'حلويات',
                'weight': '100g',
                'اسم المنتج': 'شوكولاتة جالاكسي 100 جرام',
                'الباركود': '6221155123456',
                'السعر قبل': 30.00,
                'السعر بعد': 25.50,
                'التصنيف الاساسي': 'حلويات',
                'التصنيف الثانوي': 'شوكولاتة',
                'الفرع': 1,
                'الكميه': 150,
                'الصورة': 'https://i.imgur.com/abc123.jpg',
                'تاريخ الصلاحيه': '2026-12-31'
            },
            {
                'اسم المنتج': 'بيبسي 2 لتر',
                'الباركود': '6221155789012',
                'السعر قبل': 20.00,
                'السعر بعد': 18.00,
                'التصنيف الاساسي': 'مشروبات',
                'التصنيف الثانوي': 'مشروبات غازية',
                'الفرع': 1,
                'الكميه': 200,
                'الصورة': 'https://i.imgur.com/xyz789.jpg',
                'تاريخ الصلاحيه': '2026-06-30'
            }
        ];
        
        // Create worksheet
        const worksheet = xlsx.utils.json_to_sheet(templateData);
        
        // Create workbook
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Products');
        
        // Generate buffer
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        // Send file
        res.setHeader('Content-Disposition', 'attachment; filename=products_template.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
        
    } catch (err) {
        console.error('Template generation error:', err);
        res.status(500).json({ error: 'Failed to generate template' });
    }
});

export default router;
