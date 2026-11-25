
export const BackButton = styled.div`
  position: absolute;
  top: 7px;
  left: 3px;
  z-index: 100;

  button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 3px;
    background: rgba(255, 255, 255, 0.81);
    color: #4a5568;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

    &:hover {
      background: white;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    svg {
      transition: transform 0.3s ease;
    }

    &:hover svg {
      transform: translateX(-3px);
    }
  }
`;




export const PasswordHint = styled.div`
  font-size: 12px;
  color: #95a5a6;
  margin-top: 4px;
`;

export const SaveNote = styled.div`
  font-size: 13px;
  color: #7f8c8d;
  text-align: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
`;


export const PurchaseTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;

  th,
  td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    font-weight: 500;
    color: #7f8c8d;
    font-size: 14px;
  }

  td {
    color: #2c3e50;
    vertical-align: middle;
  }

  @media (max-width: 768px) {
    display: block;
    overflow-x: auto;
  }
`;

export const PurchaseItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;



export const ItemTitle = styled.div`
  font-weight: 500;
  margin-bottom: 2px;
`;


export const StatusBadge = styled.div`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${(props) =>
    props.status === "completed" ? "#e3fcef" : "#f0f0f0"};
  color: ${(props) => (props.status === "completed" ? "#027a48" : "#7f8c8d")};
`;

export const TableButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  background: white;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
    border-color: #ccc;
  }
`;


import styled from "styled-components";

const colors = {
  primary: "#4361ee",
  secondary: "#3f3888",
  light: "#f8f9fa",
  dark: "#212529",
  success: "#4cc9f0",
  info: "#4895ef",
  warning: "#f72585",
  danger: "#7209b7",
  gray: "#6c757d",
  lightGray: "#e9ecef"
};

export const ProfileContainer = styled.div`
  display: flex;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
`;

export const HelpContent = styled.div``;
export const HelpIcon = styled.div`
  color: #3498db;
`;
export const ItemDesc = styled.div`
  font-size: 13px;
  color: #7f8c8d;
`;
export const ItemImage = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
`;
export const ItemInfo = styled.div``;




export const Sidebar = styled.div`
  width: 280px;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
  color: white;
  padding: 20px;
  // display: flex;
  flex-direction: column;
  min-height: 100vh;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
`;




export const UserSummary = styled.div`
  text-align: center;
  padding: 20px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

export const ProfileImage = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.2) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  color: white;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.3);
  }
`;

export const UserName = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
`;

export const UserEmail = styled.p`
  margin: 5px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
`;

export const Menu = styled.div`
  flex: 1;
`;

export const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${(props) => props.active ? "rgba(255,255,255,0.15)" : "transparent"};
  font-weight: ${(props) => (props.active ? "600" : "normal")};
  font-size=1px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    margin-right: 12px;
    opacity: ${(props) => (props.active ? "1" : "0.8")};
  }
`;

export const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  margin-top: auto;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  svg {
    margin-right: 10px;
  }
`;

export const MainContent = styled.div`
  flex: 1;
  padding: 30px;
`;

export const ProfileSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 25px;
  // margin-bottom: 25px;
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 20px;
    color: ${colors.dark};
  }
`;

export const SectionDescription = styled.p`
  color: ${colors.gray};
  font-size: 14px;
  margin: 5px 0 0;
`;

export const EditButton = styled.button`
  display: flex;
  align-items: center;
  padding: 8px 15px;
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${colors.secondary};
  }

  svg {
    margin-right: 6px;
  }
`;

export const SaveButton = styled(EditButton)`
  background: ${colors.success};

  &:hover {
    background: #3aa8d8;
  }
`;

export const ProfileDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
`;

export const DetailGroup = styled.div`
  margin-bottom: 15px;
`;

export const DetailLabel = styled.div`
  font-size: 18px;
  color: ${colors.gray};
  margin-bottom: 5px;
  font-weight: 500;
`;

export const DetailValue = styled.div`
  font-size: 16px;
  color: ${colors.dark};
  padding: 8px 0;
`;

export const EditInput = styled.input`
  width: 100%;
  padding: 10px 15px;
  border: 1px solid ${colors.lightGray};
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
  }
`;

export const SubscriptionCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 15px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
`;

export const SubscriptionInfo = styled.div`
  flex: 1;
`;

export const SubscriptionTitle = styled.h4`
  margin: 0 0 5px;
  color: ${colors.dark};
`;

export const SubscriptionDetails = styled.div`
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: ${colors.gray};
`;

export const SubscriptionAction = styled.div`
  display: flex;
  gap: 10px;
`;



export const PaymentCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 15px;
`;

export const PaymentMethod = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

export const PaymentIcon = styled.div`
  width: 40px;
  height: 25px;
  border-radius: 4px;
  background: ${colors.light};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
`;

export const PaymentDetails = styled.div``;

export const PaymentTitle = styled.div`
  font-weight: 500;
  margin-bottom: 2px;
`;

export const PaymentInfo = styled.div`
  font-size: 13px;
  color: ${colors.gray};
`;

export const AddPaymentButton = styled.button`
  width: 100%;
  padding: 15px;
  border: 2px dashed ${colors.lightGray};
  border-radius: 10px;
  background: white;
  color: ${colors.primary};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    border-color: ${colors.primary};
    background: ${colors.light};
  }
`;

export const HelpSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 30px;
`;

export const HelpCard = styled.div`
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

export const HelpTitle = styled.h4`
  margin: 0 0 10px;
  color: ${colors.dark};
`;

export const HelpText = styled.p`
  margin: 0 0 10px;
  color: ${colors.gray};
  font-size: 14px;
`;

export const HelpLink = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${colors.primary};
  font-size: 14px;
  font-weight: 500;
`;
// User Management Styles
export const UsersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

export const TableHeader = styled.th`
  padding: 15px;
  text-align: left;
  background-color: #f5f5f5;
  font-weight: 600;
  color: #333;
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid #eee;
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
  &:hover {
    background-color: #f1f1f1;
  }
  &:last-child {
    border-bottom: none;
  }
`;

export const TableCell = styled.td`
  padding: 15px;
  vertical-align: middle;
`;

export const UserImage = styled.div`
  display: inline-flex;
  align-items: center;
  margin-right: 10px;
  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }
  svg {
    width: 40px;
    height: 40px;
    padding: 8px;
    background: #eee;
    border-radius: 50%;
    color: #777;
  }
`;

export const SearchInput = styled.div`
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20px;
  padding: 8px 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  input {
    border: none;
    outline: none;
    margin-left: 10px;
    width: 200px;
    font-size: 14px;
  }
`;

export const ActionButton = styled.button`
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  transition: all 0.3s;
  background-color: ${(props) =>
    props.view ? "#2196F3" : props.delete ? "#f44336" : "#4CAF50"};
  color: white;
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  svg {
    margin-right: 5px;
  }
`;

export const StatusToggle = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  transition: all 0.3s;
  background-color: ${(props) => (props.active ? "#4CAF50" : "#f44336")};
  color: white;
  &:hover {
    opacity: 0.9;
  }
  svg {
    margin-right: 5px;
  }
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 5px;
`;

export const PaginationButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #ddd;
  background-color: ${(props) => (props.active ? "#2196F3" : "white")};
  color: ${(props) => (props.active ? "white" : "#333")};
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => (props.active ? "#2196F3" : "#f1f1f1")};
  }
`;