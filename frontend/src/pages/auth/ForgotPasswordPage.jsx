import { useState } from "react";
import styled from "styled-components";

const ForgotPasswordContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const Form = styled.form`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  width: 300px;
`;

const Input = styled.input`
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Button = styled.button`
  background-color: blue;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    background-color: darkblue;
  }
`;

const Message = styled.p`
  color: green;
  font-size: 14px;
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    //API
    setMessage(
      "If the email is registered, a password reset link will be sent."
    );
  };

  return (
    <ForgotPasswordContainer>
      <Form onSubmit={handleSubmit}>
        <div style={{ color: "black" }}>
          <h2>Forgot Password</h2>
          <p>Enter your email to reset your password</p>
        </div>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit">Send Reset Link</Button>
        {message && <Message>{message}</Message>}
      </Form>
    </ForgotPasswordContainer>
  );
};

export default ForgotPassword;
