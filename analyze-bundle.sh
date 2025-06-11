#!/bin/bash

# Bundle Analysis Script for SkillSwap
echo "Starting bundle analysis..."

# Set environment variable for bundle analysis
export ANALYZE=true

# Run the build with bundle analysis
npm run build

echo "Bundle analysis complete!"
echo "Check the generated bundle-analysis.html file for detailed analysis."
