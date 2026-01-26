#!/bin/bash

# Export Supabase Data Script
# This script exports all data from your Supabase database

echo "🔄 Exporting Supabase Database..."

# Replace these with your OLD Supabase credentials
OLD_PROJECT_ID="jsrqjmovbuhuhbmxyqsh"
OLD_DB_PASSWORD="your_database_password"

# Export directory
EXPORT_DIR="./supabase_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$EXPORT_DIR"

echo "📦 Export directory: $EXPORT_DIR"

# Export database schema and data using pg_dump
# You need to get your database password from Supabase Dashboard → Settings → Database
# Connection string format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

echo "⚠️  You need to run pg_dump manually:"
echo ""
echo "pg_dump -h db.${OLD_PROJECT_ID}.supabase.co \\"
echo "  -U postgres \\"
echo "  -d postgres \\"
echo "  -F c \\"
echo "  -f ${EXPORT_DIR}/database_backup.dump"
echo ""
echo "Or export as SQL:"
echo ""
echo "pg_dump -h db.${OLD_PROJECT_ID}.supabase.co \\"
echo "  -U postgres \\"
echo "  -d postgres \\"
echo "  -f ${EXPORT_DIR}/database_backup.sql"
echo ""
echo "📌 Get database password from:"
echo "   https://supabase.com/dashboard/project/${OLD_PROJECT_ID}/settings/database"
