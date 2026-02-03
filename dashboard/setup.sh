#!/bin/bash
#
# Keeper Dashboard Setup Script
#
# This script sets up the Keeper Dashboard in a project that has already
# been initialized with /keeper-plant (has keeper/seeds/*.yaml structure).
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/JeremyKalmus/keeper/main/dashboard/setup.sh | bash
#   # OR
#   ./setup.sh [target-directory]
#

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "  🌱 Keeper Dashboard Setup"
echo "  ========================="
echo -e "${NC}"

# Determine target directory
TARGET_DIR="${1:-.}"
cd "$TARGET_DIR"

# Check for keeper structure
if [ ! -d "keeper/seeds" ]; then
    echo -e "${RED}Error: keeper/seeds directory not found.${NC}"
    echo ""
    echo "This script requires a project that has been initialized with /keeper-plant."
    echo "Expected structure:"
    echo "  your-project/"
    echo "  └── keeper/"
    echo "      ├── keeper.yaml"
    echo "      ├── seeds/"
    echo "      │   ├── frontend.yaml"
    echo "      │   ├── backend.yaml"
    echo "      │   └── ..."
    echo "      └── decisions/"
    echo ""
    echo "Run /keeper-plant first, then run this script again."
    exit 1
fi

echo -e "${GREEN}✓${NC} Found keeper/seeds directory"

# Check if dashboard already exists
if [ -d "dashboard" ]; then
    echo -e "${YELLOW}Warning: dashboard/ directory already exists.${NC}"
    read -p "Overwrite? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
    rm -rf dashboard
fi

# Clone just the dashboard directory from the repo
echo "Downloading dashboard..."
TEMP_DIR=$(mktemp -d)
git clone --depth 1 --filter=blob:none --sparse \
    https://github.com/JeremyKalmus/keeper.git "$TEMP_DIR" 2>/dev/null

cd "$TEMP_DIR"
git sparse-checkout set dashboard 2>/dev/null
cd -

# Copy dashboard to target
cp -r "$TEMP_DIR/dashboard" ./dashboard
rm -rf "$TEMP_DIR"

echo -e "${GREEN}✓${NC} Dashboard downloaded"

# Update server paths to work with standard keeper structure
# The server expects keeper/ to be a sibling of dashboard/
KEEPER_PATH="../keeper"

# Check if keeper is in a different location
if [ -d "keeper" ]; then
    KEEPER_PATH="../keeper"
elif [ -d "../keeper" ]; then
    KEEPER_PATH="../../keeper"
fi

# Update the server/index.ts with the correct path
sed -i.bak "s|join(import.meta.dir, '../../keeper')|join(import.meta.dir, '${KEEPER_PATH}')|g" dashboard/server/index.ts
rm -f dashboard/server/index.ts.bak

echo -e "${GREEN}✓${NC} Configured paths"

# Install dependencies
echo "Installing dependencies..."
cd dashboard

if command -v bun &> /dev/null; then
    bun install
    echo -e "${GREEN}✓${NC} Dependencies installed (bun)"
elif command -v npm &> /dev/null; then
    npm install
    echo -e "${GREEN}✓${NC} Dependencies installed (npm)"
else
    echo -e "${YELLOW}Warning: Neither bun nor npm found. Install dependencies manually.${NC}"
fi

cd ..

# Create/update .gitignore
if [ -f ".gitignore" ]; then
    if ! grep -q "dashboard/node_modules" .gitignore; then
        echo "" >> .gitignore
        echo "# Keeper Dashboard" >> .gitignore
        echo "dashboard/node_modules" >> .gitignore
        echo "dashboard/dist" >> .gitignore
        echo -e "${GREEN}✓${NC} Updated .gitignore"
    fi
fi

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "To start the dashboard:"
echo "  cd dashboard"
echo "  bun run dev    # or: npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
echo "The dashboard will:"
echo "  • Display all seeds from keeper/seeds/*.yaml"
echo "  • Show decisions from keeper/decisions/*.yaml"
echo "  • Auto-refresh when YAML files change"
echo ""
echo -e "${YELLOW}Optional: Add component previews${NC}"
echo "Edit dashboard/src/components/ComponentPreview.tsx to add"
echo "live previews of your project's UI components."
