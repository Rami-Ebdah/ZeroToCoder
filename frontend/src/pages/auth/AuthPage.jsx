import { useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import { useAuth } from "../../context/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  Container,
  SignUpContainer,
  SignInContainer,
  Form,
  Title,
  Input,
  Button,
  ForgotPasswordLink,
  SmallText,
  OverlayContainer,
  Overlay,
  LeftOverlayPanel,
  RightOverlayPanel,
  Paragraph,
  Anchor,
  InputWrapper,
  Icon,
  IconR,
  RememberForgot,
  CheckboxLabel,
  ErrorMessage,
} from "./AuthStyles";

const AuthForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const [isSignIn, setIsSignIn] = useState(location.pathname === "/login");
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { fullName: "", email: "", password: "" };

    if (!isSignIn && !formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const resetForm = () => {
    setFormData({ fullName: "", email: "", password: "" });
    setErrors({ fullName: "", email: "", password: "" });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const { data } = await api.post("/Users/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      const user = login(data.token, data.user);
      alert(`Login successful! Welcome back, ${user.fullName}`);
      resetForm();

      const from = location.state?.from;
      navigate(from && from !== "/login" ? from : user.role === "admin" ? "/" : "/my-learning", { replace: true });
    } catch (error) {
      alert(getErrorMessage(error, "Login failed. Please check your credentials."));
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await api.post("/Users/signup", {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      alert("Signup successful! Please log in to continue.");
      setIsSignIn(true);
      resetForm();
    } catch (error) {
      alert(getErrorMessage(error, "Signup failed. Please try again."));
    }
  };

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <Container>
        <SignUpContainer signinIn={isSignIn}>
          <Form onSubmit={handleSignUp}>
            <Title>Create Account</Title>

            <InputWrapper>
              <Icon>
                <FaUser />
              </Icon>
              <Input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </InputWrapper>
            {errors.fullName && <ErrorMessage>{errors.fullName}</ErrorMessage>}

            <InputWrapper>
              <Icon>
                <FaEnvelope />
              </Icon>
              <Input
                type="email"
                name="email"
                placeholder="example@domain.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </InputWrapper>
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}

            <InputWrapper>
              <Icon>
                <FaLock />
              </Icon>

              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <IconR onClick={() => setShowPassword((prev) => !prev)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </IconR>
            </InputWrapper>

            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}

            <CheckboxLabel>
              <input type="checkbox" required /> I agree to the terms and
              conditions
            </CheckboxLabel>

            <Button type="submit">Sign Up</Button>
            <SmallText>
              Already have an account?{" "}
              <Anchor href="#" onClick={() => setIsSignIn(true)}>
                Login
              </Anchor>
            </SmallText>
          </Form>
        </SignUpContainer>

        <SignInContainer signinIn={isSignIn}>
          <Form onSubmit={handleLogin}>
            <Title>Login</Title>

            <InputWrapper>
              <Icon>
                <FaEnvelope />
              </Icon>
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </InputWrapper>
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}

            <InputWrapper>
              <Icon>
                <FaLock />
              </Icon>

              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <IconR onClick={() => setShowPassword((prev) => !prev)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </IconR>
            </InputWrapper>
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}

            <RememberForgot>
              <CheckboxLabel>
                <input type="checkbox" /> Remember me
              </CheckboxLabel>
              <ForgotPasswordLink>
                <a href="/forgot-password">Forgot your password?</a>
              </ForgotPasswordLink>
            </RememberForgot>

            <Button type="submit">Login</Button>
            <SmallText>
              Don&apos;t have an account?{" "}
              <Anchor href="#" onClick={() => setIsSignIn(false)}>
                Sign Up
              </Anchor>
            </SmallText>
          </Form>
        </SignInContainer>

        <OverlayContainer signinIn={isSignIn}>
          <Overlay signinIn={isSignIn}>
            <LeftOverlayPanel signinIn={isSignIn}>
              <Title>Join Us!</Title>
              <Paragraph>Create your account and join us today.</Paragraph>
            </LeftOverlayPanel>

            <RightOverlayPanel signinIn={isSignIn}>
              <Title>Welcome Back!</Title>
              <Paragraph>Sign in to continue where you left off.</Paragraph>
            </RightOverlayPanel>
          </Overlay>
        </OverlayContainer>
      </Container>
    </div>
  );
};

export default AuthForm;
