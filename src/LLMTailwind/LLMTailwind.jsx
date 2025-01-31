import React from 'react';
import { useLLMTailwind } from '../LLMTailwind/useLLMTailwind';

import "tailwindcss/index.css";

// Basic HTML elements that we'll support
const componentMap = {
  // Layout elements
  div: 'div',
  main: 'main',
  section: 'section',
  article: 'article',
  aside: 'aside',
  header: 'header',
  footer: 'footer',
  nav: 'nav',

  // Text elements
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  p: 'p',
  span: 'span',
  strong: 'strong',
  em: 'em',

  // Interactive elements
  button: 'button',
  input: 'input',
  textarea: 'textarea',
  select: 'select',
  option: 'option',
  form: 'form',
  label: 'label',

  // List elements
  ul: 'ul',
  ol: 'ol',
  li: 'li',

  // Table elements
  table: 'table',
  thead: 'thead',
  tbody: 'tbody',
  tr: 'tr',
  th: 'th',
  td: 'td',

  // Other common elements
  img: 'img',
  a: 'a',
  hr: 'hr',
  br: 'br'
};

/**
 * LLMTailwind
 * @param {string} instructions - Plain English instructions for the LLM about what UI to render
 * @param {object} data - Optional data to pass to the LLM and rendered UI
 * @param {object} stateControllers - E.g. { value, setValue, ... }
 */
export function LLMTailwind({ instructions, data, stateControllers = {} }) {
  const { uiTree, loading, error } = useLLMTailwind(instructions, data, stateControllers);

  if (loading) return <div className="flex justify-center p-4"><span className="text-gray-500">Loading UI...</span></div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!uiTree) return null;

  console.log(uiTree);

  return renderUI(uiTree, stateControllers);
}

/**
 * Recursively render the JSON UI definition
 */
function renderUI(node, stateControllers) {
  // Handle direct text nodes or null
  if (typeof node === 'string' || node === null) {
    if (typeof node === 'string' && node.startsWith('{{') && node.endsWith('}}')) {
      const controllerName = node.slice(2, -2).trim();
      return stateControllers[controllerName] ?? node;
    }
    return node;
  }

  if (Array.isArray(node)) {
    return node.map((child, idx) => (
      <React.Fragment key={idx}>{renderUI(child, stateControllers)}</React.Fragment>
    ));
  }

  const { type, props = {}, children } = node;

  // All elements in our componentMap are HTML elements
  const Component = componentMap[type] || type;
  if (!Component) {
    console.warn(`Unknown component type: ${type}`);
    return null;
  }

  // Process props, particularly event handlers
  const parsedProps = { ...props };
  Object.keys(parsedProps).forEach((key) => {
    const propValue = parsedProps[key];
    
    if (key.startsWith('on')) {
      if (typeof propValue === 'string' && propValue.startsWith('{{') && propValue.endsWith('}}')) {
        const functionBody = propValue.slice(2, -2).trim();
        
        if (functionBody.includes('=>')) {
          try {
            parsedProps[key] = new Function(
              ...Object.keys(stateControllers),
              `return ${functionBody}`
            )(...Object.values(stateControllers));
          } catch (error) {
            console.error('Error creating event handler:', error);
            parsedProps[key] = () => {};
          }
        } else {
          const func = stateControllers[functionBody];
          if (typeof func === 'function') {
            parsedProps[key] = func;
          }
        }
      }
    } 
    // Handle state values wrapped in {{}}
    else if (typeof propValue === 'string' && propValue.startsWith('{{') && propValue.endsWith('}}')) {
      const stateKey = propValue.slice(2, -2).trim();
      parsedProps[key] = stateControllers[stateKey];
    }
  });

  let renderedChildren = null;
  if (children) {
    renderedChildren = renderUI(children, stateControllers);
  }

  return <Component {...parsedProps}>{renderedChildren}</Component>;
} 