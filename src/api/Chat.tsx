import axiosInstance from "../types/axiosInstance";

// 1. Get all conversations
export const getConversations = async () => {
  const res = await axiosInstance.get("/api/conversations");
  return res.data;
};

// 2. Open / Create direct chat
export const openDirectConversation = async (userId: number) => {
  const res = await axiosInstance.post(`/api/conversations/direct/${userId}`);
  return res.data;
};

// 3. Get messages
export const getMessages = async (convId: number, before?: number) => {
  const url = before
    ? `/api/conversations/${convId}/messages?before=${before}`
    : `/api/conversations/${convId}/messages`;

  const res = await axiosInstance.get(url);
  return res.data;
};

// 4. Mark as read
export const markAsRead = async (convId: number) => {
  await axiosInstance.post(`/api/conversations/${convId}/read`);
};

// 5. Search users
export const searchUsers = async (q: string) => {
  const res = await axiosInstance.get(`/api/chat/users/search?q=${q}`);
  return res.data;
};

// 6. Edit message
export const editMessage = async (id: number, content: string) => {
  const res = await axiosInstance.patch(`/api/messages/${id}`, { content });
  return res.data;
};

// 7. Delete message
export const deleteMessage = async (id: number) => {
  await axiosInstance.delete(`/api/messages/${id}`);
};