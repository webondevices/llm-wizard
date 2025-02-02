import { useState } from 'react'
import { Layout } from "antd";

const { Header, Content, Footer } = Layout;
import './App.css'
import { LLMRenderer } from './LLMRenderer/LLMRenderer';
import { LLMTailwind } from './LLMTailwind/LLMTailwind';

import "tailwindcss/index.css";
import Todo from './Todo/Todo';

function App() {
  const [toggle, setToggle] = useState(false);
  
  const userData = {
    name: "John Doe",
    phone: "555-0123",
    funFact: "Claims to have taught their cat to bark"
  };

  return (
    <Layout style={{ width: "500px"}}>
      <Header style={{ color: "white", textAlign: "center" }}>LLM Component Experiment</Header>
      <Content style={{ padding: "20px" }}>
      {/* <LLMRenderer
        instructions="Create a card component in a nice pink shade, with a button that "
        data={{}}
        stateControllers={{state1, setState1, state2, setState2}} 
      /> */}
        {/* <LLMTailwind
          instructions="Build me a simple UI that displays the user's details in a nice card. Add a button so we can toggle large and small version."
          data={userData}
          stateControllers={{toggle, setToggle}}
        /> */}
        <Todo />
      </Content>
    </Layout> 
  )
}

export default App
