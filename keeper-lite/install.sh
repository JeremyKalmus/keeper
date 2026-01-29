#!/bin/bash
# Keeper Lite Installer
# Downloads and installs Keeper Lite for Claude Code
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/jeremykalmus/keeper/main/keeper-lite/install.sh | bash
#
#   With options:
#   curl -fsSL ... | bash -s -- --enforcement auto /path/to/project
#   curl -fsSL ... | bash -s -- --enforcement reminder ~/my-project
#   curl -fsSL ... | bash -s -- --enforcement off .
#
# Enforcement levels:
#   auto     - Claude automatically runs /keeper-review before new features (default)
#   reminder - Claude suggests running /keeper-review but doesn't block
#   off      - Only runs Keeper when explicitly called via /keeper-* commands

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# GitHub raw URL base
GITHUB_RAW="https://raw.githubusercontent.com/jeremykalmus/keeper/main/keeper-lite"

# Defaults
ENFORCEMENT="auto"
TARGET_DIR="."

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --enforcement)
            ENFORCEMENT="$2"
            shift 2
            ;;
        --enforcement=*)
            ENFORCEMENT="${1#*=}"
            shift
            ;;
        *)
            TARGET_DIR="$1"
            shift
            ;;
    esac
done

# Validate enforcement level
if [[ ! "$ENFORCEMENT" =~ ^(auto|reminder|off)$ ]]; then
    echo -e "${RED}Error: Invalid enforcement level '$ENFORCEMENT'${NC}"
    echo "Valid options: auto, reminder, off"
    exit 1
fi

echo -e "${GREEN}Keeper Lite Installer${NC}"
echo "Target: $TARGET_DIR"
echo ""

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Check if CLAUDE.md exists
if [ -f "$TARGET_DIR/CLAUDE.md" ]; then
    echo -e "${YELLOW}Warning: CLAUDE.md already exists.${NC}"
    echo "Saving Keeper Lite CLAUDE.md as CLAUDE.keeper-lite.md"
    echo "You may want to merge them manually."
    CLAUDE_TARGET="$TARGET_DIR/CLAUDE.keeper-lite.md"
else
    CLAUDE_TARGET="$TARGET_DIR/CLAUDE.md"
fi

# Download CLAUDE.md
echo "Downloading CLAUDE.md..."
curl -fsSL "$GITHUB_RAW/CLAUDE.md" -o "$CLAUDE_TARGET"

# Apply enforcement level
echo "Setting enforcement level: $ENFORCEMENT"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/<!-- KEEPER_ENFORCEMENT: auto -->/<!-- KEEPER_ENFORCEMENT: $ENFORCEMENT -->/" "$CLAUDE_TARGET"
else
    # Linux
    sed -i "s/<!-- KEEPER_ENFORCEMENT: auto -->/<!-- KEEPER_ENFORCEMENT: $ENFORCEMENT -->/" "$CLAUDE_TARGET"
fi

# Create .claude/commands directory
mkdir -p "$TARGET_DIR/.claude/commands"

# Download commands
echo "Downloading commands..."
for cmd in keeper-init keeper-plant keeper-review keeper-tend; do
    curl -fsSL "$GITHUB_RAW/.claude/commands/$cmd.md" -o "$TARGET_DIR/.claude/commands/$cmd.md"
    echo "  - $cmd.md"
done

# Create templates directory (optional, for reference)
mkdir -p "$TARGET_DIR/.keeper-lite-templates/seeds"

echo "Downloading seed templates..."
for seed in frontend backend data auth; do
    curl -fsSL "$GITHUB_RAW/templates/seeds/$seed.yaml" -o "$TARGET_DIR/.keeper-lite-templates/seeds/$seed.yaml"
    echo "  - $seed.yaml"
done

curl -fsSL "$GITHUB_RAW/templates/config.json" -o "$TARGET_DIR/.keeper-lite-templates/config.json"

echo ""
echo -e "${GREEN}Installation complete!${NC}"
echo ""
echo "Installed:"
echo "  $CLAUDE_TARGET"
echo "  $TARGET_DIR/.claude/commands/keeper-*.md"
echo "  $TARGET_DIR/.keeper-lite-templates/ (reference templates)"
echo ""
echo -e "Enforcement: ${BLUE}$ENFORCEMENT${NC}"
case $ENFORCEMENT in
    auto)
        echo "  Claude will automatically run /keeper-review before implementing new features."
        ;;
    reminder)
        echo "  Claude will suggest /keeper-review but won't block implementation."
        ;;
    off)
        echo "  Keeper only runs when you explicitly call /keeper-* commands."
        ;;
esac
echo ""
echo "Next steps:"
echo "  1. Open Claude Code in $TARGET_DIR"
echo "  2. Run: /keeper-init"
echo "  3. Run: /keeper-plant"
echo "  4. Review .keeper/seeds/*.yaml"
echo ""
echo "To change enforcement later, edit CLAUDE.md and find:"
echo "  <!-- KEEPER_ENFORCEMENT: $ENFORCEMENT -->"
echo ""
if [ "$CLAUDE_TARGET" = "$TARGET_DIR/CLAUDE.keeper-lite.md" ]; then
    echo -e "${YELLOW}Note: Merge CLAUDE.keeper-lite.md into your existing CLAUDE.md${NC}"
fi
