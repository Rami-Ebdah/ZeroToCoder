import { useState, useEffect } from "react";
import api from "../../api/client";
import Header from "../../components/layout/Header";
import "../../styles/AdminFAQsPage.css";

const FAQAdminPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [newFAQ, setNewFAQ] = useState({ question: "", answer: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await api.get("/FAQs");
      setFaqs(response.data);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFAQ({ ...newFAQ, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/FAQs/${editingId}`, newFAQ);
        setEditingId(null);
      } else {
        await api.post("/FAQs", newFAQ);
      }
      setNewFAQ({ question: "", answer: "" });
      fetchFAQs();
    } catch (error) {
      console.error("Error saving FAQ:", error);
    }
  };

  const handleEdit = (faq) => {
    setNewFAQ({ question: faq.question, answer: faq.answer });
    setEditingId(faq.faqid);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/FAQs/${id}`);
      fetchFAQs();
    } catch (error) {
      console.error("Error deleting FAQ:", error);
    }
  };

  return (
    <div className="up">
      <Header />
      <div className="admin-container">
        <h2>FAQ Management</h2>
        <form onSubmit={handleSubmit} className="faq-form">
          <div className="form-group">
            <label>Question:</label>
            <input
              type="text"
              name="question"
              value={newFAQ.question}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Answer:</label>
            <textarea
              name="answer"
              value={newFAQ.answer}
              onChange={handleInputChange}
              required
            />
          </div>
          <button className="buttonQ" type="submit">
            {editingId ? "Update FAQ" : "Add FAQ"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setNewFAQ({ question: "", answer: "" });
              }}
            >
              Cancel
            </button>
          )}
        </form>

        <div className="faq-list">
          <table>
            <thead>
              <tr>
                <th>Question</th>
                <th>Answer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((faq) => (
                <tr key={faq.faqid}>
                  <td>{faq.question}</td>
                  <td>{faq.answer}</td>
                  <td>
                    <button onClick={() => handleEdit(faq)}>Edit</button>
                    <button onClick={() => handleDelete(faq.faqid)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FAQAdminPage;
