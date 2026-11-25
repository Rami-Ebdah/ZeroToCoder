import { useState, useEffect } from "react";
import api from "../../api/client";
import { ToastContainer, toast } from "react-toastify";
import Header from "../../components/layout/Header.jsx";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/AdminCoupons.css";

const CouponsAdminPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    description: "",
    validUntil: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    discountRange: [0, 100],
    searchTerm: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.get("/Coupons");
      setCoupons(response.data);
    } catch (error) {
      toast.error("Failed to load coupons. Please try again later.", {
        position: "top-center",
        autoClose: 5000,
      });
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.code.trim()) {
      toast.error("Coupon code is required", { position: "top-center" });
      return false;
    }
    if (!formData.discount || isNaN(formData.discount)) {
      toast.error("Please enter a valid discount percentage", {
        position: "top-center",
      });
      return false;
    }
    if (formData.discount < 1 || formData.discount > 100) {
      toast.error("Discount must be between 1% and 100%", {
        position: "top-center",
      });
      return false;
    }
    if (!formData.validUntil) {
      toast.error("Please select a valid date", { position: "top-center" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const couponData = {
        code: formData.code,
        discount: Number(formData.discount),
        description: formData.description,
        validUntil: formData.validUntil,
      };

      if (editingId) {
        await api.put(
          `/Coupons/${editingId}`,
          couponData
        );
        toast.success("Coupon updated successfully!", {
          position: "top-center",
          autoClose: 3000,
        });
      } else {
        await api.post("/Coupons", couponData);
        toast.success("Coupon added successfully!", {
          position: "top-center",
          autoClose: 3000,
        });
      }
      resetForm();
      await fetchCoupons();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.title ||
        "Operation failed. Please try again.";
      toast.error(errorMsg, {
        position: "top-center",
        autoClose: 5000,
      });
      console.error("Error submitting coupon:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (coupon) => {
    setFormData({
      code: coupon.code,
      discount: coupon.discount,
      description: coupon.description,
      validUntil: coupon.validUntil.split("T")[0],
    });
    setEditingId(coupon.couponID);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (couponID, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${code}"?`))
      return;

    try {
      await api.delete(
        `/Coupons/by-code?code=${encodeURIComponent(
          code
        )}`
      );
      toast.success(`Coupon "${code}" deleted successfully!`, {
        position: "top-center",
        autoClose: 3000,
      });
      await fetchCoupons();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Failed to delete coupon. Please try again.";
      toast.error(errorMsg, {
        position: "top-center",
        autoClose: 5000,
      });
      console.error("Error deleting coupon:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discount: "",
      description: "",
      validUntil: "",
    });
    setEditingId(null);
  };

  const filteredCoupons = coupons.filter(coupon => {
  const now = new Date();
  const validUntil = new Date(coupon.validUntil);
  const isActive = validUntil >= now;
  
  if (filters.status === 'active' && !isActive) return false;
  if (filters.status === 'expired' && isActive) return false;

  if (coupon.discount < filters.discountRange[0] || 
      coupon.discount > filters.discountRange[1]) {
    return false;
  }

  if (filters.searchTerm && 
      !coupon.code.toLowerCase().includes(filters.searchTerm.toLowerCase()) && 
      !coupon.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
    return false;
  }

  return true;
});

  return (
    <div id="up">
      <Header />
      <div className="admin-coupons-container">
        <ToastContainer />
        <h3 className="admin-coupons-title">Coupons Management</h3>

        <div className="admin-coupons-form-container">
          <h3>{editingId ? "Edit Coupon" : "Add New Coupon"}</h3>
          {editingId && <div className="editing-notice"></div>}
          <form onSubmit={handleSubmit} className="admin-coupons-form">
            <div className="form-group">
              <label>Coupon Code *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                placeholder="e.g. SUMMER20"
                maxLength="50"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label>Discount (%) *</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                required
                min="1"
                max="100"
                placeholder="e.g. 20"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label>Valid Until *</label>
              <input
                type="date"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split("T")[0]}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Coupon description"
                maxLength="255"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-actions">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="cancel-btn"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Processing..."
                  : editingId
                  ? "Update Coupon"
                  : "Add Coupon"}
              </button>
            </div>
          </form>
        </div>

        <div className="admin-coupons-list-container">
          <div className="search-info">Total Coupons: {coupons.length}</div>
          <div className="filters-container">
            <h4>Filter Coupons</h4>

            <div className="filter-group">
              <label>Status:</label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Discount Range:</label>
              <div className="range-inputs">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.discountRange[0]}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      discountRange: [
                        parseInt(e.target.value),
                        filters.discountRange[1],
                      ],
                    })
                  }
                />
                <span>to</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.discountRange[1]}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      discountRange: [
                        filters.discountRange[0],
                        parseInt(e.target.value),
                      ],
                    })
                  }
                />
                <span>%</span>
              </div>
            </div>

            <div className="filter-group">
              <label>Search:</label>
              <input
                type="text"
                placeholder="Search by code or description"
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters({ ...filters, searchTerm: e.target.value })
                }
              />
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            <table className="coupons-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Description</th>
                  <th>Valid Until</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.length > 0 ? (
                  filteredCoupons.map((coupon) => (
                    <tr key={coupon.couponID}>
                      <td>
                        <strong>{coupon.code}</strong>
                      </td>
                      <td>{coupon.discount}%</td>
                      <td>{coupon.description || "-"}</td>
                      <td>
                        {new Date(coupon.validUntil).toLocaleDateString()}
                      </td>
                      <td className="actions-cell">
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(coupon.couponID, coupon.code)
                          }
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-results">
                      {searchTerm
                        ? "No coupons match your search"
                        : "No coupons available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponsAdminPage;
