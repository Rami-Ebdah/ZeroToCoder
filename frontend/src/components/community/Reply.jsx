import {
  IoPersonCircleOutline,
  IoTimeOutline,
  IoHeartOutline,
  IoHeart,
  IoFlagOutline,
  IoTrashOutline,
} from "react-icons/io5";
import "../../styles/Community.css";

const Reply = ({ reply, currentUserId, isAdmin, onLike, onReport, onDelete }) => {

  return (
    <div className="reply-card">
      <header className="reply-header">
        <IoPersonCircleOutline className="user-avatar" />
        <div className="reply-meta">
          <strong className="reply-author">{reply.author}</strong>
          <div className="reply-time">
            <IoTimeOutline />
            <span>{reply.timestamp}</span>
          </div>
        </div>
        {(isAdmin || String(currentUserId) === String(reply.userId)) && (
          <button
            className="reply-delete-btn"
            onClick={() => {
              onDelete();
            }}
            title=" delete reply"
          >
            <IoTrashOutline />
          </button>
        )}
      </header>
      <div className="reply-content">
        <p>{reply.content}</p>
      </div>
      <footer className="reply-actions">
        <button
          className={`like-btn ${reply.isLiked ? "liked" : ""}`}
          onClick={onLike}
        >
          {reply.isLiked ? <IoHeart /> : <IoHeartOutline />}
          <span>{reply.likesCount}</span>
        </button>

        <button className="report-btn" onClick={() => onReport()}>
          <IoFlagOutline />
        </button>
      </footer>
    </div>
  );
};

export default Reply;
