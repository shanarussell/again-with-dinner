import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { parseInstructionList } from '../../../utils/instructionParser';

const InstructionsSection = ({ instructions, onInstructionsChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const addInstruction = () => {
    const newInstructions = [...instructions, { id: Date.now(), text: '' }];
    onInstructionsChange(newInstructions);
  };

  const removeInstruction = (id) => {
    const newInstructions = instructions.filter(instruction => instruction.id !== id);
    onInstructionsChange(newInstructions);
  };

  const updateInstruction = (id, text) => {
    const newInstructions = instructions.map(instruction =>
      instruction.id === id ? { ...instruction, text } : instruction
    );
    onInstructionsChange(newInstructions);
  };

  const moveInstruction = (id, direction) => {
    const currentIndex = instructions.findIndex(instruction => instruction.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === instructions.length - 1)
    ) {
      return;
    }

    const newInstructions = [...instructions];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newInstructions[currentIndex], newInstructions[targetIndex]] = 
    [newInstructions[targetIndex], newInstructions[currentIndex]];
    
    onInstructionsChange(newInstructions);
  };

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Check if pasted text contains line breaks (multiple instructions)
    if (pastedText.includes('\n')) {
      e.preventDefault(); // Prevent default paste behavior
      
      // Split by line breaks and filter out empty lines
      const lines = pastedText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      // Only process if we have multiple lines
      if (lines.length > 1) {
        // Parse the instructions using the instruction parser utility
        const parsedInstructions = parseInstructionList(lines);
        
        // Convert parsed instructions to the format expected by the component
        const newInstructions = parsedInstructions.map(instruction => ({
          id: Date.now() + Math.random(), // Ensure unique IDs
          text: instruction.text
        }));
        
        // Find the current instruction being edited and replace it with the first parsed instruction
        const currentInstructionIndex = instructions.findIndex(inst => {
          const activeElement = document.activeElement;
          return activeElement && activeElement.value === inst.text;
        });
        
        if (currentInstructionIndex !== -1 && newInstructions.length > 0) {
          // Replace current instruction with first parsed instruction
          const updatedInstructions = [...instructions];
          updatedInstructions[currentInstructionIndex] = newInstructions[0];
          
          // Add remaining parsed instructions after the current one
          const remainingInstructions = newInstructions.slice(1);
          updatedInstructions.splice(currentInstructionIndex + 1, 0, ...remainingInstructions);
          
          onInstructionsChange(updatedInstructions);
        } else {
          // If no current instruction is being edited, add all parsed instructions
          const updatedInstructions = [...instructions, ...newInstructions];
          onInstructionsChange(updatedInstructions);
        }
        
        return;
      }
    }
    
    // For single line paste, allow default behavior
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-text-primary">
          Instructions
        </label>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-md hover:bg-surface-100 transition-colors duration-200"
        >
          <Icon
            name={isExpanded ? "ChevronUp" : "ChevronDown"}
            size={20}
            color="var(--color-text-secondary)"
          />
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {instructions.map((instruction, index) => (
            <div key={instruction.id} className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-text-primary">
                    Step {index + 1}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => moveInstruction(instruction.id, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded-md hover:bg-surface-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <Icon name="ChevronUp" size={16} color="var(--color-text-secondary)" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveInstruction(instruction.id, 'down')}
                    disabled={index === instructions.length - 1}
                    className="p-1 rounded-md hover:bg-surface-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <Icon name="ChevronDown" size={16} color="var(--color-text-secondary)" />
                  </button>
                  {instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstruction(instruction.id)}
                      className="p-1 text-error hover:bg-error-50 rounded-md transition-colors duration-200"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>
                  )}
                </div>
              </div>
              <textarea
                placeholder="Describe this step in detail... (or paste multiple instructions)"
                value={instruction.text}
                onChange={(e) => updateInstruction(instruction.id, e.target.value)}
                onPaste={handlePaste}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
              />
            </div>
          ))}

          <Button
            type="button"
            variant="ghost"
            onClick={addInstruction}
            iconName="Plus"
            iconPosition="left"
            className="w-full justify-center border border-dashed border-border hover:border-primary hover:bg-primary-50"
          >
            Add Step
          </Button>
        </div>
      )}
    </div>
  );
};

export default InstructionsSection;