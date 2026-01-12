#!/bin/bash
# Keeper Installation Script
# Sets up the bd wrapper to invoke keeper PostBeadCreate hooks
#
# Usage: ./install/setup.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KEEPER_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🌱 Keeper of the Seeds - Installation"
echo ""

# Find a suitable PATH location that comes before /opt/homebrew/bin
INSTALL_DIR=""
HOMEBREW_POS=999

# Find position of /opt/homebrew/bin in PATH
i=0
IFS=':' read -ra PATH_DIRS <<< "$PATH"
for dir in "${PATH_DIRS[@]}"; do
    if [[ "$dir" == "/opt/homebrew/bin" ]]; then
        HOMEBREW_POS=$i
        break
    fi
    ((i++))
done

# Find first candidate directory that comes before homebrew
i=0
for dir in "${PATH_DIRS[@]}"; do
    if [[ $i -ge $HOMEBREW_POS ]]; then
        break
    fi
    # Check if this is a candidate directory we want to use
    case "$dir" in
        "$HOME/.local/bin"|"$HOME/bin"|"$HOME/.amp/bin")
            INSTALL_DIR="$dir"
            break
            ;;
    esac
    ((i++))
done

if [[ -z "$INSTALL_DIR" ]]; then
    # Fallback - use ~/.local/bin
    INSTALL_DIR="$HOME/.local/bin"
    echo "⚠️  Warning: $INSTALL_DIR may not be in your PATH before /opt/homebrew/bin"
    echo "   Add this to your shell profile:"
    echo "   export PATH=\"$INSTALL_DIR:\$PATH\""
    echo ""
fi

# Ensure install directory exists
mkdir -p "$INSTALL_DIR"

# Install the bd wrapper
echo "📦 Installing bd wrapper to $INSTALL_DIR..."
# Remove any existing bd (might be symlink or old version)
rm -f "$INSTALL_DIR/bd"
cp "$SCRIPT_DIR/bd-wrapper" "$INSTALL_DIR/bd"
chmod +x "$INSTALL_DIR/bd"

# Verify installation
if which bd | grep -q "$INSTALL_DIR"; then
    echo "✓ bd wrapper installed successfully"
    echo "  Location: $INSTALL_DIR/bd"
else
    echo "⚠️  bd wrapper installed but may not be first in PATH"
    echo "  Installed to: $INSTALL_DIR/bd"
    echo "  Current bd: $(which bd)"
fi

echo ""
echo "🌱 Keeper installation complete!"
echo ""
echo "Next steps:"
echo "  1. Copy keeper.yaml to your rig root"
echo "  2. Copy seeds/*.yaml templates to your rig"
echo "  3. Run 'bd create' - keeper will now generate decisions"
