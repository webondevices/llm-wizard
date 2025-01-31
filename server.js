import express from 'express';
import OpenAI from 'openai';

const app = express();
const port = 3001;

app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/llm-render', async (req, res) => {
  try {
    const { instructions, data, stateControllers } = req.body;    
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: 'You generat UI into Ant Design component structures for React. Generate valid JSON responses that follow this pattern: {"ui":{"type":"Layout","props":{},"children":[{"type":"Input","props":{"placeholder":"Enter a task","value":"{{taskName}}","onChange":"{{() => handleTaskNameChange("new name")}}"}},{"type":"Button","props":{"type":"primary","onClick":"{{addTask}}"},"children":"Add Task" }]}} Only return ant design components, no HTML elements. The user will provide the instructions, data, and available values and functions (state controllers). Add values and JS expressions between {{ }}. The JS expression inside the {{ }} will be added directly into onClick, etc. event handlers in the React attribute value so ALWAYS add them in () => {}.'
          },
          { role: "user", content: `Instructions: ${instructions}. Data provided: ${data}. State controllers (values and functions) available to be used: ${stateControllers}.` }
        ],
        response_format: {
          type: "json_object"
        }
      });
        

    res.json({ 
      response: completion.choices[0].message.content 
    });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ error: 'Failed to process the request' });
  }
});

app.post('/api/llm-render-tailwind', async (req, res) => {
  try {
    const { instructions, data, stateControllers } = req.body;    
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: 'You generate UI using HTML elements with Tailwind CSS classes for React. Generate valid JSON responses that follow this pattern: {"ui":{"type":"div","props":{"className":"p-4 bg-white"},"children":[{"type":"input","props":{"className":"border p-2 rounded","placeholder":"Enter text","value":"{{inputValue}}","onChange":"{{handleChange}}"}},{"type":"button","props":{"className":"bg-blue-500 text-white px-4 py-2 rounded","onClick":"{{handleClick}}"},"children":"Submit"}]}} The user will provide the instructions, data, and available values and functions (state controllers). Add values and JS expressions between {{ }}. The JS expression inside the {{ }} will be added directly into onClick, etc. event handlers in the React attribute value so ALWAYS add them in () => {}. Use semantic HTML elements and appropriate Tailwind CSS classes for styling.'
          },
          { role: "user", content: `Instructions: ${instructions}. Data provided: ${data}. State controllers (values and functions) available to be used: ${stateControllers}.` }
        ],
        response_format: {
          type: "json_object"
        }
      });
        
    res.json({ 
      response: completion.choices[0].message.content 
    });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ error: 'Failed to process the request' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
}); 