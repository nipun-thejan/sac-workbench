#!/bin/bash

set -e -o pipefail

echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Building backend..."
pip install -r backend/requirements.txt