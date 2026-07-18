#!/usr/bin/env bash
# patch-ipa.sh — Extract IPA, inject BazzarSerts.dylib via optool, repackage
# Usage: ./patch-ipa.sh <input.ipa> <BazzarSerts.dylib> [output_dir]
#
# Outputs: <AppName>_byBazzarSerts.ipa in output_dir (or current dir).

set -euo pipefail

IPA_PATH="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
DYLIB_PATH="$(cd "$(dirname "$2")" && pwd)/$(basename "$2")"
OUT_DIR="${3:-.}"
mkdir -p "$OUT_DIR"
OUT_DIR="$(cd "$OUT_DIR" && pwd)"

IPA_NAME=$(basename "$IPA_PATH" .ipa)
WORK_DIR=$(mktemp -d)

echo "=== Patching: $IPA_NAME ==="
echo "    Work dir: $WORK_DIR"

# 1. Extract
echo "[1/5] Extracting IPA..."
unzip -q "$IPA_PATH" -d "$WORK_DIR"

# 2. Find .app bundle
APP_DIR=$(find "$WORK_DIR/Payload" -maxdepth 1 -name "*.app" -type d | head -1)
if [ -z "$APP_DIR" ]; then
    echo "ERROR: No .app found in Payload/"
    exit 1
fi
APP_NAME=$(basename "$APP_DIR" .app)
echo "    App bundle: $APP_NAME.app"

# 3. Find main executable
EXEC_NAME=$(/usr/libexec/PlistBuddy -c "Print :CFBundleExecutable" "$APP_DIR/Info.plist" 2>/dev/null || echo "$APP_NAME")
EXEC_PATH="$APP_DIR/$EXEC_NAME"

if [ ! -f "$EXEC_PATH" ]; then
    echo "ERROR: Executable not found: $EXEC_PATH"
    exit 1
fi
echo "    Executable: $EXEC_NAME"

# 4. Copy dylib into app bundle
echo "[2/5] Copying BazzarSerts.dylib..."
cp "$DYLIB_PATH" "$APP_DIR/BazzarSerts.dylib"

# 5. Inject load command via optool
echo "[3/5] Injecting load command via optool..."
optool install -c load -p "@executable_path/BazzarSerts.dylib" -t "$EXEC_PATH"

# 6. Remove code signatures (will be re-signed by user's cert)
echo "[4/5] Stripping code signatures..."
rm -rf "$APP_DIR/_CodeSignature"
find "$APP_DIR/Frameworks" -name "_CodeSignature" -type d -exec rm -rf {} + 2>/dev/null || true

# 7. Repackage
OUT_IPA="$OUT_DIR/${IPA_NAME}_byBazzarSerts.ipa"
echo "[5/5] Repackaging -> $(basename "$OUT_IPA")"
cd "$WORK_DIR"
zip -q -r "$OUT_IPA" Payload/
cd -

# Cleanup
rm -rf "$WORK_DIR"

echo "=== Done: $OUT_IPA ==="
echo ""
