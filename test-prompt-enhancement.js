// Simple test for prompt enhancement system
import { enhanceImagePrompt, QUICK_ENHANCEMENTS } from './src/app/_actions/image/prompt-enhancer.js';

console.log('🎨 Testing Image Prompt Enhancement System');
console.log('========================================\n');

// Test 1: Basic prompt enhancement
console.log('📝 Test 1: Basic Prompt Enhancement');
console.log('Original: "city"');
const result1 = enhanceImagePrompt('city', { style: 'professional', quality: 'high' });
console.log('Enhanced:', result1.enhanced);
console.log('Quality:', result1.quality);
console.log('Enhancements:', result1.enhancements.join(', '));
console.log('');

// Test 2: Business prompt
console.log('📝 Test 2: Business Prompt');
console.log('Original: "team meeting"');
const result2 = QUICK_ENHANCEMENTS.business('team meeting');
console.log('Enhanced:', result2.enhanced);
console.log('Quality:', result2.quality);
console.log('');

// Test 3: Creative prompt
console.log('📝 Test 3: Creative Prompt');
console.log('Original: "abstract concept"');
const result3 = QUICK_ENHANCEMENTS.creative('abstract concept');
console.log('Enhanced:', result3.enhanced);
console.log('Quality:', result3.quality);
console.log('');

// Test 4: Technical prompt
console.log('📝 Test 4: Technical Prompt');
console.log('Original: "microchip"');
const result4 = QUICK_ENHANCEMENTS.technical('microchip');
console.log('Enhanced:', result4.enhanced);
console.log('Quality:', result4.quality);
console.log('');

// Test 5: Presentation context
console.log('📝 Test 5: Presentation Context');
console.log('Original: "business growth"');
const result5 = QUICK_ENHANCEMENTS.presentation('business growth', 'Annual Business Review');
console.log('Enhanced:', result5.enhanced);
console.log('Quality:', result5.quality);
console.log('');

console.log('✅ Prompt Enhancement Test Complete!');
console.log('\n🔍 Key Improvements:');
console.log('  • Added style-specific enhancements');
console.log('  • Included quality indicators');
console.log('  • Added technical details');
console.log('  • Specified color schemes');
console.log('  • Added aspect ratio information');
console.log('  • Included lighting and camera details');
console.log('  • Context-aware enhancements');
