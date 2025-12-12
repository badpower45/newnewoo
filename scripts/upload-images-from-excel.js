import { v2 as cloudinary } from 'cloudinary';
import XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// ============================================
// CONFIGURATION
// ============================================

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
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
 * Upload single image to Cloudinary
 */
async function uploadImageToCloudinary(imageUrl, productId) {
    try {
        const result = await cloudinary.uploader.upload(imageUrl, {
            folder: 'products',
            public_id: productId,
            transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
            ],
            overwrite: true
        });

        return {
            success: true,
            url: result.secure_url,
            public_id: result.public_id
        };
    } catch (error) {
        console.error(`❌ Error uploading ${productId}:`, error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Read Excel file and parse data
 */
function readExcelFile(filePath) {
    try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        console.log(`📊 Found ${data.length} rows in Excel file`);
        return data;
    } catch (error) {
        console.error('❌ Error reading Excel file:', error.message);
        throw error;
    }
}

/**
 * Insert/Update product in database
 */
async function upsertProduct(product) {
    try {
        const { data, error } = await supabase
            .from('products')
            .upsert({
                id: product.product_id,
                name: product.product_name,
                category: product.category,
                image: product.cloudinary_url,
                price: product.price,
                description: product.description || '',
                weight: product.weight || '',
                is_organic: product.is_organic === true || product.is_organic === 'true',
                is_new: product.is_new === true || product.is_new === 'true',
                barcode: product.barcode || null,
                rating: product.rating || 0,
                reviews: product.reviews || 0
            }, {
                onConflict: 'id'
            });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error(`❌ Database error for ${product.product_id}:`, error.message);
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

async function uploadProductsFromExcel(excelFilePath, options = {}) {
    const {
        batchSize = 10,
        delayBetweenBatches = 2000,
        skipDatabase = false
    } = options;

    console.log('\n🚀 Starting Excel Image Upload Process...\n');
    console.log('⚙️ Options:', {
        batchSize,
        delayBetweenBatches,
        skipDatabase
    });
    console.log('─────────────────────────────────────\n');

    // Read Excel file
    const products = readExcelFile(excelFilePath);

    if (products.length === 0) {
        console.log('❌ No products found in Excel file');
        return;
    }

    // Validate required columns
    const requiredColumns = ['product_id', 'product_name', 'category', 'image_url'];
    const firstRow = products[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));

    if (missingColumns.length > 0) {
        console.error('❌ Missing required columns:', missingColumns);
        console.log('\n📋 Required columns:');
        requiredColumns.forEach(col => console.log(`   - ${col}`));
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
            const productId = product.product_id;
            const imageUrl = product.image_url;

            if (!imageUrl) {
                console.log(`⏭️  Skipping ${productId}: No image URL`);
                stats.skipped++;
                return null;
            }

            console.log(`📤 Uploading: ${productId} - ${product.product_name}`);

            // Upload to Cloudinary
            const uploadResult = await uploadImageToCloudinary(imageUrl, productId);

            if (uploadResult.success) {
                console.log(`✅ Uploaded: ${productId} → ${uploadResult.url}`);
                stats.uploaded++;

                // Save to database
                if (!skipDatabase) {
                    product.cloudinary_url = uploadResult.url;
                    const dbResult = await upsertProduct(product);

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
    const successRate = ((stats.uploaded / (stats.total - stats.skipped)) * 100).toFixed(2);
    console.log(`📈 Success Rate: ${successRate}%\n`);
}

// ============================================
// CLI EXECUTION
// ============================================

// Get command line arguments
const args = process.argv.slice(2);
const excelFile = args[0];

if (!excelFile) {
    console.log('\n❌ Error: Excel file path required\n');
    console.log('Usage: node upload-images-from-excel.js <excel-file-path> [options]\n');
    console.log('Options:');
    console.log('  --batch-size=<number>     Number of images to upload in parallel (default: 10)');
    console.log('  --delay=<milliseconds>    Delay between batches (default: 2000)');
    console.log('  --skip-db                 Skip database insertion\n');
    console.log('Example:');
    console.log('  node upload-images-from-excel.js products.xlsx --batch-size=20 --delay=3000\n');
    process.exit(1);
}

// Parse options
const options = {
    batchSize: 10,
    delayBetweenBatches: 2000,
    skipDatabase: false
};

args.slice(1).forEach(arg => {
    if (arg.startsWith('--batch-size=')) {
        options.batchSize = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--delay=')) {
        options.delayBetweenBatches = parseInt(arg.split('=')[1]);
    } else if (arg === '--skip-db') {
        options.skipDatabase = true;
    }
});

// Run upload
uploadProductsFromExcel(excelFile, options)
    .then(() => {
        console.log('✅ Process completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    });

export { uploadProductsFromExcel, uploadImageToCloudinary };
