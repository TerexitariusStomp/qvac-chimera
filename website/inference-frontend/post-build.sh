#!/bin/bash
set -e

DIST_DIR="./dist"
SITE_SRC="../../website-new"

# Create inference subdirectory with the React app
mkdir -p "$DIST_DIR/inference"
cp "$DIST_DIR/index.html" "$DIST_DIR/inference/index.html"

# Copy assets to inference subdirectory (relative paths need them there)
cp -r "$DIST_DIR/assets" "$DIST_DIR/inference/assets" 2>/dev/null || true
for asset in "$DIST_DIR"/*.png "$DIST_DIR"/*.svg "$DIST_DIR"/*.jpg "$DIST_DIR"/*.jpeg "$DIST_DIR"/*.wasm; do
  if [ -f "$asset" ]; then
    cp "$asset" "$DIST_DIR/inference/"
  fi
done

# Copy deploy-escrow.html into inference subdirectory
if [ -f "$DIST_DIR/deploy-escrow.html" ]; then
  cp "$DIST_DIR/deploy-escrow.html" "$DIST_DIR/inference/"
fi

# Copy all static site files from website-new/ to dist root
for file in "$SITE_SRC"/*.html "$SITE_SRC"/*.png "$SITE_SRC"/*.xml "$SITE_SRC"/*.txt; do
  if [ -f "$file" ]; then
    cp "$file" "$DIST_DIR/"
  fi
done

# Ensure _redirects is present
cat > "$DIST_DIR/_redirects" <<'EOF'
/api/rpc/*  /api/rpc/[[path]]  200
/inference/*  /inference/index.html   200
/inference    /inference/index.html   200
/*    /index.html   200
EOF

echo "Post-build: landing page at /, inference app at /inference/"
