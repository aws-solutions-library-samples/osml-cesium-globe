#!/bin/sh
# Call into root directory of this pacakge so that we can
# run this script from anywhere.
LOCAL_DIR="$( dirname -- "$0"; )"
cd "${LOCAL_DIR}/.." || exit 1

git pull --rebase
rsync -av src "${1:-../AWSOversightMLMono/lib}"/cesium_globe/src
rsync -av electron "${1:-../AWSOversightMLMono/lib}"/cesium_globe/electron
rsync -av index.html "${1:-../AWSOversightMLMono/lib}"/cesium_globe/index.html
rsync -av package.json "${1:-../AWSOversightMLMono/lib}"/cesium_globe/package.json
rsync -av tsconfig.json "${1:-../AWSOversightMLMono/lib}"/cesium_globe/tsconfig.json
rsync -av tsconfig.node.json "${1:-../AWSOversightMLMono/lib}"/cesium_globe/tsconfig.node.json
rsync -av vite.config.ts "${1:-../AWSOversightMLMono/lib}"/cesium_globe/vite.config.ts