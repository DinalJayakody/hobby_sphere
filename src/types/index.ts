export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string,
  bio: string,
  lat: string,
  lan: string,
  mainHobby: string,
  location: string,
  profilePicture: File | null,
  // posts: any[], // Adjust type based on your posts structure
  followersCount: number,
  followingCount: number,
  posts: number,
}

export interface Post {
  id: string;
  userId: string;
  user?: User;
  content: string;
  images?: string[];
  profilePicture: string;
  likes: number;
  comments: number;
  timestamp: string;
  currentUserLikeStatus: boolean;
  privacy: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
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
  username: string;
  avatarUrl?: string; // optional
};

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
  user: {
    id: string;
    fullName: string;
    profilePicture: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  currentUserLikeStatus: boolean;
  repliesCount?: number;
}

export interface Reply {
  id: string;
  commentId: string;
  user: {
    id: string;
    fullName: string;
    profilePicture: string;
  };
  content: string;
  createdAt: string;
}