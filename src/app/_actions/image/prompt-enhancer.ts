/**
 * Image Prompt Enhancement System
 * 
 * This module provides intelligent prompt enhancement to improve the quality
 * of generated images by adding detail, style, and technical specifications
 * to basic user prompts.
 */

export interface PromptEnhancementOptions {
  style?: 'professional' | 'creative' | 'minimalist' | 'photorealistic' | 'artistic';
  quality?: 'standard' | 'high' | 'ultra';
  aspectRatio?: 'landscape' | 'portrait' | 'square';
  colorScheme?: 'vibrant' | 'monochrome' | 'warm' | 'cool' | 'natural';
  addTechnicalDetails?: boolean;
  context?: string; // Additional context about the presentation topic
}

export interface EnhancedPrompt {
  original: string;
  enhanced: string;
  enhancements: string[];
  quality: 'low' | 'medium' | 'high' | 'ultra';
}

/**
 * Quality assessment categories for prompt evaluation
 */
const QUALITY_INDICATORS = {
  high: [
    'detailed', 'intricate', 'professional', 'high-quality', 'photorealistic',
    '4k', '8k', 'ultra-detailed', 'sharp focus', 'dramatic lighting',
    'cinematic', 'award-winning', 'masterpiece', 'stunning'
  ],
  medium: [
    'clear', 'good quality', 'nice', 'beautiful', 'well-designed',
    'modern', 'clean', 'attractive', 'appealing'
  ],
  low: [
    'simple', 'basic', 'plain', 'ordinary', 'average'
  ]
};

/**
 * Style-specific enhancement templates
 */
const STYLE_TEMPLATES = {
  professional: [
    'professional business setting',
    'corporate environment',
    'office background',
    'business professional',
    'formal setting'
  ],
  creative: [
    'artistic composition',
    'creative design',
    'innovative concept',
    'artistic interpretation',
    'creative visualization'
  ],
  minimalist: [
    'clean minimalist design',
    'simple elegant composition',
    'minimal aesthetic',
    'clean lines',
    'uncluttered design'
  ],
  photorealistic: [
    'photorealistic detail',
    'realistic photography',
    'lifelike rendering',
    'photo-quality',
    'realistic lighting'
  ],
  artistic: [
    'artistic style',
    'creative interpretation',
    'artistic rendering',
    'stylized design',
    'artistic composition'
  ]
};

/**
 * Technical enhancement keywords for different subjects
 */
const TECHNICAL_ENHANCEMENTS = {
  technology: [
    'cutting-edge technology',
    'advanced innovation',
    'digital transformation',
    'futuristic design',
    'tech-forward'
  ],
  business: [
    'professional setting',
    'corporate environment',
    'business professional',
    'modern office',
    'executive level'
  ],
  nature: [
    'natural lighting',
    'organic elements',
    'environmental setting',
    'sustainable design',
    'eco-friendly'
  ],
  people: [
    'diverse representation',
    'professional attire',
    'natural poses',
    'engaged expressions',
    'authentic interactions'
  ],
  abstract: [
    'geometric patterns',
    'abstract design',
    'conceptual art',
    'symbolic representation',
    'metaphorical imagery'
  ]
};

/**
 * Color scheme enhancements
 */
const COLOR_ENHANCEMENTS = {
  vibrant: [
    'vibrant colors',
    'bold saturation',
    'rich color palette',
    'dynamic contrast',
    'eye-catching hues'
  ],
  monochrome: [
    'monochromatic scheme',
    'black and white',
    'grayscale tones',
    'subtle gradations',
    'elegant simplicity'
  ],
  warm: [
    'warm color palette',
    'golden tones',
    'soft lighting',
    'inviting atmosphere',
    'comfortable hues'
  ],
  cool: [
    'cool color palette',
    'blue tones',
    'crisp lighting',
    'calm atmosphere',
    'refreshing colors'
  ],
  natural: [
    'natural colors',
    'earth tones',
    'organic palette',
    'realistic colors',
    'balanced saturation'
  ]
};

/**
 * Assess the current quality of a prompt
 */
function assessPromptQuality(prompt: string): 'low' | 'medium' | 'high' | 'ultra' {
  const lowerPrompt = prompt.toLowerCase();
  let highScore = 0;
  let mediumScore = 0;
  let lowScore = 0;

  // Count quality indicators
  QUALITY_INDICATORS.high.forEach(indicator => {
    if (lowerPrompt.includes(indicator)) highScore++;
  });
  
  QUALITY_INDICATORS.medium.forEach(indicator => {
    if (lowerPrompt.includes(indicator)) mediumScore++;
  });
  
  QUALITY_INDICATORS.low.forEach(indicator => {
    if (lowerPrompt.includes(indicator)) lowScore++;
  });

  // Count descriptive words (good indicator)
  const descriptiveWords = lowerPrompt.match(/\b(adjective|detailed|intricate|complex|sophisticated|elegant|modern|contemporary)\b/g);
  const descriptiveScore = descriptiveWords ? descriptiveWords.length : 0;

  // Count length and complexity
  const wordCount = prompt.split(/\s+/).length;
  const lengthScore = wordCount > 10 ? 2 : wordCount > 5 ? 1 : 0;

  // Calculate final quality
  const totalScore = highScore * 3 + mediumScore * 2 + descriptiveScore * 2 + lengthScore - lowScore;
  
  if (totalScore >= 6) return 'ultra';
  if (totalScore >= 4) return 'high';
  if (totalScore >= 2) return 'medium';
  return 'low';
}

/**
 * Determine the subject category for technical enhancements
 */
function categorizePrompt(prompt: string): keyof typeof TECHNICAL_ENHANCEMENTS {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('technology') || lowerPrompt.includes('tech') || lowerPrompt.includes('digital') || lowerPrompt.includes('computer') || lowerPrompt.includes('software')) {
    return 'technology';
  }
  if (lowerPrompt.includes('business') || lowerPrompt.includes('office') || lowerPrompt.includes('corporate') || lowerPrompt.includes('professional') || lowerPrompt.includes('meeting')) {
    return 'business';
  }
  if (lowerPrompt.includes('nature') || lowerPrompt.includes('environment') || lowerPrompt.includes('landscape') || lowerPrompt.includes('outdoor') || lowerPrompt.includes('forest') || lowerPrompt.includes('mountain')) {
    return 'nature';
  }
  if (lowerPrompt.includes('people') || lowerPrompt.includes('person') || lowerPrompt.includes('team') || lowerPrompt.includes('group') || lowerPrompt.includes('woman') || lowerPrompt.includes('man')) {
    return 'people';
  }
  if (lowerPrompt.includes('abstract') || lowerPrompt.includes('concept') || lowerPrompt.includes('symbol') || lowerPrompt.includes('pattern') || lowerPrompt.includes('geometric')) {
    return 'abstract';
  }
  
  return 'technology'; // Default fallback
}

/**
 * Select appropriate enhancements based on prompt analysis
 */
function selectEnhancements(prompt: string, options: PromptEnhancementOptions): string[] {
  const enhancements: string[] = [];
  const category = categorizePrompt(prompt);
  const currentQuality = assessPromptQuality(prompt);
  
  // Only add enhancements if current quality is below the target
  const targetQuality = options.quality === 'ultra' ? 'ultra' : options.quality === 'high' ? 'high' : 'medium';
  
  if (currentQuality === 'low' || currentQuality === 'medium') {
    // Add style-specific enhancements
    if (options.style && STYLE_TEMPLATES[options.style]) {
      const list = STYLE_TEMPLATES[options.style]!;
      const styleTemplate = list[Math.floor(Math.random() * list.length)];
      if (styleTemplate) enhancements.push(styleTemplate);
    }
    
    // Add technical enhancements based on category
    if (options.addTechnicalDetails !== false) {
      const list = TECHNICAL_ENHANCEMENTS[category]!;
      const techEnhancement = list[Math.floor(Math.random() * list.length)];
      if (techEnhancement) enhancements.push(techEnhancement);
    }
    
    // Add color scheme
    if (options.colorScheme && COLOR_ENHANCEMENTS[options.colorScheme]) {
      const list = COLOR_ENHANCEMENTS[options.colorScheme]!;
      const colorEnhancement = list[Math.floor(Math.random() * list.length)];
      if (colorEnhancement) enhancements.push(colorEnhancement);
    }
    
    // Add quality indicators based on target quality
    if (targetQuality === 'ultra' || targetQuality === 'high') {
      const list = QUALITY_INDICATORS.high;
      const highQualityIndicator = list[Math.floor(Math.random() * list.length)];
      if (highQualityIndicator) enhancements.push(highQualityIndicator);
    }
  }
  
  // Add context if provided
  if (options.context) {
    enhancements.push(`context: ${options.context}`);
  }
  
  return enhancements;
}

/**
 * Build the enhanced prompt by intelligently combining original prompt with enhancements
 */
function buildEnhancedPrompt(original: string, enhancements: string[], options: PromptEnhancementOptions): string {
  if (enhancements.length === 0) {
    return original;
  }
  
  // Start with the original prompt
  let enhanced = original;
  
  // Determine the best way to integrate enhancements
  const hasComma = original.includes(',');
  const hasAnd = original.toLowerCase().includes(' and ');
  
  if (enhancements.length === 1) {
    // Single enhancement - add with appropriate connector
    const singleEnhancement = enhancements[0];
    if (hasComma || hasAnd) {
      enhanced += `, ${singleEnhancement}`;
    } else {
      enhanced += ` with ${singleEnhancement}`;
    }
  } else {
    // Multiple enhancements - structure them logically
    const qualityEnhancements = enhancements.filter(e => 
      QUALITY_INDICATORS.high.some(indicator => e.toLowerCase().includes(indicator)) ||
      QUALITY_INDICATORS.medium.some(indicator => e.toLowerCase().includes(indicator))
    );
    
    const styleEnhancements = enhancements.filter(e => 
      !qualityEnhancements.includes(e) && !e.startsWith('context:')
    );
    
    const contextEnhancements = enhancements.filter(e => e.startsWith('context:'));
    
    // Build the enhanced prompt step by step
    if (styleEnhancements.length > 0) {
      enhanced += `, ${styleEnhancements.join(', ')}`;
    }
    
    if (qualityEnhancements.length > 0) {
      enhanced += `, ${qualityEnhancements.join(', ')}`;
    }
    
    if (contextEnhancements.length > 0) {
      const contextEnhancement = contextEnhancements[0];
      if (contextEnhancement) {
        enhanced += ` (${contextEnhancement.replace('context: ', '')})`;
      }
    }
  }
  
  // Add aspect ratio if specified
  if (options.aspectRatio) {
    const aspectMap = {
      landscape: '16:9 aspect ratio',
      portrait: '9:16 aspect ratio',
      square: '1:1 aspect ratio'
    };
    enhanced += `, ${aspectMap[options.aspectRatio]}`;
  }
  
  // Add lighting and camera details for high-quality outputs
  if (options.quality === 'high' || options.quality === 'ultra') {
    enhanced += ', professional lighting, sharp focus';
  }
  
  if (options.quality === 'ultra') {
    enhanced += ', 8K resolution, award-winning photography';
  }
  
  return enhanced;
}

/**
 * Main function to enhance image prompts
 */
export function enhanceImagePrompt(
  originalPrompt: string, 
  options: PromptEnhancementOptions = {}
): EnhancedPrompt {
  // Clean the original prompt
  const original = originalPrompt.trim();
  
  // Skip enhancement if prompt is already high quality
  const currentQuality = assessPromptQuality(original);
  
  if (currentQuality === 'ultra' && !options.context) {
    return {
      original,
      enhanced: original,
      enhancements: [],
      quality: currentQuality
    };
  }
  
  // Select appropriate enhancements
  const enhancements = selectEnhancements(original, options);
  
  // Build the enhanced prompt
  const enhanced = buildEnhancedPrompt(original, enhancements, options);
  
  // Assess final quality
  const finalQuality = assessPromptQuality(enhanced);
  
  return {
    original,
    enhanced,
    enhancements,
    quality: finalQuality
  };
}

/**
 * Batch enhance multiple prompts with consistent options
 */
export function enhanceImagePrompts(
  prompts: string[],
  options: PromptEnhancementOptions = {}
): EnhancedPrompt[] {
  return prompts.map(prompt => enhanceImagePrompt(prompt, options));
}

/**
 * Smart enhancement based on presentation context
 */
export function enhancePromptForPresentation(
  prompt: string,
  presentationTitle: string,
  presentationTone?: string
): EnhancedPrompt {
  const context = `presentation about ${presentationTitle}`;
  
  // Determine style based on tone
  let style: PromptEnhancementOptions['style'] = 'professional';
  if (presentationTone) {
    const tone = presentationTone.toLowerCase();
    if (tone.includes('creative') || tone.includes('artistic')) style = 'creative';
    else if (tone.includes('minimal') || tone.includes('clean')) style = 'minimalist';
    else if (tone.includes('photo') || tone.includes('real')) style = 'photorealistic';
  }
  
  return enhanceImagePrompt(prompt, {
    style,
    quality: 'high',
    addTechnicalDetails: true,
    context,
    colorScheme: 'natural',
    aspectRatio: 'landscape'
  });
}

/**
 * Quick enhancement for common use cases
 */
export const QUICK_ENHANCEMENTS = {
  business: (prompt: string) => enhanceImagePrompt(prompt, {
    style: 'professional',
    quality: 'high',
    colorScheme: 'natural',
    aspectRatio: 'landscape'
  }),
  
  creative: (prompt: string) => enhanceImagePrompt(prompt, {
    style: 'creative',
    quality: 'high',
    colorScheme: 'vibrant',
    aspectRatio: 'square'
  }),
  
  technical: (prompt: string) => enhanceImagePrompt(prompt, {
    style: 'photorealistic',
    quality: 'ultra',
    addTechnicalDetails: true,
    colorScheme: 'cool',
    aspectRatio: 'landscape'
  }),
  
  presentation: (prompt: string, title: string) => enhancePromptForPresentation(prompt, title)
};
