import api from "./client";

const BASE = "/Community/posts";

const mapReply = (reply) => ({
  id: reply.id,
  userId: reply.userId,
  author: reply.author,
  content: reply.content,
  timestamp: reply.timestamp,
  likesCount: reply.likes,
  isLiked: reply.isLiked,
});

const mapPost = (post) => ({
  id: post.id,
  userId: post.userId,
  author: post.author,
  content: post.content,
  timestamp: post.timestamp,
  likesCount: post.likes,
  isLiked: post.isLiked,
  replies: (post.replies ?? []).map(mapReply),
});

export const getPosts = async () => (await api.get(BASE)).data.map(mapPost);

export const createPost = async (content) => mapPost((await api.post(BASE, { content })).data);

export const deletePost = async (postId) => (await api.delete(`${BASE}/${postId}`)).data;

export const likePost = async (postId) => {
  const { data } = await api.post(`${BASE}/${postId}/like`);
  return { likesCount: data.likes, isLiked: data.isLiked };
};

export const reportPost = async (postId, reason = "Spam or inappropriate content") =>
  (await api.post(`${BASE}/${postId}/report`, { reason })).data;

export const createReply = async (postId, content) =>
  mapReply((await api.post(`${BASE}/${postId}/replies`, { content })).data);

export const deleteReply = async (postId, replyId) =>
  (await api.delete(`${BASE}/${postId}/replies/${replyId}`)).data;

export const likeReply = async (postId, replyId) => {
  // The API returns { likes, isLiked }; the old code read `likesCount`, so counts were always 0.
  const { data } = await api.post(`${BASE}/${postId}/replies/${replyId}/like`);
  return { likesCount: data.likes, isLiked: data.isLiked };
};

export const reportReply = async (postId, replyId, reason = "Inappropriate content") =>
  (await api.post(`${BASE}/${postId}/replies/${replyId}/report`, { reason })).data;
