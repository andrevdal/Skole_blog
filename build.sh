#!/usr/bin/env sh

# Build everything

SCRIPT_PATH=$(cd "$(dirname "$0")" && pwd)
cd "$SCRIPT_PATH/" || exit 1

# Purge everything and pretend it's a new start
rm -r "dist" 2>/dev/null
mkdir "dist" "dist/views" "dist/public" "temp"
cp -r "src/views" "src/public" "dist/"

tsc
find "./dist/" -name '*.ts' -type f -delete
sass --update "dist/public/cdn/stylesheets/"

# Avoid weird errors with tsc
exit 0