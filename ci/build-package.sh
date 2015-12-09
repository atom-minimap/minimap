#!/bin/sh

echo "Downloading node v4.2.3..."
curl -s -O http://nodejs.org/dist/v4.2.3/node-v4.2.3-darwin-x64.tar.gz
tar -zxf node-v4.2.3-darwin-x64.tar.gz
export PATH=$PATH:$PWD/node-v4.2.3-darwin-x64/bin

echo "Downloading latest Atom release..."
curl -s -L "https://atom.io/download/mac" \
  -H 'Accept: application/octet-stream' \
  -o atom.zip

mkdir atom
unzip -q atom.zip -d atom

echo "Downloading latest Minimap release..."
atom/Atom.app/Contents/Resources/app/apm/node_modules/.bin/apm install minimap

echo "Downloading package dependencies..."
atom/Atom.app/Contents/Resources/app/apm/node_modules/.bin/apm install

echo "Running specs..."
ATOM_PATH=./atom atom/Atom.app/Contents/Resources/app/apm/node_modules/.bin/apm test --path atom/Atom.app/Contents/Resources/app/atom.sh

exit
