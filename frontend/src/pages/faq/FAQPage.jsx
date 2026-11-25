import { useState, useEffect } from "react";
import api from "../../api/client";
import Header from "../../components/layout/Header";
import "../../styles/FAQSection.css";
import { MdQuestionAnswer } from "react-icons/md";
import { FiChevronDown } from "react-icons/fi";

const FAQSection = () => {
  const [faqs, setFaqs] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await api.get("/FAQs");
        setFaqs(response.data);
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const toggleFAQ = (faqid) => {
    setExpandedItems((prev) => ({
      ...prev,
      [faqid]: !prev[faqid],
    }));
  };

  const toggleAllFAQs = () => {
    const allExpanded = faqs.every((faq) => expandedItems[faq.faqid]);

    if (allExpanded) {
      const newExpandedItems = {};
      faqs.forEach((faq) => {
        newExpandedItems[faq.faqid] = false;
      });
      setExpandedItems(newExpandedItems);
    } else {
      const newExpandedItems = {};
      faqs.forEach((faq) => {
        newExpandedItems[faq.faqid] = true;
      });
      setExpandedItems(newExpandedItems);
    }
  };

  return (
    <div className="up">
      <Header />
      <section className="faq-section">
        <div className="faq-container">
          <div className="faq-header">
            <h2 className="faq-title">Frequently Asked Questions</h2>
            <button className="toggle-all-btn" onClick={toggleAllFAQs}>
              {faqs.every((faq) => expandedItems[faq.faqid])
                ? "Collapse All"
                : "Expand All"}
            </button>
          </div>

          {loading ? (
            <p>Loading FAQs...</p>
          ) : (
            <div className="faq-list">
              {faqs.map((faq) => (
                <div
                  key={faq.faqid}
                  className={`faq-item ${
                    expandedItems[faq.faqid] ? "active" : ""
                  }`}
                >
                  <div
                    className="faq-question"
                    onClick={() => toggleFAQ(faq.faqid)}
                    role="button"
                    tabIndex="0"
                    aria-expanded={expandedItems[faq.faqid] || false}
                    onKeyPress={(e) =>
                      e.key === "Enter" && toggleFAQ(faq.faqid)
                    }
                  >
                    {/* <h3 className="question-text">{faq.question}</h3>
                    <span className="toggle-icon">
                      {expandedItems[faq.faqid] ? "−" : "+"}
                    </span>
                  */}
                    <div className="question-icon">
                      <MdQuestionAnswer size={22} color="#5e60ce" />
                    </div>
                    <h3 className="question-text">{faq.question}</h3>
                    <div
                      className={`toggle-icon-wrapper ${
                        expandedItems[faq.faqid] ? "rotated" : ""
                      }`}
                    >
                      <FiChevronDown size={24} />
                    </div>
                  </div>

                  {expandedItems[faq.faqid] && (
                    <div className="faq-answer">
                      <div className="answer-content">
                        <p className="answer-text">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default FAQSection;
