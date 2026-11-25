import { useState } from "react";
import Reply from "./Reply";
import {
  IoPersonCircleOutline,
  IoTimeOutline,
  IoChatbubbleOutline,
  IoArrowUpCircleOutline,
  IoHeartOutline,
  IoHeart,
  IoFlagOutline,
  IoTrashOutline,
} from "react-icons/io5";
import "../../styles/Community.css";

const MAX_REPLY_LENGTH = 500;

const Post = ({
  post,
  onReply,
  onLikeReply,
  onReportReply,
  onLikePost,
  onReportPost,
  onDeletePost,
  onDeleteReply,
  currentUserId,
  isAdmin,
}) => {
  const [replyContent, setReplyContent] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (replyContent.trim() && replyContent.length <= MAX_REPLY_LENGTH) {
      onReply(post.id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    }
  };

  return (
    <article className="post-card">
      <header className="post-header">
        <IoPersonCircleOutline className="user-avatar" />
        <div className="post-meta">
          <h3 className="post-author">{post.author}</h3>
          <div className="post-time">
            <IoTimeOutline />
            <span>{post.timestamp}</span>
          </div>
        </div>

        {(isAdmin || String(currentUserId) === String(post.userId)) && (
          <button
            className="post-delete-btn"
            onClick={() => onDeletePost(post.id)}
            title="Delete post"
          >
            <IoTrashOutline />
          </button>
        )}
      </header>

      <div className="post-content">
        <p>{post.content}</p>
      </div>

      <footer className="post-footer">
        <div className="post-actions">
          <button
            className={`like-btn ${post.isLiked ? "liked" : ""}`}
            onClick={() => onLikePost(post.id)}
          >
            {post.isLiked ? <IoHeart /> : <IoHeartOutline />}
            <span>{post.likesCount}</span>
          </button>

          <button
            className="reply-btn"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            <IoChatbubbleOutline />
            <span>{post.replies?.length || 0}</span>
          </button>

          <button className="report-btn" onClick={() => onReportPost(post.id)}>
            <IoFlagOutline />
          </button>
        </div>

        {showReplyForm && (
          <form className="reply-form" onSubmit={handleSubmitReply}>
            <textarea
              placeholder="Write your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              maxLength={MAX_REPLY_LENGTH}
            />
            <div className="form-actions">
              <small>
                {replyContent.length}/{MAX_REPLY_LENGTH}
              </small>
              <button type="submit" disabled={!replyContent.trim()}>
                <IoArrowUpCircleOutline />
                Post Reply
              </button>
            </div>
          </form>
        )}

        {post.replies?.length > 0 && (
          <div className="replies-list">
            {post.replies.map((reply) => (
              <Reply
                key={reply.id}
                reply={reply}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onLike={() => onLikeReply(reply.id)}
                onReport={() => onReportReply(reply.id)}
                onDelete={() => onDeleteReply(reply.id)}
              />
            ))}
          </div>
        )}
      </footer>
    </article>
  );
};

export default Post;
