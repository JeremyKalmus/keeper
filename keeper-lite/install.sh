#!/bin/bash
# Keeper Lite Installer
# Downloads and installs Keeper Lite for Claude Code
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/jeremykalmus/keeper/main/keeper-lite/install.sh | bash
#
#   Or with a specific target directory:
#   curl -fsSL https://raw.githubusercontent.com/jeremykalmus/keeper/main/keeper-lite/install.sh | bash -s -- /path/to/project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# GitHub raw URL base
GITHUB_RAW="https://raw.githubusercontent.com/jeremykalmus/keeper/main/keeper-lite"

# Target directory (default: current directory)
TARGET_DIR="${1:-.}"

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
echo "Next steps:"
echo "  1. Open Claude Code in $TARGET_DIR"
echo "  2. Run: /keeper-init"
echo "  3. Run: /keeper-plant"
echo "  4. Review .keeper/seeds/*.yaml"
echo ""
if [ "$CLAUDE_TARGET" = "$TARGET_DIR/CLAUDE.keeper-lite.md" ]; then
    echo -e "${YELLOW}Note: Merge CLAUDE.keeper-lite.md into your existing CLAUDE.md${NC}"
fi
