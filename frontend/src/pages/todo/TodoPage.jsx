import { useState, useEffect } from "react";
import styled from "styled-components";
import TodoItem from "../../components/todo/TodoItem";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Header from "../../components/layout/Header";

const colorPalette = ["#8b5cf6", "#3b82f6", "#06b6d4", "#10b981", "#ec4899"];
const getItemColor = (index) => colorPalette[index % colorPalette.length];

const TodoPage = () => {
  const [input, setInput] = useState("");
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const clickSound = new Audio("/sounds/click.mp3");

  const addTodo = () => {
    if (input.trim() === "") return;
    setTodos([...todos, { text: input, done: false }]);
    setInput("");
    clickSound.play();
  };

  const toggleTodo = (index) => {
    const newTodos = [...todos];
    newTodos[index].done = !newTodos[index].done;
    setTodos(newTodos);
    clickSound.play();
  };

  const deleteTodo = (index) => {
    const newTodos = todos.filter((_, i) => i !== index);
    setTodos(newTodos);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = [...todos];
    const [movedItem] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedItem);
    setTodos(reordered);
  };

  const completedCount = todos.filter((todo) => todo.done).length;

  return (
    <div id="up">
      <Header />
      <Wrapper>
        <Container>
          <Title>My To-Do List</Title>
          <Counter>
            {completedCount} / {todos.length} Tasks Completed
          </Counter>
          <InputWrapper>
            <Input
              type="text"
              placeholder="Add a new task..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
            />
            <AddButton onClick={addTodo}>Add</AddButton>
          </InputWrapper>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="todos">
              {(provided) => (
                <List ref={provided.innerRef} {...provided.droppableProps}>
                  {todos.map((todo, index) => (
                    <Draggable
                      key={index}
                      draggableId={`${index}`}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <TodoItem
                            text={todo.text}
                            done={todo.done}
                            onToggle={() => toggleTodo(index)}
                            onDelete={() => deleteTodo(index)}
                            color={getItemColor(index)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
        </Container>
      </Wrapper>
    </div>
  );
};

export default TodoPage;

const Wrapper = styled.div`
  padding: 0 1rem;
  min-height: 100vh;
  background: \${({ theme }) => theme.background};
  display: flex;
  justify-content: center;
  align-items: start;
`;

const Container = styled.div`
  width: 100%;
  max-width: 600px;
`;

const Title = styled.h2`
  text-align: center;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(90deg, #8b5cf6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Counter = styled.div`
  text-align: center;
  font-size: 1rem;
  color: \${({ theme }) => theme.text};
  margin-bottom: 1rem;
  font-weight: 500;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  font-size: 1rem;
  background: \${({ theme }) => theme.itemBg};
  color: \${({ theme }) => theme.text};
`;

const AddButton = styled.button`
  padding: 0 1.2rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  border: none;
  color: white;
  font-weight: 500;
  cursor: pointer;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
