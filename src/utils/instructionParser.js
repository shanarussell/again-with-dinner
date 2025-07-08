// Utility functions for parsing and handling recipe instructions

/**
 * Parse instruction text into structured object
 * @param {string} instructionText - Raw instruction text
 * @returns {Object} Structured instruction object with text
 */
export const parseInstructionText = (instructionText) => {
  if (!instructionText || typeof instructionText !== 'string') {
    return null;
  }

  const text = instructionText.trim();
  if (!text) {
    return null;
  }

  // Clean up common instruction formatting
  let cleanText = text;
  
  // Remove leading step numbers like "1.", "2)", "Step 1:", etc.
  cleanText = cleanText.replace(/^(?:step\s*)?\d+[.):\s-]+/i, '');
  
  // Remove leading bullet points and dashes
  cleanText = cleanText.replace(/^[-•*]\s*/, '');
  
  // Clean up extra whitespace
  cleanText = cleanText.replace(/\s+/g, ' ').trim();
  
  if (!cleanText) {
    return null;
  }

  return {
    text: cleanText,
    id: Date.now() + Math.random() // Unique ID for React keys
  };
};

/**
 * Parse array of instruction texts into structured objects
 * @param {Array} instructionTexts - Array of instruction text strings
 * @returns {Array} Array of structured instruction objects
 */
export const parseInstructionList = (instructionTexts) => {
  if (!Array.isArray(instructionTexts)) {
    return [];
  }

  return instructionTexts
    .map(text => parseInstructionText(text))
    .filter(instruction => instruction !== null);
};

/**
 * Convert structured instruction back to text format
 * @param {Object} instruction - Structured instruction object
 * @returns {string} Instruction text
 */
export const instructionToText = (instruction) => {
  if (!instruction || typeof instruction !== 'object') {
    return '';
  }

  // If it's already a text string, return as is
  if (typeof instruction === 'string') {
    return instruction;
  }

  // If it has text property, return it
  if (instruction.text) {
    return instruction.text.trim();
  }

  return '';
};

/**
 * Validate instruction object structure
 * @param {Object} instruction - Instruction object to validate
 * @param {string} recipeTitle - Recipe title for error context
 * @param {number} index - Instruction index for error context
 * @returns {Object|null} Validated instruction or null if invalid
 */
export const validateInstruction = (instruction, recipeTitle = '', index = 0) => {
  if (!instruction || typeof instruction !== 'object') {
    console.warn(`Invalid instruction at index ${index} in recipe "${recipeTitle}":`, instruction);
    return null;
  }

  const text = instruction.text || instruction.instruction || instruction.step;
  
  if (!text || typeof text !== 'string' || text.trim() === '') {
    console.warn(`Missing or invalid instruction text at index ${index} in recipe "${recipeTitle}":`, instruction);
    return null;
  }

  return { 
    text: text.trim(),
    id: instruction.id || Date.now() + Math.random()
  };
};

/**
 * Normalize instructions from database to handle both old and new formats
 * @param {Array|string} instructions - Raw instructions from database
 * @param {string} recipeTitle - Recipe title for error context
 * @returns {Array} Normalized instruction objects
 */
export const normalizeInstructions = (instructions, recipeTitle = '') => {
  // Handle different data types
  if (!instructions) {
    console.warn(`Recipe "${recipeTitle}" has null/undefined instructions`);
    return [];
  }

  if (typeof instructions === 'string') {
    try {
      instructions = JSON.parse(instructions);
    } catch (e) {
      console.warn(`Failed to parse instructions string for recipe "${recipeTitle}":`, instructions);
      return [];
    }
  }

  if (!Array.isArray(instructions)) {
    console.warn(`Recipe "${recipeTitle}" has non-array instructions:`, instructions);
    return [];
  }

  // Process each instruction
  return instructions
    .map((instruction, index) => {
      // If it's a string, parse it into structured format
      if (typeof instruction === 'string') {
        return parseInstructionText(instruction);
      }
      
      // If it's already an object, validate it
      if (typeof instruction === 'object') {
        return validateInstruction(instruction, recipeTitle, index);
      }
      
      return null;
    })
    .filter(instruction => instruction !== null);
};

export default {
  parseInstructionText,
  parseInstructionList,
  instructionToText,
  validateInstruction,
  normalizeInstructions
};