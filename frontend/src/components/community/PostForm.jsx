import { useState } from "react";
import { IoChatbubbleOutline, IoArrowUpCircleOutline } from "react-icons/io5";
import "../../styles/Community.css";

const MAX_LENGTH = 500;

const PostForm = ({ onSubmit }) => {
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim() && content.length <= MAX_LENGTH) {
      onSubmit(content);
      setContent("");
      setIsExpanded(false);
    }
  };

  return (
    <form
      className={`post-form ${isExpanded ? "expanded" : ""}`}
      onSubmit={handleSubmit}
    >
      {!isExpanded ? (
        <div
          className="post-form-placeholder"
          onClick={() => setIsExpanded(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setIsExpanded(true)}
        >
          <IoChatbubbleOutline className="placeholder-icon" />
          <span>Start a discussion...</span>
        </div>
      ) : (
        <>
          <textarea
            placeholder="What's on your mind?"
            value={content}
            maxLength={MAX_LENGTH}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
            aria-label="Post content"
          />
          <div className="form-footer">
            <small className="char-count">
              {content.length}/{MAX_LENGTH}
            </small>
            <button
              type="submit"
              disabled={!content.trim()}
              className="submit-btn"
              aria-label="Submit post"
            >
              <IoArrowUpCircleOutline className="submit-icon" />
              Post
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default PostForm;  
