#!/bin/bash

# Test Prompt Enhancement System
echo "🎨 Testing Image Prompt Enhancement System"
echo "========================================"

# Test basic prompts
echo ""
echo "📝 Testing Basic Prompt Enhancement:"
echo "Original: 'city'"
echo "Enhanced: $(node -e "
const { enhanceImagePrompt } = require('./src/app/_actions/image/prompt-enhancer.ts');
const result = enhanceImagePrompt('city', { style: 'professional', quality: 'high' });
console.log(result.enhanced);
")"

echo ""
echo "📝 Testing Business Prompt:"
echo "Original: 'team meeting'"
echo "Enhanced: $(node -e "
const { QUICK_ENHANCEMENTS } = require('./src/app/_actions/image/prompt-enhancer.ts');
const result = QUICK_ENHANCEMENTS.business('team meeting');
console.log(result.enhanced);
")"

echo ""
echo "📝 Testing Creative Prompt:"
echo "Original: 'abstract concept'"
echo "Enhanced: $(node -e "
const { QUICK_ENHANCEMENTS } = require('./src/app/_actions/image/prompt-enhancer.ts');
const result = QUICK_ENHANCEMENTS.creative('abstract concept');
console.log(result.enhanced);
")"

echo ""
echo "📝 Testing Technical Prompt:"
echo "Original: 'microchip'"
echo "Enhanced: $(node -e "
const { QUICK_ENHANCEMENTS } = require('./src/app/_actions/image/prompt-enhancer.ts');
const result = QUICK_ENHANCEMENTS.technical('microchip');
console.log(result.enhanced);
")"

echo ""
echo "📝 Testing Presentation Context:"
echo "Original: 'business growth'"
echo "Enhanced: $(node -e "
const { QUICK_ENHANCEMENTS } = require('./src/app/_actions/image/prompt-enhancer.ts');
const result = QUICK_ENHANCEMENTS.presentation('business growth', 'Annual Business Review');
console.log(result.enhanced);
")"

echo ""
echo "✅ Prompt Enhancement Test Complete!"
echo ""
echo "🔍 Key Improvements:"
echo "  • Added style-specific enhancements"
echo "  • Included quality indicators"
echo "  • Added technical details"
echo "  • Specified color schemes"
echo "  • Added aspect ratio information"
echo "  • Included lighting and camera details"
echo "  • Context-aware enhancements"
