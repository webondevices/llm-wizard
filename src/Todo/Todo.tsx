import React, { useState } from 'react'; 
import { useLLMCommander } from './useLLMCommander';
import Modal from './Modal';
import { Card, List, Button, Input } from 'antd';

interface Todo {
  id: string;
  name: string;
  completed: boolean;
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
  toggleTodo: ActionConfig;
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
          name: todoName,
          completed: false
        }]),
        description: "Adds a new todo item to the list with the specified name"
      },
      setNewTodo: {
        fn: (text: string) => setNewTodo(text),
        description: "Updates the new todo input field with the provided text"
      },
      toggleTodo: {
        fn: (todoId: string) => setTodos(prev => 
          prev.map(todo => 
            todo.id === todoId 
              ? { ...todo, completed: !todo.completed }
              : todo
          )
        ),
        description: "Toggles the completion status of a todo item"
      },
    } as TodoActions,
  });

  const onUserAction = (userInput: string) => {
    handleInput(userInput);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="space-y-4">
        <List
          dataSource={todos}
          renderItem={(todo) => (
            <List.Item
              actions={[
                <Button
                  type={todo.completed ? "default" : "primary"}
                  onClick={() => handleInput(`toggle todo: ${todo.id}`)}
                >
                  {todo.completed ? 'Completed' : 'Mark Complete'}
                </Button>
              ]}
            >
              <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
                {todo.name}
              </span>
            </List.Item>
          )}
        />
        <Button 
          type="primary"
          onClick={() => onUserAction('open the modal')}
        >
          Add Todo
        </Button>
      </div>

      <Modal isOpen={modalOpen} onClose={() => onUserAction('close the modal')}>
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Add New Todo</h2>
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Enter your todo"
          />
          <Button
            type="primary"
            onClick={() => onUserAction(`add todo: ${newTodo}`)}
          >
            Add
          </Button>
        </div>
      </Modal>
    </Card>
  );
};

export default Todo;