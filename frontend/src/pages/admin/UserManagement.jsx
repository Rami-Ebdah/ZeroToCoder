import { useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled from "styled-components";

// Styled Components
const Container = styled.div`
  padding: 1.5rem;
  max-width: 72rem;
  margin: 0 auto;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #1f2937;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
`;

const SearchContainer = styled.div`
  margin-bottom: 2rem;
`;

const SearchInput = styled.input`
  flex: 1;
  border: 1px solid #d1d5db;
  padding: 0.75rem;
  border-radius: 0.5rem;
  &:focus {
    outline: none;
    ring: 2px;
    ring-color: #3b82f6;
    border-color: #3b82f6;
  }
`;

const SearchButton = styled.button`
  background-color: #2563eb;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  &:hover {
    background-color: #1d4ed8;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
`;

const TableHeader = styled.thead`
  background-color: #f9fafb;
`;

const TableHeaderCell = styled.th`
  padding: 0.75rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgb(255, 255, 255);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableRow = styled.tr`
  &:hover {
    background-color: #f9fafb;
  }
`;

const TableCell = styled.td`
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  color: #374151;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 9999px;
  ${(props) =>
    props.$blocked
      ? "background-color: #fee2e2; color: #b91c1c;"
      : "background-color: #dcfce7; color: #166534;"}
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  color: white;
  ${(props) =>
    props.$blocked
      ? "background-color: #16a34a; &:hover { background-color: #15803d; }"
      : "background-color: #dc2626; &:hover { background-color: #b91c1c; }"}
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #fef2f2;
  border-left: 4px solid #ef4444;
  color: #b91c1c;
`;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!emailInput.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/Users/by-email/${encodeURIComponent(emailInput.trim())}`);
      setUsers([res.data]);
      toast.success("User found successfully");
    } catch {
      setUsers([]);
      setError("User not found.");
      toast.error("User not found");
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (userId, currentStatus) => {
    try {
      setLoading(true);
      const response = await api.put(`/Users/block/${userId}`, null, {
        params: { block: !currentStatus },
      });

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isBlocked: !currentStatus } : user
        )
      );

      toast.success(
        response.data.message ||
          `User ${!currentStatus ? "blocked" : "unblocked"} successfully`
      );
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Failed to update block status")
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <Container>
      <Title>User Management</Title>

      <SearchContainer>
        <div className="flex gap-3 items-center">
          <SearchInput
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Enter user email..."
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <SearchButton onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </SearchButton>
        </div>
      </SearchContainer>

      {loading && !users.length && (
        <div className="text-center py-8">Loading...</div>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {users.length > 0 && (
        <div className="overflow-hidden rounded-lg shadow-sm border border-gray-200">
          <Table>
            <TableHeader>
              <tr>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>Full Name</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </TableHeader>
            <tbody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <StatusBadge $blocked={user.isBlocked}>
                      {user.isBlocked ? "Blocked" : "Active"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <ActionButton
                      onClick={() => toggleBlock(user.id, user.isBlocked)}
                      disabled={loading}
                      $blocked={user.isBlocked}
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default UserManagement;
