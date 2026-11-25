// TodoItem.jsx
import styled from "styled-components";
import { FaCheckCircle, FaTrash } from "react-icons/fa";

const TodoItem = ({ text, done, onToggle, onDelete, color }) => {
  return (
    <Item done={done} color={color}>
      <Left onClick={onToggle} done={done}>
        <FaCheckCircle
          size={20}
          style={{
            marginRight: "10px",
            color: done ? color : "#ccc",
            transition: "0.3s",
          }}
        />
        <span>{text}</span>
      </Left>
      <DeleteButton onClick={onDelete}>
        <FaTrash size={16} />
      </DeleteButton>
    </Item>
  );
};

export default TodoItem;

const Item = styled.div`
  animation: fadeIn 0.3s ease;
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  background: ${({ theme }) => theme.itemBg};
  padding: 1rem 1.2rem;
  border-radius: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.text};
  transition: all 0.2s ease;
  box-shadow: 0 0 12px ${({ color }) => color + "33"};

  &:hover {
    transform: scale(1.015);
    box-shadow: 0 0 16px ${({ color }) => color + "66"};
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  span {
    font-size: 1rem;
    text-decoration: ${({ done }) => (done ? "line-through" : "none")};
    color: ${({ done, theme }) => (done ? theme.secondaryText : theme.text)};
    transition: 0.2s ease;
  }
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.text};

  &:hover {
    color: #ef4444;
  }
`;
