import logger from './logger';

/**
 * Recipe scraper utility for extracting recipe data from various websites
 */
const recipeScraper = {
  // CORS proxy services for fallback
  proxyServices: [
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://thingproxy.freeboard.io/fetch/'
  ],

  /**
   * Retry utility with exponential backoff
   * @param {Function} fn - Function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} baseDelay - Base delay in milliseconds
   * @returns {Promise} Result of the function
   */
  async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries - 1) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt);
        logger.warn(`Retry attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  },

  /**
   * Fetch content with multiple proxy fallbacks
   * @param {string} url - URL to fetch
   * @returns {Promise<string>} HTML content
   */
  async fetchWithProxyFallback(url) {
    const errors = [];
    
    for (const proxyService of this.proxyServices) {
      try {
        const proxyUrl = proxyService + encodeURIComponent(url);
        logger.debug(`Trying proxy: ${proxyService}`);
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          timeout: 30000 // 30 second timeout
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();
        
        if (!html || html.trim().length === 0) {
          throw new Error('Empty response received');
        }
        
        // Check if we got an error page instead of recipe content
        if (html.includes('Access denied') || html.includes('403 Forbidden') || html.includes('Rate limit exceeded')) {
          throw new Error('Access denied or rate limited');
        }
        
        logger.debug(`Successfully fetched content using proxy: ${proxyService}`);
        return html;
        
      } catch (error) {
        logger.warn(`Proxy ${proxyService} failed:`, error.message);
        errors.push(`${proxyService}: ${error.message}`);
      }
    }
    
    throw new Error(`All proxy services failed. Errors: ${errors.join('; ')}`);
  },

  /**
   * Main function to scrape recipe data from a URL
   * @param {string} url - Recipe URL to scrape
   * @returns {Promise<Object>} Recipe data object
   */
  async scrapeRecipe(url) {
    try {
      // Validate URL
      if (!url || typeof url !== 'string') {
        throw new Error('Invalid URL provided');
      }

      const normalizedUrl = url.trim();
      
      // Validate URL format
      try {
        new URL(normalizedUrl);
      } catch (error) {
        throw new Error('Invalid URL format');
      }
      
      const urlObj = new URL(normalizedUrl);
      
      // Check if it's a supported site
      const hostname = urlObj.hostname.toLowerCase();
      
      if (hostname.includes('budgetbytes.com')) {
        return await this.scrapeBudgetBytes(normalizedUrl);
      }
      
      // For other sites, try generic JSON-LD scraping
      return await this.scrapeGenericJsonLd(normalizedUrl);
      
    } catch (error) {
      logger.error('Recipe scraping error:', error);
      throw new Error(`Failed to scrape recipe: ${error.message}`);
    }
  },

  /**
   * Scrape recipe data from Budget Bytes
   * @param {string} url - Budget Bytes recipe URL
   * @returns {Promise<Object>} Recipe data object
   */
  async scrapeBudgetBytes(url) {
    try {
      logger.debug(`Starting Budget Bytes scraping for: ${url}`);
      
      const html = await this.retryWithBackoff(async () => {
        return await this.fetchWithProxyFallback(url);
      }, 3, 2000);
      
      // Parse the HTML to extract recipe data
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Validate that we have a valid HTML document
      if (!doc || !doc.documentElement) {
        throw new Error('Failed to parse HTML document');
      }
      
      // Try to extract JSON-LD structured data first
      const jsonLdScript = doc.querySelector('script[type="application/ld+json"]');
      if (jsonLdScript) {
        try {
          const jsonData = JSON.parse(jsonLdScript.textContent);
          const recipeData = Array.isArray(jsonData) ? jsonData.find(item => item['@type'] === 'Recipe') : jsonData;
          
          if (recipeData && recipeData['@type'] === 'Recipe') {
            logger.debug('Successfully parsed JSON-LD recipe data');
            return this.parseJsonLdRecipe(recipeData);
          }
        } catch (e) {
          logger.warn('Failed to parse JSON-LD data, falling back to HTML parsing:', e.message);
        }
      }
      
      // Fallback to HTML parsing for Budget Bytes specific structure
      logger.debug('Falling back to HTML parsing');
      return this.parseBudgetBytesHtml(doc);
      
    } catch (error) {
      logger.error('Budget Bytes scraping error:', error);
      
      // Provide more specific error messages based on error type
      if (error.message.includes('All proxy services failed')) {
        throw new Error('Unable to access Budget Bytes due to network restrictions. Please try again later or check your internet connection.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Request timed out while fetching Budget Bytes recipe. Please try again.');
      } else if (error.message.includes('Rate limit')) {
        throw new Error('Too many requests to Budget Bytes. Please wait a moment and try again.');
      } else if (error.message.includes('Recipe title not found')) {
        throw new Error('This doesn\'t appear to be a valid Budget Bytes recipe page.');
      } else {
        throw new Error(`Failed to scrape Budget Bytes recipe: ${error.message}`);
      }
    }
  },

  /**
   * Parse Budget Bytes HTML structure
   * @param {Document} doc - Parsed HTML document
   * @returns {Object} Recipe data object
   */
  parseBudgetBytesHtml(doc) {
    const recipe = {
      title: '',
      image: null,
      ingredients: [],
      instructions: [],
      metadata: {
        category: '',prepTime: '',cookTime: '',servings: '',
        difficulty: 'medium',tags: ''
      }
    };

    // Extract title
    const titleElement = doc.querySelector('h1.entry-title, h1.recipe-title, .recipe-header h1');
    if (titleElement) {
      recipe.title = titleElement.textContent.trim();
    }

    // Extract image
    const imgElement = doc.querySelector('.recipe-image img, .entry-content img, .wp-post-image');
    if (imgElement) {
      recipe.image = imgElement.src || imgElement.getAttribute('data-src');
    }

    // Extract ingredients
    const ingredientElements = doc.querySelectorAll('.recipe-ingredients li, .ingredients li, .ingredient-list li');
    if (ingredientElements.length > 0) {
      recipe.ingredients = Array.from(ingredientElements).map((elem, index) => {
        const text = elem.textContent.trim();
        return {
          id: index + 1,
          text: text
        };
      });
    }

    // Extract instructions
    const instructionElements = doc.querySelectorAll('.recipe-instructions li, .instructions li, .instruction-list li, .recipe-directions li');
    if (instructionElements.length > 0) {
      recipe.instructions = Array.from(instructionElements).map((elem, index) => {
        const text = elem.textContent.trim();
        return {
          id: index + 1,
          text: text
        };
      });
    }

    // Extract metadata
    const prepTimeElement = doc.querySelector('.prep-time, .recipe-prep-time, [itemprop="prepTime"]');
    if (prepTimeElement) {
      recipe.metadata.prepTime = this.extractTimeValue(prepTimeElement.textContent);
    }

    const cookTimeElement = doc.querySelector('.cook-time, .recipe-cook-time, [itemprop="cookTime"]');
    if (cookTimeElement) {
      recipe.metadata.cookTime = this.extractTimeValue(cookTimeElement.textContent);
    }

    const servingsElement = doc.querySelector('.servings, .recipe-servings, [itemprop="recipeYield"]');
    if (servingsElement) {
      recipe.metadata.servings = this.extractNumberValue(servingsElement.textContent);
    }

    // Extract category from URL or page structure
    const categoryElement = doc.querySelector('.recipe-category, .category, .entry-category');
    if (categoryElement) {
      recipe.metadata.category = this.normalizeCategory(categoryElement.textContent.trim());
    } else {
      // Try to determine category from URL
      const urlPath = window.location?.pathname || '';
      if (urlPath.includes('breakfast')) recipe.metadata.category = 'breakfast';
      else if (urlPath.includes('lunch')) recipe.metadata.category = 'lunch';
      else if (urlPath.includes('dinner')) recipe.metadata.category = 'dinner';
      else if (urlPath.includes('dessert')) recipe.metadata.category = 'dessert';
      else if (urlPath.includes('snack')) recipe.metadata.category = 'snack';
      else recipe.metadata.category = 'main';
    }

    // Validate required fields
    if (!recipe.title) {
      throw new Error('Recipe title not found');
    }

    if (recipe.ingredients.length === 0) {
      throw new Error('Recipe ingredients not found');
    }

    if (recipe.instructions.length === 0) {
      throw new Error('Recipe instructions not found');
    }

    return recipe;
  },

  /**
   * Parse JSON-LD recipe data
   * @param {Object} jsonData - JSON-LD recipe data
   * @returns {Object} Recipe data object
   */
  parseJsonLdRecipe(jsonData) {
    const recipe = {
      title: '',
      image: null,
      ingredients: [],
      instructions: [],
      metadata: {
        category: '',
        prepTime: '',
        cookTime: '',
        servings: '',
        difficulty: 'medium',
        tags: ''
      }
    };

    // Extract title
    recipe.title = jsonData.name || '';

    // Extract image
    if (jsonData.image) {
      recipe.image = Array.isArray(jsonData.image) ? jsonData.image[0] : jsonData.image;
      if (typeof recipe.image === 'object' && recipe.image.url) {
        recipe.image = recipe.image.url;
      }
    }

    // Extract ingredients
    if (jsonData.recipeIngredient && Array.isArray(jsonData.recipeIngredient)) {
      recipe.ingredients = jsonData.recipeIngredient.map((ingredient, index) => ({
        id: index + 1,
        text: ingredient.trim()
      }));
    }

    // Extract instructions
    if (jsonData.recipeInstructions && Array.isArray(jsonData.recipeInstructions)) {
      recipe.instructions = jsonData.recipeInstructions.map((instruction, index) => {
        let text = '';
        if (typeof instruction === 'string') {
          text = instruction;
        } else if (instruction.text) {
          text = instruction.text;
        } else if (instruction.name) {
          text = instruction.name;
        }
        return {
          id: index + 1,
          text: text.trim()
        };
      });
    }

    // Extract metadata
    if (jsonData.prepTime) {
      recipe.metadata.prepTime = this.extractTimeValue(jsonData.prepTime);
    }

    if (jsonData.cookTime) {
      recipe.metadata.cookTime = this.extractTimeValue(jsonData.cookTime);
    }

    if (jsonData.recipeYield) {
      recipe.metadata.servings = this.extractNumberValue(jsonData.recipeYield);
    }

    if (jsonData.recipeCategory) {
      recipe.metadata.category = this.normalizeCategory(jsonData.recipeCategory);
    }

    if (jsonData.keywords) {
      recipe.metadata.tags = Array.isArray(jsonData.keywords) ? jsonData.keywords.join(', ') : jsonData.keywords;
    }

    return recipe;
  },

  /**
   * Generic JSON-LD scraper for other recipe sites
   * @param {string} url - Recipe URL to scrape
   * @returns {Promise<Object>} Recipe data object
   */
  async scrapeGenericJsonLd(url) {
    try {
      logger.debug(`Starting generic scraping for: ${url}`);
      
      const html = await this.retryWithBackoff(async () => {
        return await this.fetchWithProxyFallback(url);
      }, 3, 2000);
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Look for JSON-LD structured data
      const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
      
      for (const script of jsonLdScripts) {
        try {
          const jsonData = JSON.parse(script.textContent);
          const recipeData = Array.isArray(jsonData) ? jsonData.find(item => item['@type'] === 'Recipe') : jsonData;
          
          if (recipeData && recipeData['@type'] === 'Recipe') {
            logger.debug('Successfully parsed generic JSON-LD recipe data');
            return this.parseJsonLdRecipe(recipeData);
          }
        } catch (e) {
          console.warn('Failed to parse JSON-LD script:', e);
        }
      }
      
      throw new Error('No recipe data found in JSON-LD format');
      
    } catch (error) {
      console.error('Generic scraping error:', error);
      
      // Provide more specific error messages
      if (error.message.includes('All proxy services failed')) {
        throw new Error('Unable to access the recipe website due to network restrictions. Please try again later.');
      } else if (error.message.includes('No recipe data found')) {
        throw new Error('This website doesn\'t appear to have structured recipe data that we can import.');
      } else {
        throw new Error(`Failed to scrape recipe: ${error.message}`);
      }
    }
  },

  /**
   * Extract time value from text (e.g., "PT15M" or "15 minutes")
   * @param {string} timeText - Time text to parse
   * @returns {string} Normalized time value
   */
  extractTimeValue(timeText) {
    if (!timeText) return '';
    
    // Handle ISO 8601 duration format (PT15M)
    if (timeText.startsWith('PT')) {
      const match = timeText.match(/PT(\d+)M/);
      return match ? match[1] : '';
    }
    
    // Handle regular text format
    const match = timeText.match(/(\d+)/);
    return match ? match[1] : '';
  },

  /**
   * Extract number value from text
   * @param {string} text - Text to parse
   * @returns {string} Extracted number
   */
  extractNumberValue(text) {
    if (!text) return '';
    
    if (typeof text === 'number') return text.toString();
    
    const match = text.toString().match(/(\d+)/);
    return match ? match[1] : '';
  },

  /**
   * Normalize category name
   * @param {string} category - Raw category text
   * @returns {string} Normalized category
   */
  normalizeCategory(category) {
    if (!category) return 'main';
    
    const normalized = category.toLowerCase().trim();
    
    // Map common category variations
    const categoryMap = {
      'breakfast': 'breakfast',
      'lunch': 'lunch',
      'dinner': 'dinner',
      'dessert': 'dessert',
      'snack': 'snack',
      'snacks': 'snack',
      'appetizer': 'appetizer',
      'appetizers': 'appetizer',
      'main course': 'main',
      'main dish': 'main',
      'entree': 'main',
      'side dish': 'side',
      'sides': 'side',
      'soup': 'soup',
      'salad': 'salad',
      'beverage': 'beverage',
      'drink': 'beverage',
      'drinks': 'beverage'
    };
    
    return categoryMap[normalized] || 'main';
  }
};

export default recipeScraper;