#!/bin/bash

# SkillSwap Performance Check Script
# Analyzes current performance optimizations and provides recommendations

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}=====================================${NC}"
    echo -e "${BLUE}  SkillSwap Performance Analysis${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo ""
}

check_dependencies() {
    echo -e "${YELLOW}🔍 Checking Performance Dependencies...${NC}"

    # Check if bundle analyzer is installed
    if npm list webpack-bundle-analyzer &>/dev/null; then
        echo -e "${GREEN}✅ webpack-bundle-analyzer: Installed${NC}"
    else
        echo -e "${RED}❌ webpack-bundle-analyzer: Missing${NC}"
    fi

    if npm list @next/bundle-analyzer &>/dev/null; then
        echo -e "${GREEN}✅ @next/bundle-analyzer: Installed${NC}"
    else
        echo -e "${RED}❌ @next/bundle-analyzer: Missing${NC}"
    fi

    echo ""
}

check_config() {
    echo -e "${YELLOW}⚙️  Checking Configuration Files...${NC}"

    if [ -f "next.config.js" ]; then
        echo -e "${GREEN}✅ next.config.js: Found${NC}"

        # Check for performance optimizations in config
        if grep -q "withBundleAnalyzer" next.config.js; then
            echo -e "${GREEN}  ✅ Bundle analyzer configured${NC}"
        fi

        if grep -q "splitChunks" next.config.js; then
            echo -e "${GREEN}  ✅ Chunk splitting configured${NC}"
        fi

        if grep -q "experimental" next.config.js; then
            echo -e "${GREEN}  ✅ Experimental optimizations enabled${NC}"
        fi
    else
        echo -e "${RED}❌ next.config.js: Missing${NC}"
    fi
    echo ""
}

check_performance_components() {
    echo -e "${YELLOW}🚀 Checking Performance Components...${NC}"

    components=(
        "src/components/intelligent-prefetch.tsx"
        "src/components/advanced-image.tsx"
        "src/components/resource-hints.tsx"
        "src/hooks/use-cached-fetch.ts"
    )

    for component in "${components[@]}"; do
        if [ -f "$component" ]; then
            echo -e "${GREEN}✅ $(basename "$component"): Available${NC}"
        else
            echo -e "${RED}❌ $(basename "$component"): Missing${NC}"
        fi
    done
    echo ""
}

show_performance_tips() {
    echo -e "${YELLOW}💡 Performance Optimization Tips:${NC}"
    echo ""
    echo -e "${BLUE}1. Image Optimization:${NC}"
    echo "   • Use WebP/AVIF formats when possible"
    echo "   • Implement lazy loading for images below the fold"
    echo "   • Set appropriate image dimensions"
    echo ""
    echo -e "${BLUE}2. Code Splitting:${NC}"
    echo "   • Use dynamic imports for non-critical components"
    echo "   • Split vendor bundles from application code"
    echo "   • Implement route-based code splitting"
    echo ""
    echo -e "${BLUE}3. Caching Strategy:${NC}"
    echo "   • Use SWR for data fetching with background updates"
    echo "   • Implement proper HTTP caching headers"
    echo "   • Cache static assets with long TTL"
    echo ""
    echo -e "${BLUE}4. Resource Loading:${NC}"
    echo "   • Preconnect to external domains"
    echo "   • Prefetch likely navigation targets"
    echo "   • Use resource hints for critical resources"
    echo ""
}

run_bundle_analysis() {
    echo -e "${YELLOW}📊 Running Bundle Analysis...${NC}"
    echo ""

    if [ -f "next.config.js" ] && npm list @next/bundle-analyzer &>/dev/null; then
        echo "Starting bundle analysis..."
        ANALYZE=true npm run build
    else
        echo -e "${RED}❌ Bundle analyzer not properly configured${NC}"
        echo "Run: npm install --save-dev @next/bundle-analyzer webpack-bundle-analyzer"
    fi
}

show_current_status() {
    print_header
    check_dependencies
    check_config
    check_performance_components

    echo -e "${YELLOW}📈 Performance Scripts Available:${NC}"
    echo "  • npm run analyze - Full bundle analysis"
    echo "  • npm run perf:check - This status check"
    echo "  • npm run perf:tips - Performance tips"
    echo "  • npm run perf:test - Performance testing"
    echo ""
}

# Main script logic
case "$1" in
    "status")
        show_current_status
        ;;
    "tips")
        print_header
        show_performance_tips
        ;;
    "analyze")
        print_header
        run_bundle_analysis
        ;;
    "test")
        print_header
        echo -e "${YELLOW}🧪 Running Performance Tests...${NC}"
        echo "Performance testing would measure:"
        echo "  • Core Web Vitals (LCP, FID, CLS)"
        echo "  • Bundle sizes"
        echo "  • Load times"
        echo "  • Memory usage"
        echo ""
        echo "Consider using tools like Lighthouse or Web Vitals library"
        ;;
    *)
        echo "Usage: $0 {status|tips|analyze|test}"
        echo ""
        echo "Available commands:"
        echo "  status  - Show current optimization status"
        echo "  tips    - Display performance optimization tips"
        echo "  analyze - Run bundle analysis"
        echo "  test    - Run performance tests"
        exit 1
        ;;
esac
