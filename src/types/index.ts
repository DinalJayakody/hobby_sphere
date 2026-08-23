export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  bio: string;
  mainHobby: string;
  location: string;
  profilePicture: string | null;
  followersCount: number;
  followingCount: number;
  following?: boolean;
  active?: boolean;
  createdAt?: string;
}

export interface Post {
  id: string;
  userId: string;
  user?: {
    id: string;
    fullName: string;
    username?: string;
    profilePicture: string;
  };
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  currentUserLikeStatus: boolean;
  privacy: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  profilePictureUrl: string | null;
  mediaUrl: string;
  caption?: string;
  storyType?: string;
  timestamp: string;
  expiresAt?: string;
}

export type NotificationType =
  | 'FOLLOW'
  | 'LIKE'
  | 'COMMENT'
  | 'REPLY'
  | 'MENTION'
  | 'MESSAGE'
  | 'POST_LIKED'
  | 'POST_COMMENTED'
  | 'FOLLOWER_POST';

export interface Notification {
  id: string;
  recipientId: string;
  actorId: string;
  actorName: string;
  actorProfilePicture: string | null;
  type: NotificationType;
  message: string;
  relatedId?: string;
  relatedType?: string;
  read: boolean;
  timestamp: string;
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

export interface Group {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  membersCount: number;
  privacy: 'PUBLIC' | 'PRIVATE';
  joined: boolean;
}

export interface Follower {
  id: number;
  fullName: string;
  username?: string;
  avatarUrl?: string;
}

export interface SavedPost {
  id: number;
  userId: number;
  content: string;
  imageUrls: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  parentCommentId?: string | null;
  username?: string;
  fullName?: string;
  profilePictureUrl?: string | null;
  content: string;
  createdAt: string;
}

export interface Reply extends Comment {}
