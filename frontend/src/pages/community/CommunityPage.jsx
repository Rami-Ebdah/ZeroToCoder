import { useEffect, useState } from "react";
import Header from "../../components/layout/Header";
import { useAuth } from "../../context/useAuth";
import { getErrorMessage } from "../../api/client";

import "../../styles/Community.css";
import Post from "../../components/community/Post";
import PostForm from "../../components/community/PostForm";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoChatbubbleOutline } from "react-icons/io5";
import {
  getPosts,
  createPost,
  createReply,
  likeReply,
  reportReply,
  reportPost,
  likePost,
  deletePost,
  deleteReply,
} from "../../api/communityApi";

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser, userRole } = useAuth();
  const canDelete = (ownerId) => userRole === "admin" || ownerId === currentUser?.id;
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const postsData = await getPosts();
      setPosts(postsData);
    } catch {
      toast.error("Failed to load posts");
    } finally {
      setIsLoading(false);
    }
  };

  // Update handleLikePost
  const handleLikePost = async (postId) => {
    try {
      const { likesCount, isLiked } = await likePost(postId);
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likesCount,
                isLiked,
              }
            : post
        )
      );
    } catch {
      toast.error("Failed to like post");
    }
  };

  const handleLikeReply = async (postId, replyId) => {
    try {
      const { likesCount, isLiked } = await likeReply(postId, replyId);

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const updatedReplies = post.replies.map((reply) => {
              if (reply.id === replyId) {
                return { ...reply, likesCount, isLiked };
              }

              return reply;
            });
            return { ...post, replies: updatedReplies };
          }
          return post;
        })
      );
    } catch {
      toast.error("Failed to like reply");
    }
  };

  const handleReportReply = async (postId, replyId) => {
    try {
      const reason = window.prompt(
        "Please enter the reason for reporting this reply:",
        "Inappropriate content"
      );

      if (reason === null) return;

      await reportReply(postId, replyId, reason);
      toast.success("Reply reported successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to report reply"));
    }
  };

  const handleReportPost = async (postId) => {
    const reason = prompt(
      "Enter report reason:",
      "Spam or inappropriate content"
    );
    if (!reason) return; // Cancel if no reason is entered

    try {
      await reportPost(postId, reason);
      toast.success("Post reported successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to report post"));
    }
  };

  const handleAddPost = async (content) => {
    try {
      setIsLoading(true);
      const newPost = await createPost(content);
      setPosts([newPost, ...posts]);
      toast.success("Post created successfully");
    } catch {
      toast.error("Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReply = async (postId, content) => {
    try {
      setIsLoading(true);
      const newReply = await createReply(postId, content);
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? { ...post, replies: [...post.replies, newReply] }
            : post
        )
      );
    } catch {
      toast.error("Failed to create reply");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    const postToDelete = posts.find((post) => post.id === postId);

    if (!postToDelete) {
      toast.error("Post not found");
      return;
    }

    if (!canDelete(postToDelete.userId)) {
      toast.error("You are not authorized to delete this post");
      return;
    }

    try {
      await deletePost(postId); 
      setPosts(posts.filter((post) => post.id !== postId));
      toast.success("Post deleted successfully");
    } catch (error) {
      toast.error("Failed to delete Post");
      console.error("Delete error:", error);
    }
  };

  const handleDeleteReply = async (postId, replyId) => {
    const postToDeleteReply = posts.find((post) => post.id === postId);
    const replyToDelete = postToDeleteReply?.replies.find(
      (reply) => reply.id === replyId
    );

    if (!replyToDelete) {
      toast.error("Reply not found");
      return;
    }

    if (!canDelete(replyToDelete.userId)) {
      toast.error("You are not authorized to delete this reply");
      return;
    }

    try {
      await deleteReply(postId, replyId); 
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const updatedReplies = post.replies.filter((r) => r.id !== replyId);
            return { ...post, replies: updatedReplies };
          }
          return post;
        })
      );
      toast.success("Reply deleted successfully");
    } catch (error) {
      toast.error("Failed to delete reply");
      console.error("Delete reply error:", error);
    }
  };


  return (
    <div className="community-page">
      <Header />
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="community-container">
        <div className="community-header">
          <h1>
            <IoChatbubbleOutline className="header-icon" />
            Community Forum
          </h1>
          <p className="community-subtitle">
            Share your thoughts and connect with others
          </p>
        </div>

        <PostForm onSubmit={handleAddPost} />

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading discussions...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <IoChatbubbleOutline className="empty-icon" />
            <p>No posts yet. Be the first to start a discussion!</p>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map((post) => (
              <Post
                key={post.id}
                post={post}
                currentUserId={currentUser?.id}
                isAdmin={userRole === "admin"}
                onReply={handleAddReply}
                onLikeReply={(replyId) => handleLikeReply(post.id, replyId)}
                onReportReply={(replyId) => handleReportReply(post.id, replyId)}
                onDeleteReply={(replyId) => handleDeleteReply(post.id, replyId)}
                onLikePost={() => handleLikePost(post.id)}
                onReportPost={() => handleReportPost(post.id)}
                onDeletePost={() => handleDeletePost(post.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
