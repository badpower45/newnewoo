import { v2 as cloudinary } from 'cloudinary';
import XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// ============================================
// CONFIGURATION
// ============================================

// Cloudinary Configuration (معلومات جديدة)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dwnaacuih',
    api_key: process.env.CLOUDINARY_API_KEY || '618291128553242',
    api_secret: process.env.CLOUDINARY_API_SECRET || '6EAD1r93PVx9iV8KlL9E2vNH8h4'
});

// Supabase Configuration
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Upload image buffer to Cloudinary
 */
async function uploadImageBufferToCloudinary(imageBuffer, productId) {
    try {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'products',
                    public_id: productId,
                    transformation: [
                        { width: 800, height: 800, crop: 'limit' },
                        { quality: 'auto:good' },
                        { fetch_format: 'auto' }
                    ],
                    overwrite: true
                },
                (error, result) => {
                    if (error) {
                        console.error(`❌ Error uploading ${productId}:`, error.message);
                        reject(error);
                    } else {
                        resolve({
                            success: true,
                            url: result.secure_url,
                            public_id: result.public_id
                        });
                    }
                }
            );

            uploadStream.end(imageBuffer);
        });
    } catch (error) {
        console.error(`❌ Error uploading ${productId}:`, error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Extract embedded images from Excel file
 */
function extractEmbeddedImages(filePath) {
    try {
        const workbook = XLSX.readFile(filePath, { cellStyles: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Get the data
        const data = XLSX.utils.sheet_to_json(sheet);
        
        console.log(`📊 Found ${data.length} rows in Excel file`);
        
        // Check if workbook has media (images)
        const media = workbook.media || [];
        console.log(`🖼️  Found ${media.length} embedded images`);
        
        // Map images to products
        // Excel stores images with cell references
        const productsWithImages = data.map((row, index) => {
            // Try to find matching image for this row
            // Images are typically stored with references like "A1", "B2", etc.
            const rowNumber = index + 2; // +2 because row 1 is header, and Excel is 1-indexed
            
            // Look for image in common columns (B, C, D, etc.)
            let imageData = null;
            for (const img of media) {
                // Check if image is in this row range
                if (img.row === rowNumber || img.from?.row === rowNumber) {
                    imageData = img.data;
                    break;
                }
            }
            
            return {
                ...row,
                imageBuffer: imageData
            };
        });
        
        return productsWithImages;
    } catch (error) {
        console.error('❌ Error reading Excel file:', error.message);
        throw error;
    }
}

/**
 * Alternative: Extract images from Excel using exceljs library
 * This is more reliable for embedded images
 */
async function extractImagesWithExcelJS(filePath) {
    try {
        // Import exceljs dynamically
        const ExcelJS = await import('exceljs');
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        
        const worksheet = workbook.worksheets[0];
        const productsWithImages = [];
        
        // Get all images from worksheet
        const images = worksheet.getImages();
        console.log(`🖼️  Found ${images.length} embedded images`);
        
        // Read data rows
        const rows = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { // Skip header
                const rowData = {};
                row.eachCell((cell, colNumber) => {
                    const header = worksheet.getRow(1).getCell(colNumber).value;
                    rowData[header] = cell.value;
                });
                rows.push({ rowNumber, data: rowData });
            }
        });
        
        console.log(`📊 Found ${rows.length} data rows`);
        
        // Map images to rows based on position
        for (const row of rows) {
            let imageBuffer = null;
            
            // Find image that belongs to this row
            for (const img of images) {
                const imageRange = img.range;
                // Check if image overlaps with this row
                if (imageRange && 
                    imageRange.tl.nativeRow <= row.rowNumber && 
                    imageRange.br.nativeRow >= row.rowNumber) {
                    
                    // Get the image buffer
                    const imageId = img.imageId;
                    const image = workbook.model.media.find(m => m.index === imageId);
                    if (image) {
                        imageBuffer = image.buffer;
                        console.log(`✅ Found image for row ${row.rowNumber} (${row.data.product_id || row.data.id})`);
                    }
                    break;
                }
            }
            
            productsWithImages.push({
                ...row.data,
                imageBuffer
            });
        }
        
        return productsWithImages;
    } catch (error) {
        console.error('❌ Error extracting images with ExcelJS:', error.message);
        throw error;
    }
}

/**
 * Insert/Update product in database with branch price
 */
async function upsertProductWithBranch(product, branchId = 1) {
    try {
        // Insert/update product
        const { data: productData, error: productError } = await supabase
            .from('products')
            .upsert({
                id: product.product_id || product.id,
                name: product.product_name || product.name,
                category: product.category,
                image: product.cloudinary_url,
                description: product.description || '',
                weight: product.weight || '',
                is_organic: product.is_organic === true || product.is_organic === 'true',
                is_new: product.is_new === true || product.is_new === 'true',
                barcode: product.barcode || null,
                rating: product.rating || 0,
                reviews: product.reviews || 0,
                subcategory: product.subcategory || null,
                shelf_location: product.shelf_location || null
            }, {
                onConflict: 'id'
            });

        if (productError) throw productError;

        // Insert/update branch pricing
        if (product.price) {
            const { error: branchError } = await supabase
                .from('branch_products')
                .upsert({
                    branch_id: branchId,
                    product_id: product.product_id || product.id,
                    price: product.price,
                    discount_price: product.discount_price || null,
                    stock_quantity: product.stock_quantity || 100,
                    is_available: true
                }, {
                    onConflict: 'branch_id,product_id'
                });

            if (branchError) throw branchError;
        }

        return { success: true, data: productData };
    } catch (error) {
        console.error(`❌ Database error for ${product.product_id || product.id}:`, error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Delay function for rate limiting
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// MAIN UPLOAD FUNCTION
// ============================================

async function uploadEmbeddedImagesFromExcel(excelFilePath, options = {}) {
    const {
        batchSize = 10,
        delayBetweenBatches = 2000,
        skipDatabase = false,
        branchId = 1
    } = options;

    console.log('\n🚀 Starting Embedded Images Upload from Excel...\n');
    console.log('⚙️ Options:', {
        batchSize,
        delayBetweenBatches,
        skipDatabase,
        branchId
    });
    console.log('🔐 Cloudinary Config:', {
        cloud_name: cloudinary.config().cloud_name,
        api_key: cloudinary.config().api_key ? '✓ Set' : '✗ Missing'
    });
    console.log('─────────────────────────────────────\n');

    // Extract products with embedded images
    let products;
    try {
        console.log('📂 Reading Excel file with ExcelJS (supports embedded images)...');
        products = await extractImagesWithExcelJS(excelFilePath);
    } catch (error) {
        console.error('❌ ExcelJS failed, make sure to install: npm install exceljs');
        console.log('\n💡 Tip: Install exceljs for better image extraction:');
        console.log('   npm install exceljs\n');
        throw error;
    }

    if (products.length === 0) {
        console.log('❌ No products found in Excel file');
        return;
    }

    // Validate required columns
    const requiredColumns = ['product_id', 'product_name', 'category'];
    const firstRow = products[0];
    const missingColumns = requiredColumns.filter(col => {
        const hasColumn = col in firstRow || 
                         (col === 'product_id' && 'id' in firstRow) ||
                         (col === 'product_name' && 'name' in firstRow);
        return !hasColumn;
    });

    if (missingColumns.length > 0) {
        console.error('❌ Missing required columns:', missingColumns);
        console.log('\n📋 Required columns (any of):');
        console.log('   - product_id or id');
        console.log('   - product_name or name');
        console.log('   - category');
        console.log('   - price (optional, for branch_products)');
        return;
    }

    // Statistics
    const stats = {
        total: products.length,
        uploaded: 0,
        failed: 0,
        skipped: 0,
        dbSuccess: 0,
        dbFailed: 0
    };

    // Process in batches
    for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(products.length / batchSize);

        console.log(`\n📦 Processing Batch ${batchNumber}/${totalBatches} (${batch.length} products)...`);

        // Upload images in parallel within batch
        const uploadPromises = batch.map(async (product) => {
            const productId = product.product_id || product.id;
            const productName = product.product_name || product.name;
            const imageBuffer = product.imageBuffer;

            if (!imageBuffer) {
                console.log(`⏭️  Skipping ${productId}: No embedded image found`);
                stats.skipped++;
                return null;
            }

            console.log(`📤 Uploading: ${productId} - ${productName}`);

            // Upload to Cloudinary
            const uploadResult = await uploadImageBufferToCloudinary(imageBuffer, productId);

            if (uploadResult.success) {
                console.log(`✅ Uploaded: ${productId} → ${uploadResult.url}`);
                stats.uploaded++;

                // Save to database
                if (!skipDatabase) {
                    product.cloudinary_url = uploadResult.url;
                    const dbResult = await upsertProductWithBranch(product, branchId);

                    if (dbResult.success) {
                        console.log(`💾 Saved to DB: ${productId}`);
                        stats.dbSuccess++;
                    } else {
                        console.log(`⚠️  DB failed: ${productId}`);
                        stats.dbFailed++;
                    }
                }

                return { productId, url: uploadResult.url };
            } else {
                stats.failed++;
                return null;
            }
        });

        await Promise.all(uploadPromises);

        // Delay between batches to avoid rate limiting
        if (i + batchSize < products.length) {
            console.log(`⏳ Waiting ${delayBetweenBatches}ms before next batch...`);
            await delay(delayBetweenBatches);
        }
    }

    // Print summary
    console.log('\n\n═══════════════════════════════════════');
    console.log('📊 UPLOAD SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`Total products:      ${stats.total}`);
    console.log(`✅ Uploaded:         ${stats.uploaded}`);
    console.log(`❌ Failed:           ${stats.failed}`);
    console.log(`⏭️  Skipped:          ${stats.skipped}`);
    if (!skipDatabase) {
        console.log(`💾 DB Success:       ${stats.dbSuccess}`);
        console.log(`⚠️  DB Failed:        ${stats.dbFailed}`);
    }
    console.log('═══════════════════════════════════════\n');

    // Success rate
    if (stats.total - stats.skipped > 0) {
        const successRate = ((stats.uploaded / (stats.total - stats.skipped)) * 100).toFixed(2);
        console.log(`📈 Success Rate: ${successRate}%\n`);
    }
}

// ============================================
// CLI EXECUTION
// ============================================

// Get command line arguments
const args = process.argv.slice(2);
const excelFile = args[0];

if (!excelFile) {
    console.log('\n❌ Error: Excel file path required\n');
    console.log('Usage: node upload-embedded-images-from-excel.js <excel-file-path> [options]\n');
    console.log('Options:');
    console.log('  --batch-size=<number>     Number of images to upload in parallel (default: 10)');
    console.log('  --delay=<milliseconds>    Delay between batches (default: 2000)');
    console.log('  --branch-id=<number>      Branch ID for pricing (default: 1)');
    console.log('  --skip-db                 Skip database insertion\n');
    console.log('Example:');
    console.log('  node upload-embedded-images-from-excel.js products.xlsx --batch-size=20 --branch-id=1\n');
    console.log('📝 Note: Excel file should have embedded images in cells');
    console.log('   Required columns: product_id, product_name, category');
    console.log('   Optional: price, description, weight, barcode, etc.\n');
    process.exit(1);
}

// Parse options
const options = {
    batchSize: 10,
    delayBetweenBatches: 2000,
    skipDatabase: false,
    branchId: 1
};

args.slice(1).forEach(arg => {
    if (arg.startsWith('--batch-size=')) {
        options.batchSize = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--delay=')) {
        options.delayBetweenBatches = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--branch-id=')) {
        options.branchId = parseInt(arg.split('=')[1]);
    } else if (arg === '--skip-db') {
        options.skipDatabase = true;
    }
});

// Run upload
uploadEmbeddedImagesFromExcel(excelFile, options)
    .then(() => {
        console.log('✅ Process completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    });

export { uploadEmbeddedImagesFromExcel, uploadImageBufferToCloudinary };
