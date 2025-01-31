import { useState, useEffect } from 'react';

/**
 * useLLMTailwind(instructions, data, stateControllers)
 * 1) Sends instructions + current data/state to your back-end LLM endpoint.
 * 2) Receives a JSON-based UI tree to render with HTML elements and Tailwind classes.
 */
export function useLLMTailwind(instructions, data, stateControllers) {
  const [uiTree, setUiTree] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); 

  useEffect(() => {
    // On initial render OR when instructions/data changes, fetch new UI from LLM
    fetchUI();
    // eslint-disable-next-line
  }, [instructions]);

  async function fetchUI() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/llm-render-tailwind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructions,
          data: JSON.stringify(data),
          stateControllers: Object.keys(stateControllers),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const result = await response.json();

      // We expect result to have something like { ui: {...some JSON...} }
      setUiTree(JSON.parse(result.response).ui);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { uiTree, loading, error };
} 