import React from 'react';

// Example: We'll define a component map for some common Ant Design components
import {
  Button,
  Input,
  Table,
  Form,
  Modal,
  Select,
  DatePicker,
  TimePicker,
  Checkbox,
  Radio,
  Switch,
  Slider,
  Upload,
  message,
  notification,
  Spin,
  Space,
  Divider,
  Card,
  List,
  Typography,
  Tabs,
  Menu,
  Dropdown,
  Popover,
  Tooltip,
  Tag,
  Avatar,
  Badge,
  Alert,
  Progress,
  Steps,
  Collapse,
  Row,
  Col,
  Layout,
  Breadcrumb,
  ColorPicker,
  Grid,
  
} from 'antd';
import { useLLMRenderer } from './useLLMRenderer';
const { Title, Text, Paragraph, Link } = Typography;
const { Header, Footer, Sider, Content } = Layout;
const { Item: FormItem } = Form;
const { Item: MenuItem } = Menu;
const { Option } = Select;
const { TextArea } = Input;
const { Group: RadioGroup } = Radio;
const { Group: CheckboxGroup } = Checkbox;
const { RangePicker } = DatePicker;

const componentMap = {
  // Layout Components
  Layout,
  Header,
  Footer,
  Sider,
  Content,
  Row,
  Col,
  Space,
  Divider,
  Grid,

  // Navigation
  Menu,
  MenuItem,
  Breadcrumb,
  Tabs,
  
  // Data Entry
  Button,
  Input,
  TextArea,
  Select,
  Option,
  DatePicker,
  ColorPicker,
  RangePicker,
  TimePicker,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  Upload,
  Form,
  FormItem,
  
  // Data Display
  Table,
  List,
  Card,
  Typography,
  Title,
  Text,
  Paragraph,
  Link,
  Tag,
  Avatar,
  Badge,
  
  // Feedback
  Modal,
  Alert,
  message,
  notification,
  Spin,
  Progress,
  
  // Other
  Steps,
  Collapse,
  Dropdown,
  Popover,
  Tooltip
};

/**
 * LLMRenderer
 * @param {string} instructions - Plain English instructions for the LLM about what we want to render.
 * @param {object} data - Optional data to pass to the LLM and also to the rendered UI.
 * @param {object} stateControllers - E.g. { value, setValue, ... }
 */
export function LLMRenderer({ instructions, data, stateControllers = {} }) {
  // The hook returns a JSON-based UI tree, plus a refetch method if needed
  const { uiTree, loading, error } = useLLMRenderer(instructions, data, stateControllers);

  if (loading) return <div>Loading UI...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!uiTree) return null;

  // We'll recursively render the JSON representation
  return renderUI(uiTree, stateControllers);
}

/**
 * Recursively render the JSON UI definition.
 * @param {object|array} node - Could be a single component definition or an array of them.
 * @param {object} stateControllers - This object has our React states, setStates, etc.
 */
function renderUI(node, stateControllers) {
  // Handle direct text nodes or null
  if (typeof node === 'string' || node === null) {
    // Existing controller reference check
    if (typeof node === 'string' && node.startsWith('{{') && node.endsWith('}}')) {
      const controllerName = node.slice(2, -2).trim();
      return stateControllers[controllerName] ?? node;
    }
    return node;
  }

  if (Array.isArray(node)) {
    return node.map((child, idx) => <React.Fragment key={idx}>{renderUI(child, stateControllers)}</React.Fragment>);
  }

  // If `node` is an object describing a component
  const { type, props = {}, children } = node;

  // New: Handle text content with interpolation by converting it to an array of elements
  if (typeof children === 'string' && children.includes('{{')) {
    const parts = children.split(/(\{\{.*?\}\})/g).map((part, index) => {
      if (part.startsWith('{{') && part.endsWith('}}')) {
        const controllerName = part.slice(2, -2).trim();
        return <React.Fragment key={index}>{stateControllers[controllerName]}</React.Fragment>;
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
    return renderUI({ type, props, children: parts }, stateControllers);
  }

  // First check if it's a standard HTML element
  const isHTMLElement = typeof type === 'string' && type.toLowerCase() === type;
  
  // Find the actual component - either from HTML elements or our component map
  const Component = isHTMLElement ? type : componentMap[type];
  if (!Component) {
    console.warn(`Unknown component type: ${type}`);
    return null;
  }

  // Attach event handlers from the JSON definition
  // e.g. { onClick: { action: "setState", field: "something", value: "something" } }
  const parsedProps = { ...props };

  // For each prop, if it's an event (like onClick, onChange, etc.) we attach a function
  Object.keys(parsedProps).forEach((key) => {
    const propValue = parsedProps[key];
    
    // Handle event handlers (starting with 'on')
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

    // Handle Modal's visible -> open prop rename
    if (key === 'visible' && Component.name === 'Modal') {
      parsedProps.open = parsedProps[key];
      delete parsedProps.visible;
    }
  });

  // For textual or simple children (strings, numbers), we can pass them directly
  // For child components, we recursively render them
  let renderedChildren = null;
  if (children) {
    renderedChildren = renderUI(children, stateControllers);
  }

  return <Component {...parsedProps}>{renderedChildren}</Component>;
}

const handleEvent = (handler, stateControllers) => {
  if (typeof handler === 'string' && handler.startsWith('{{') && handler.endsWith('}}')) {
    // Extract the controller name from {{controllerName}}
    const controllerName = handler.slice(2, -2).trim();
    const controller = stateControllers[controllerName];

    if (typeof controller === 'function') {
      // If it's a function, return it directly to be used as event handler
      return controller;
    } else {
      // If it's a value, return it directly
      return controller;
    }
  }
  return handler; // Return as-is if it's not a controller reference
};

const renderUITree = (uiTree, stateControllers = {}) => {
  if (!uiTree) return null;
  
  // Handle string children directly (text nodes)
  if (typeof uiTree === 'string') {
    // Check if the string is a controller reference
    if (uiTree.startsWith('{{') && uiTree.endsWith('}}')) {
      const controllerName = uiTree.slice(2, -2).trim();
      return stateControllers[controllerName] ?? uiTree;
    }
    return uiTree;
  }

  const { type, props = {}, children } = uiTree;
  const Component = componentMap[type] || type;

  // Process props to handle event handlers and state values
  const processedProps = Object.entries(props).reduce((acc, [key, value]) => {
    acc[key] = handleEvent(value, stateControllers);
    return acc;
  }, {});

  // Recursively render children
  const processedChildren = Array.isArray(children)
    ? children.map(child => renderUITree(child, stateControllers))
    : renderUITree(children, stateControllers);

  return React.createElement(
    Component,
    processedProps,
    processedChildren
  );
};