#!/usr/bin/env bash
# Complete Backend Migration Script
# Converts backend-js to backend (final switchover)

echo "🔄 Starting backend migration..."
echo ""

# Step 1: Verify backend-js exists
if [ ! -d "backend-js" ]; then
    echo "❌ Error: backend-js folder not found!"
    exit 1
fi

echo "✅ backend-js folder verified"

# Step 2: Backup old backend (optional but safe)
if [ -d "backend" ]; then
    echo "📦 Backing up old backend to backend-ts-backup..."
    mv backend backend-ts-backup
    echo "✅ Backup created"
else
    echo "ℹ️  No existing backend folder to backup"
fi

# Step 3: Rename backend-js to backend
echo "🔄 Migrating backend-js → backend..."
mv backend-js backend

if [ -d "backend" ]; then
    echo "✅ Backend folder ready!"
else
    echo "❌ Migration failed!"
    exit 1
fi

echo ""
echo "================================"
echo "✅ MIGRATION COMPLETE!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. cd backend"
echo "2. npm install (if needed)"
echo "3. npm start (to test)"
echo ""
echo "For production deployment to Render:"
echo "1. Push to GitHub: git push origin main"
echo "2. Render will auto-deploy using Procfile"
echo ""
