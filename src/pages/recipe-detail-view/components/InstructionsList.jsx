import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

// Helper: parse time from step text (returns seconds)
const parseTimeFromText = (text) => {
  // Match e.g. '1 hour 20 minutes 30 seconds', '30 min', '45 sec', etc.
  if (!text) return null;
  let totalSeconds = 0;
  // Match all time units in the string
  const regex = /(\d+)\s*(hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)\b/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    if (unit.startsWith('hour') || unit === 'hr' || unit === 'h') {
      totalSeconds += value * 3600;
    } else if (unit.startsWith('min') || unit === 'm') {
      totalSeconds += value * 60;
    } else if (unit.startsWith('sec') || unit === 's') {
      totalSeconds += value;
    }
  }
  return totalSeconds > 0 ? totalSeconds : null;
};

// Full-screen timer overlay component
const FullScreenTimer = ({ timer, onClose, onPause, onResume, onReset, onStop }) => {
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-8xl font-mono mb-8">
          {formatTime(timer.secondsLeft)}
        </div>
        
        {timer.finished && (
          <div className="text-green-400 text-3xl mb-8 animate-bounce">Time's up!</div>
        )}
        
        <div className="text-xl mb-8">{timer.label}</div>
        
        <div className="flex justify-center space-x-4">
          {!timer.paused && !timer.finished && (
            <button
              className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 text-lg"
              onClick={onPause}
            >
              Pause
            </button>
          )}
          {timer.paused && !timer.finished && (
            <button
              className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 text-lg"
              onClick={onResume}
            >
              Resume
            </button>
          )}
          <button
            className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 text-lg"
            onClick={onReset}
          >
            Start Over
          </button>
          <button
            className="px-6 py-3 bg-orange-500 rounded-lg hover:bg-orange-600 text-lg"
            onClick={onStop}
          >
            Stop
          </button>
          <button
            className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 text-lg"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const InstructionsList = ({ instructions, ingredients = [], cookingMode = false, onFinishCooking }) => {
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [activeTimer, setActiveTimer] = useState(null); // { stepIndex, secondsLeft, label, totalSeconds, paused }
  const [showFullScreenTimer, setShowFullScreenTimer] = useState(false);
  const timerRef = React.useRef();
  const [timerFinished, setTimerFinished] = useState(false);
  const prevCookingMode = React.useRef(cookingMode);
  const timerAudioRef = React.useRef(null);

  // Preload timer sound
  useEffect(() => {
    timerAudioRef.current = new window.Audio('/assets/timer-done.mp3');
  }, []);

  // Reset completed steps and timers when exiting cooking mode
  useEffect(() => {
    if (prevCookingMode.current && !cookingMode) {
      setCompletedSteps(new Set());
      setActiveTimer(null);
      setTimerFinished(false);
      setShowFullScreenTimer(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    prevCookingMode.current = cookingMode;
  }, [cookingMode]);

  const toggleStep = (index) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedSteps(newCompleted);
  };

  // Helper: fuzzy match ingredient names in step text
  const findIngredientMentions = (stepText) => {
    if (!ingredients || ingredients.length === 0) return [];
    const mentions = [];
    ingredients.forEach(ing => {
      if (!ing.name) return;
      // Simple fuzzy match: look for ingredient name as a word in the step (case-insensitive)
      const regex = new RegExp(`\\b${ing.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      if (regex.test(stepText)) {
        mentions.push(ing);
      }
    });
    return mentions;
  };

  // Timer logic (inline)
  useEffect(() => {
    if (!activeTimer || activeTimer.paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setActiveTimer(prev => {
        if (!prev) return null;
        if (prev.secondsLeft <= 1) {
          clearInterval(timerRef.current);
          setTimerFinished(true);
          // Play sound
          try {
            if (timerAudioRef.current) {
              timerAudioRef.current.muted = false;
              timerAudioRef.current.currentTime = 0;
              timerAudioRef.current.play();
            }
          } catch {}
          return { ...prev, secondsLeft: 0, paused: true, finished: true };
        }
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [activeTimer?.paused, activeTimer?.stepIndex]);

  const startTimer = (stepIndex, seconds, label) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setActiveTimer({ stepIndex, secondsLeft: seconds, totalSeconds: seconds, label, paused: false, finished: false });
    setTimerFinished(false);
  };
  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setActiveTimer(null);
    setTimerFinished(false);
    setShowFullScreenTimer(false);
  };
  const pauseTimer = () => {
    setActiveTimer(prev => prev ? { ...prev, paused: true } : null);
  };
  const resumeTimer = () => {
    setActiveTimer(prev => prev ? { ...prev, paused: false } : null);
  };
  const resetTimer = () => {
    setActiveTimer(prev => prev ? { ...prev, secondsLeft: prev.totalSeconds, paused: false, finished: false } : null);
    setTimerFinished(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-semibold text-text-primary">
          Instructions
        </h3>
        <span className="text-sm text-text-secondary">
          {completedSteps.size}/{instructions.length} completed
        </span>
      </div>
      
      {/* Cooking Mode Overlay: Finish Cooking */}
      {cookingMode && (
        <div className="fixed top-0 left-0 w-full flex justify-end p-4 z-40">
          <button
            className="px-5 py-2 bg-gray-900 text-white rounded-lg text-base font-semibold shadow-lg hover:bg-gray-800"
            onClick={onFinishCooking}
          >
            Finish Cooking
          </button>
        </div>
      )}

      <div className="space-y-4">
        {instructions.map((instruction, index) => {
          const seconds = parseTimeFromText(instruction.text);
          const isTimerActive = activeTimer && activeTimer.stepIndex === index;
          return (
            <div
              key={index}
              className={`flex space-x-4 p-4 rounded-lg border transition-colors duration-200 cursor-pointer ${
                completedSteps.has(index)
                  ? 'bg-success-100 border-success-200' :
                  cookingMode ? 'hover:bg-success-50 border-border' : 'bg-surface-50 border-border hover:border-primary-200'
              }`}
              onClick={cookingMode ? () => toggleStep(index) : undefined}
            >
              <button
                onClick={e => { e.stopPropagation(); toggleStep(index); }}
                className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold text-sm transition-colors duration-200 ${
                  completedSteps.has(index)
                    ? 'bg-success border-success text-white' :'border-primary text-primary hover:bg-primary hover:text-white'
                }`}
              >
                {completedSteps.has(index) ? (
                  <Icon name="Check" size={16} color="white" strokeWidth={3} />
                ) : (
                  index + 1
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={`${cookingMode ? 'text-base' : 'text-sm'} leading-relaxed ${
                  completedSteps.has(index)
                    ? 'text-success-700' :'text-text-primary'
                }`}>
                  {cookingMode
                    ? (() => {
                        // Highlight ingredient mentions and show quantity/unit
                        const mentions = findIngredientMentions(instruction.text);
                        if (mentions.length === 0) return instruction.text;
                        let rendered = instruction.text;
                        mentions.forEach(ing => {
                          // Replace first occurrence of ingredient name with highlighted version
                          const regex = new RegExp(`\\b${ing.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
                          rendered = rendered.replace(
                            regex,
                            match => {
                              let amountText = ing.amount || '';
                              // Only show unit if not already in amount
                              if (
                                ing.unit &&
                                typeof amountText === 'string' &&
                                !amountText.toLowerCase().includes(ing.unit.toLowerCase())
                              ) {
                                amountText = `${amountText} ${ing.unit}`;
                              }
                              return `${match} <span class='inline-block bg-yellow-100 text-yellow-900 font-semibold rounded px-1 mx-1'>(` +
                                `${amountText}`.trim() +
                                `)</span>`;
                            }
                          );
                        });
                        // Render as HTML (safe because we control the markup)
                        return <span dangerouslySetInnerHTML={{ __html: rendered }} />;
                      })()
                    : instruction.text}
                </p>
                
                {/* Timer button and inline timer UI for detected time in step */}
                {cookingMode && seconds && !isTimerActive && (
                  <button
                    className="flex items-center space-x-2 mt-2 text-xs text-white bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded shadow transition-colors"
                    onClick={() => {
                      startTimer(index, seconds, `Step ${index + 1} Timer`);
                    }}
                  >
                    <Icon name="Timer" size={14} color="white" />
                    <span>Start {seconds >= 60 ? `${Math.floor(seconds/60)}:${(seconds%60).toString().padStart(2,'0')}` : `${seconds}`} timer</span>
                  </button>
                )}
                {cookingMode && isTimerActive && (
                  <div className="mt-3 p-4 bg-black bg-opacity-80 rounded-lg flex flex-col items-center text-white">
                    <div className="text-3xl font-mono mb-2">
                      {Math.floor(activeTimer.secondsLeft / 60).toString().padStart(2, '0')}
                      :
                      {(activeTimer.secondsLeft % 60).toString().padStart(2, '0')}
                    </div>
                    {timerFinished && (
                      <div className="text-green-400 text-lg mb-2 animate-bounce">Time's up!</div>
                    )}
                    <div className="flex space-x-2">
                      {!activeTimer.paused && !timerFinished && (
                        <button
                          className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm"
                          onClick={pauseTimer}
                        >Pause</button>
                      )}
                      {activeTimer.paused && !timerFinished && (
                        <button
                          className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm"
                          onClick={resumeTimer}
                        >Resume</button>
                      )}
                      <button
                        className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm"
                        onClick={resetTimer}
                      >Start Over</button>
                      <button
                        className="px-3 py-1 bg-orange-500 rounded hover:bg-orange-600 text-sm"
                        onClick={stopTimer}
                      >Stop</button>
                      <button
                        className="px-3 py-1 bg-blue-500 rounded hover:bg-blue-600 text-sm"
                        onClick={() => setShowFullScreenTimer(true)}
                      >
                        <Icon name="Maximize2" size={14} color="white" />
                      </button>
                    </div>
                  </div>
                )}
                {instruction.timer && !cookingMode && (
                  <div className="flex items-center space-x-2 mt-2 text-xs text-text-secondary">
                    <Icon name="Timer" size={14} color="var(--color-text-secondary)" />
                    <span>{instruction.timer}</span>
                  </div>
                )}
                
                {instruction.temperature && (
                  <div className="flex items-center space-x-2 mt-1 text-xs text-text-secondary">
                    <Icon name="Thermometer" size={14} color="var(--color-text-secondary)" />
                    <span>{instruction.temperature}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full-screen timer overlay */}
      {showFullScreenTimer && activeTimer && (
        <FullScreenTimer
          timer={activeTimer}
          onClose={() => setShowFullScreenTimer(false)}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onReset={resetTimer}
          onStop={stopTimer}
        />
      )}
    </div>
  );
};

export default InstructionsList;