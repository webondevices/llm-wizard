// useLLMCommander.js
import { useEffect, useRef } from 'react';
import { ActionConfig } from './Todo';

export const useLLMCommander = ({ states, actions }: { 
  states: any;
  actions: Record<string, ActionConfig>;
}) => {
  // Optionally keep some local references if needed
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  const handleInput = async (input: string) => {
    // Wrap your state into context if needed
    const context = { ...states };
    
    try {
      const payload = {
        input,
        context,
        availableActions: Object.fromEntries(
          Object.entries(actionsRef.current).map(([key, config]) => [
            key,
            config.description
          ])
        )
      };
      console.log('🚀 Sending request to LLM:', payload);

      const response = await fetch('/api/llm-orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log(response);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const result = await response.json();
      console.log('📥 Received response from LLM:', result);
      
      // Execute multiple actions in sequence
      if (result?.actions && Array.isArray(result.actions)) {
        for (const action of result.actions) {
          if (action.function && typeof action.function === 'string') {
            const actionConfig = actionsRef.current[action.function];
            if (actionConfig?.fn) {
              await actionConfig.fn(action.args);
            } else {
              console.error(`No action registered for ${action.function}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error executing command:', error);
      // You might want to handle this error in the UI
    }
  };

  // Optionally, subscribe to state changes or LLM events via useEffect here

  return { handleInput };
};