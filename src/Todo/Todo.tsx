import React, { useState } from 'react'; 
import { useLLMCommander } from './useLLMCommander';
import Modal from './Modal';

interface Todo {
  id: string;
  name: string;
}

export interface ActionConfig {
  fn: (...args: any[]) => void;
  description: string;
}

interface TodoActions {
  [key: string]: ActionConfig;
  openModal: ActionConfig;
  closeModal: ActionConfig;
  addTodo: ActionConfig;
  setNewTodo: ActionConfig;
}

const Todo = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');

  const { handleInput } = useLLMCommander({
    states: { modalOpen, todos, newTodo },
    actions: {
      openModal: {
        fn: () => setModalOpen(true),
        description: "Opens the modal dialog for adding a new todo item"
      },
      closeModal: {
        fn: () => setModalOpen(false),
        description: "Closes the modal dialog"
      },
      addTodo: {
        fn: (todoName: string) => setTodos(prev => [...prev, { 
          id: crypto.randomUUID(), 
          name: todoName 
        }]),
        description: "Adds a new todo item to the list with the specified name"
      },
      setNewTodo: {
        fn: (text: string) => setNewTodo(text),
        description: "Updates the new todo input field with the provided text"
      },
    } as TodoActions,
  });

  const onUserAction = (userInput: string) => {
    handleInput(userInput);
  };

  return (
    <div className="p-4">
      <div className="space-y-4">
        <button 
          onClick={() => onUserAction('open the modal')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Todo
        </button>

        <ul className="space-y-2">
          {todos.map((todo) => (
            <li key={todo.id} className="p-2 bg-gray-100 rounded">
              {todo.name}
            </li>
          ))}
        </ul>
      </div>

      <Modal isOpen={modalOpen} onClose={() => onUserAction('close the modal')}>
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Add New Todo</h2>
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Enter your todo"
          />
          <button
            onClick={() => onUserAction(`add todo: ${newTodo}`)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Todo;