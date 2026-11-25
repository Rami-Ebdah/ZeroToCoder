import { useState, useEffect } from "react";
import api, { getErrorMessage } from "../../api/client";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ProfileContainer,
  Sidebar,
  BackButton,
  UserSummary,
  ProfileImage,
  UserName,
  UserEmail,
  Menu,
  MenuItem,
  LogoutButton,
  MainContent,
  ProfileSection,
  SectionHeader,
  EditButton,
  SaveButton,
  ProfileDetails,
  DetailGroup,
  DetailLabel,
  DetailValue,
  EditInput,
  PasswordHint,
  SaveNote,
} from "../../styles/profileStyles.jsx";
import {
  FaUser,
  FaEdit,
  FaSave,
  FaUsersCog,
  FaChevronRight,
  FaArrowLeft,
} from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import UserManagement from "./UserManagement.jsx";

const PASSWORD_MASK = "********";

const AdminProfile = () => {
  const { logout, updateCurrentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    bio: "",
    dateOfBirth: "",
    expertise: "",
    image: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempUser, setTempUser] = useState({ ...user });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/Users/me");
        const profile = {
          fullName: data.fullName ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          address: data.address ?? "",
          password: PASSWORD_MASK,
          bio: data.bio ?? "",
          dateOfBirth: data.dateOfBirth?.split("T")[0] ?? "",
          expertise: data.expertise ?? "",
          image: data.image ?? "",
        };
        setUser(profile);
        setTempUser(profile);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to fetch profile"));
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = () => {
    setTempUser({ ...user });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await api.put("/Users/me", {
        fullName: tempUser.fullName,
        phone: tempUser.phone,
        address: tempUser.address,
        dateOfBirth: tempUser.dateOfBirth || null,
        expertise: tempUser.expertise,
        bio: tempUser.bio,
        image: tempUser.image,
        password: tempUser.password === PASSWORD_MASK ? undefined : tempUser.password,
      });

      setUser({ ...tempUser, password: PASSWORD_MASK });
      updateCurrentUser({ fullName: tempUser.fullName });
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update profile"));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    logout();
    toast("Logged out successfully", { type: "info" });
    navigate("/login");
  };

  return (
    <ProfileContainer>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <BackButton>
        <button onClick={() => navigate("/")}>
          <FaArrowLeft /> Back to Home
        </button>
      </BackButton>

      <Sidebar>
        <UserSummary>
          <ProfileImage>
            {isEditing ? (
              <div>
                {tempUser.image && (
                  <img
                    src={tempUser.image}
                    alt="Profile Preview"
                    style={{
                      width: "110px",
                      height: "110px",
                      borderRadius: "50%",
                      marginBottom: "10px",
                    }}
                  />
                )}
                <EditInput
                  type="text"
                  name="image"
                  placeholder="Enter image URL"
                  value={tempUser.image}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <div>
                {user.image ? (
                  <img
                    src={user.image}
                    alt="Profile"
                    style={{
                      width: "100px",
                      height: "110px",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  <FaUser size={100} />
                )}
              </div>
            )}
          </ProfileImage>
          <small style={{ color: "#ff5722" }}>Administrator</small>
          <UserName>{user.fullName}</UserName>
          <UserEmail>{user.email}</UserEmail>
        </UserSummary>
        <Menu>
          <MenuItem
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          >
            <FaUser /> Profile <FaChevronRight />
          </MenuItem>
          <MenuItem
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          >
            <FaUsersCog /> User Management
          </MenuItem>
        </Menu>

        <LogoutButton onClick={handleLogout}>
          <MdLogout /> Logout
        </LogoutButton>
      </Sidebar>

      <MainContent>
        {activeTab === "profile" && (
          <ProfileSection>
            <SectionHeader>
              <h2>Profile Information</h2>
              {isEditing ? (
                <SaveButton onClick={handleSave}>
                  <FaSave /> Save Changes
                </SaveButton>
              ) : (
                <EditButton onClick={handleEdit}>
                  <FaEdit /> Edit Profile
                </EditButton>
              )}
            </SectionHeader>

            <ProfileDetails>
              <DetailGroup>
                <DetailLabel>Full Name</DetailLabel>
                {isEditing ? (
                  <EditInput
                    type="text"
                    name="fullName"
                    value={tempUser.fullName}
                    onChange={handleChange}
                  />
                ) : (
                  <DetailValue>{user.fullName}</DetailValue>
                )}
              </DetailGroup>

              <DetailGroup>
                <DetailLabel>Email Address</DetailLabel>
                {isEditing ? (
                  <EditInput
                    type="email"
                    name="email"
                    value={tempUser.email}
                    onChange={handleChange}
                  />
                ) : (
                  <DetailValue>{user.email}</DetailValue>
                )}
              </DetailGroup>

              <DetailGroup>
                <DetailLabel>Phone Number</DetailLabel>
                {isEditing ? (
                  <EditInput
                    type="tel"
                    name="phone"
                    value={tempUser.phone}
                    onChange={handleChange}
                  />
                ) : (
                  <DetailValue>{user.phone}</DetailValue>
                )}
              </DetailGroup>

              <DetailGroup>
                <DetailLabel>Address</DetailLabel>
                {isEditing ? (
                  <EditInput
                    type="text"
                    name="address"
                    value={tempUser.address}
                    onChange={handleChange}
                  />
                ) : (
                  <DetailValue>{user.address}</DetailValue>
                )}
              </DetailGroup>

              <DetailGroup>
                <DetailLabel>Date of Birth</DetailLabel>
                {isEditing ? (
                  <EditInput
                    type="date"
                    name="dateOfBirth"
                    value={tempUser.dateOfBirth}
                    onChange={handleChange}
                  />
                ) : (
                  <DetailValue>{user.dateOfBirth}</DetailValue>
                )}
              </DetailGroup>

              <DetailGroup>
                <DetailLabel>Expertise</DetailLabel>
                {isEditing ? (
                  <EditInput
                    type="text"
                    name="expertise"
                    value={tempUser.expertise}
                    onChange={handleChange}
                  />
                ) : (
                  <DetailValue>{user.expertise}</DetailValue>
                )}
              </DetailGroup>

              <DetailGroup style={{ flexDirection: "column" }}>
                <DetailLabel>Bio</DetailLabel>
                {isEditing ? (
                  <EditInput
                    as="textarea"
                    rows="4"
                    name="bio"
                    value={tempUser.bio}
                    onChange={handleChange}
                    style={{ resize: "vertical", minHeight: "100px" }}
                  />
                ) : (
                  <DetailValue>{user.bio}</DetailValue>
                )}
              </DetailGroup>

              <DetailGroup>
                <DetailLabel>Password</DetailLabel>
                {isEditing ? (
                  <EditInput
                    type="password"
                    name="password"
                    value={tempUser.password}
                    onChange={handleChange}
                  />
                ) : (
                  <DetailValue>{user.password}</DetailValue>
                )}
                {!isEditing && (
                  <PasswordHint>Last updated 3 months ago</PasswordHint>
                )}
              </DetailGroup>
            </ProfileDetails>

            {isEditing && (
              <SaveNote>All changes will be saved to your profile</SaveNote>
            )}
          </ProfileSection>
        )}

        {activeTab === "users" && <UserManagement />}
      </MainContent>
    </ProfileContainer>
  );
};

export default AdminProfile;
