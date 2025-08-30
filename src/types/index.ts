export interface User {
  id: string;
  fullName: string;
  username: string;
  profilePicture: string;
  bio?: string;
  followers: number;
  following: number;
  posts: number;
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  content: string;
  images?: string[];
  profilePicture: string;
  likes: number;
  comments: number;
  timestamp: string;
  liked: boolean;
}

export interface Story {
  id: string;
  userId: string;
  user: User;
  image: string;
  timestamp: string;
  viewed: boolean;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'tag';
  userId: string;
  user: User;
  postId?: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  user: User;
  lastMessage: string;
  timestamp: string;
  unread: number;
}