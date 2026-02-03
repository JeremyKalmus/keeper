#!/bin/bash
#
# Keeper Dashboard Update Script
#
# Updates the dashboard to the latest version while preserving
# local customizations (ComponentPreview.tsx, tailwind.config.js colors, etc.)
#
# Usage:
#   cd your-project/dashboard
#   ./update.sh
#   # OR
#   curl -fsSL https://raw.githubusercontent.com/JeremyKalmus/keeper/main/dashboard/update.sh | bash
#

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}"
echo "  🌱 Keeper Dashboard Update"
echo "  =========================="
echo -e "${NC}"

# Check we're in the dashboard directory
if [ ! -f "package.json" ] || ! grep -q "keeper-dashboard" package.json 2>/dev/null; then
    if [ -d "dashboard" ]; then
        cd dashboard
    else
        echo -e "${RED}Error: Not in a dashboard directory.${NC}"
        echo "Run this script from your project root or the dashboard/ directory."
        exit 1
    fi
fi

echo "Updating dashboard in: $(pwd)"
echo ""

# Backup files that might have local customizations
BACKUP_DIR=".update-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

PRESERVE_FILES=(
    "src/components/ComponentPreview.tsx"
    "tailwind.config.js"
    "server/index.ts"
)

echo "Backing up customizable files..."
for file in "${PRESERVE_FILES[@]}"; do
    if [ -f "$file" ]; then
        mkdir -p "$BACKUP_DIR/$(dirname $file)"
        cp "$file" "$BACKUP_DIR/$file"
        echo -e "  ${GREEN}✓${NC} $file"
    fi
done

# Download latest version
echo ""
echo "Downloading latest dashboard..."
TEMP_DIR=$(mktemp -d)
git clone --depth 1 --filter=blob:none --sparse \
    https://github.com/JeremyKalmus/keeper.git "$TEMP_DIR" 2>/dev/null

cd "$TEMP_DIR"
git sparse-checkout set dashboard 2>/dev/null
cd - > /dev/null

# Files to always update (core functionality)
UPDATE_FILES=(
    "src/App.tsx"
    "src/main.tsx"
    "src/index.css"
    "src/components/Sidebar.tsx"
    "src/components/SeedDetail.tsx"
    "src/components/DecisionLog.tsx"
    "src/hooks/useRealtimeUpdates.ts"
    "src/lib/api.ts"
    "index.html"
    "vite.config.ts"
    "tsconfig.json"
    "postcss.config.js"
    "setup.sh"
    "update.sh"
)

echo ""
echo "Updating core files..."
for file in "${UPDATE_FILES[@]}"; do
    if [ -f "$TEMP_DIR/dashboard/$file" ]; then
        mkdir -p "$(dirname $file)"
        cp "$TEMP_DIR/dashboard/$file" "$file"
        echo -e "  ${GREEN}✓${NC} $file"
    fi
done

# Update package.json dependencies (merge, don't overwrite)
if [ -f "$TEMP_DIR/dashboard/package.json" ]; then
    echo ""
    echo -e "${YELLOW}Review package.json for new dependencies:${NC}"
    echo "  New version: $TEMP_DIR/dashboard/package.json"
    echo "  Run: bun install (or npm install) after reviewing"
fi

rm -rf "$TEMP_DIR"

# Restore backups with merge prompts
echo ""
echo -e "${YELLOW}Preserved files (in $BACKUP_DIR/):${NC}"
for file in "${PRESERVE_FILES[@]}"; do
    if [ -f "$BACKUP_DIR/$file" ]; then
        echo "  • $file"
    fi
done

echo ""
echo -e "${GREEN}Update complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review $BACKUP_DIR/ for your customizations"
echo "  2. Merge any custom ComponentPreview.tsx components"
echo "  3. Run: bun install (or npm install)"
echo "  4. Run: bun run dev"
echo ""
echo "To restore a backup file:"
echo "  cp $BACKUP_DIR/src/components/ComponentPreview.tsx src/components/"
