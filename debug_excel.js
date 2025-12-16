import * as xlsx from 'xlsx';
import fs from 'fs';

// Script to debug Excel file reading
// Usage: node debug_excel.js path/to/your/file.xlsx

const filePath = process.argv[2];

if (!filePath) {
    console.log('Usage: node debug_excel.js <path-to-excel-file>');
    process.exit(1);
}

if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
}

console.log('Reading file:', filePath);
console.log('File size:', fs.statSync(filePath).size, 'bytes');

try {
    const buffer = fs.readFileSync(filePath);
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    
    console.log('\n=== WORKBOOK INFO ===');
    console.log('Number of sheets:', workbook.SheetNames.length);
    console.log('Sheet names:', workbook.SheetNames);
    
    // Process ALL sheets
    workbook.SheetNames.forEach((sheetName, index) => {
        console.log('\n' + '='.repeat(50));
        console.log(`=== SHEET ${index + 1}: "${sheetName}" ===`);
        console.log('='.repeat(50));
        
        const worksheet = workbook.Sheets[sheetName];
        
        console.log('Sheet range:', worksheet['!ref']);
        
        // Get headers
        const allData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        const headers = allData[0];
        console.log('\nHeaders:');
        console.log(headers);
        
        // Get data rows
        const rows = xlsx.utils.sheet_to_json(worksheet, { defval: null });
        console.log('\nData rows count:', rows.length);
        
        if (rows.length > 0) {
            console.log('\n--- First 3 rows ---');
            rows.slice(0, 3).forEach((row, i) => {
                console.log(`\nRow ${i + 1}:`);
                console.log(JSON.stringify(row, null, 2));
            });
        } else {
            console.log('\n⚠️  NO DATA ROWS IN THIS SHEET!');
        }
    });
    
    // Find sheets with data
    console.log('\n' + '='.repeat(50));
    console.log('=== SUMMARY ===');
    console.log('='.repeat(50));
    
    const sheetsWithData = [];
    workbook.SheetNames.forEach(name => {
        const sheet = workbook.Sheets[name];
        const rows = xlsx.utils.sheet_to_json(sheet);
        if (rows.length > 0) {
            sheetsWithData.push({ name, rowCount: rows.length });
        }
    });
    
    console.log('\nSheets with data:');
    if (sheetsWithData.length > 0) {
        sheetsWithData.forEach(sheet => {
            console.log(`  ✓ ${sheet.name}: ${sheet.rowCount} rows`);
        });
    } else {
        console.log('  ✗ No sheets with data found!');
    }
    
} catch (error) {
    console.error('Error reading file:', error);
    process.exit(1);
}
