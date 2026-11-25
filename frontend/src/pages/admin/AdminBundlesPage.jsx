import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import styled from "styled-components";
import Header from "../../components/layout/Header.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h2 {
    font-size: 2rem;
    color: ${(props) => props.theme.text};
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${(props) => props.theme.inputBorder};
  background-color: unset;
  color: ${(props) => props.theme.text};
  border-radius: 8px;
  font-size: 1rem;
`;

const Textarea = styled.textarea`
  grid-column: span 3;
  min-height: 70px;
  padding: 0.75rem;
  background-color: unset;
  border: 1px solid ${(props) => props.theme.inputBorder};
  color: ${(props) => props.theme.text};
  border-radius: 8px;
  font-size: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem;
  background-color: ${(props) =>
    props.cancel ? props.theme.cancelBg : props.theme.buttonBg};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  grid-column: ${(props) => (props.cancel ? "span 2" : "initial")};

  &:hover {
    background-color: ${(props) =>
      props.cancel ? props.theme.cancelHover : props.theme.buttonHover};
  }
`;
const Card = styled.div`
  background-color: ${(props) => props.theme.card};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Actions = styled.div`
  margin-top: auto;
  padding-top: 1rem;
  display: flex;
  justify-content: space-between;

  button {
    padding: 0.5rem 1rem;
    background-color: var(--secondaryf);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--secondaryf);
    }

    &:last-child {
      background-color: #e74c3c;

      &:hover {
        background-color: #c0392b;
      }
    }
  }
`;
const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin: 2rem;
`;

const BundlesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
`;

const CourseList = styled.ul`
  padding-left: 1rem;

  li {
    margin-bottom: 0.25rem;

    .course-checkmark {
      color: #27ae60;
      margin-right: 0.5rem;
    }
  }
`;

const Pricing = styled.div`
  margin-top: 1rem;

  .price-original {
    color: #888;
    text-decoration: line-through;
  }

  .price-discounted {
    font-size: 1.25rem;
    color: #e67e22;
    font-weight: bold;
  }

  .price-savings {
    color: #27ae60;
    font-weight: 500;
    margin-top: 0.3rem;
  }
`;

const AdminBundlesPage = () => {
  const [bundles, setBundles] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    originalPrice: "",
    discountedPrice: "",
    courses: "",
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [filterName, setFilterName] = useState("");

  const fetchBundles = async () => {
    try {
      const response = await api.get("/Bundles");
      setBundles(response.data);
    } catch {
      toast.error("Error fetching bundles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBundles();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      parseFloat(formData.discountedPrice) > parseFloat(formData.originalPrice)
    ) {
      toast.error("Discounted price must be less than original price");
      return;
    }

    const payload = {
      BundleID: formData.id,
      Name: formData.name,
      // Prices are whole numbers in the database.
      OriginalPrice: Math.round(Number(formData.originalPrice)),
      DiscountedPrice: Math.round(Number(formData.discountedPrice)),
      Courses: formData.courses,
    };

    try {
      if (isEditing) {
        await api.put(`/Bundles/${formData.id}`, payload);
        toast.success("Bundle updated successfully");
      } else {
        await api.post("/Bundles", payload);
        toast.success("Bundle added successfully");
      }

      setFormData({
        id: null,
        name: "",
        originalPrice: "",
        discountedPrice: "",
        courses: "",
      });
      setIsEditing(false);
      fetchBundles();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save bundle"));
    }
  };

  const handleEdit = (bundle) => {
    setFormData({
      id: bundle.bundleID,
      name: bundle.name,
      originalPrice: bundle.originalPrice,
      discountedPrice: bundle.discountedPrice,
      courses: bundle.courses,
    });
    setIsEditing(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (bundle) => {
    if (window.confirm("Are you sure you want to delete this bundle?")) {
      try {
        await api.delete(`/Bundles/${bundle.bundleID}`);
        toast.success("Bundle deleted successfully");
        fetchBundles();
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to delete bundle"));
      }
    }
  };

  return (
    <div id="up">
      <Header />
      <ToastContainer />
      <HeaderSection>
        <h2> Manage Bundles</h2>

        <Form onSubmit={handleSubmit}>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Bundle Name"
            required
          />
          <Input
            name="originalPrice"
            type="number"
            value={formData.originalPrice}
            onChange={handleChange}
            placeholder="Original Price"
            required
            min="0"
            step="0.01"
          />
          <Input
            name="discountedPrice"
            type="number"
            value={formData.discountedPrice}
            onChange={handleChange}
            placeholder="Discounted Price"
            required
            min="0"
            step="0.01"
          />
          <Textarea
            name="courses"
            value={formData.courses}
            onChange={handleChange}
            placeholder="Course list (separate with ,)"
            required
          />
          <Button type="submit">
            {isEditing ? "Update Bundle" : "Add Bundle"}
          </Button>
          {isEditing && (
            <Button
              type="button"
              cancel
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  id: null,
                  name: "",
                  originalPrice: "",
                  discountedPrice: "",
                  courses: "",
                });
              }}
            >
              Cancel
            </Button>
          )}
        </Form>
      </HeaderSection>
      <div
        style={{
          margin: "1rem auto",
          maxWidth: "500px",
          display: "flex",
          gap: "10px",
        }}
      >
        <Input
          type="text"
          placeholder="🔍 Filter by bundle name..."
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          style={{
            flex: 1,
            paddingLeft: "2rem",
            backgroundImage: "none",
          }}
        />
        {filterName && (
          <Button
            onClick={() => setFilterName("")}
            style={{ padding: "0.5rem 1rem" }}
          >
            Clear
          </Button>
        )}
      </div>

      {loading ? (
        <p>Loading bundles...</p>
      ) : (
        <BundlesList>
          {bundles
            .filter((bundle) =>
              filterName
                ? bundle.name.toLowerCase().includes(filterName.toLowerCase())
                : true
            )
            .map((bundle) => (
              <Card key={bundle.bundleID}>
                <div>
                  <h3>{bundle.name}</h3>
                  <div>
                    <h4>Includes:</h4>
                    <CourseList>
                      {bundle.courses.split(",").map((course, i) => (
                        <li key={`${bundle.bundleID}-${i}`}>
                          <span className="course-checkmark">✓</span> {course}
                        </li>
                      ))}
                    </CourseList>
                  </div>
                  <Pricing>
                    <div className="price-original">
                      ${bundle.originalPrice.toFixed(2)}
                    </div>
                    <div className="price-discounted">
                      ${bundle.discountedPrice.toFixed(2)}
                    </div>
                    <div className="price-savings">
                      Save $
                      {(bundle.originalPrice - bundle.discountedPrice).toFixed(
                        2
                      )}
                    </div>
                  </Pricing>
                </div>
                <Actions>
                  <button onClick={() => handleEdit(bundle)}>Edit</button>
                  <button onClick={() => handleDelete(bundle)}>Delete</button>
                </Actions>
              </Card>
            ))}
          {bundles.filter((bundle) =>
            filterName
              ? bundle.name.toLowerCase().includes(filterName.toLowerCase())
              : true
          ).length === 0 && (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "2rem",
                color: "var(--text)",
              }}
            >
              {filterName
                ? `No bundles found matching "${filterName}"`
                : "No bundles available"}
            </div>
          )}
        </BundlesList>
      )}
    </div>
  );
};

export default AdminBundlesPage;
