import { User, Post, Story, Notification, Conversation } from '../types';

export const currentUser: User = {
  id: 'user-1',
  fullName: 'John Doe',
  username: 'johndoe',
  profilePicture: '',
  bio: 'Digital creator | Photography enthusiast | Travel lover',
  followers: 1243,
  following: 567,
  posts: 24
};

export const users: User[] = [
  currentUser,
  {
    id: 'user-2',
    fullName: 'Jane Smith',
    username: 'janesmith',
    profilePicture: 'https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg',
    bio: 'Artist | Designer | Coffee addict',
    followers: 2352,
    following: 341,
    posts: 65
  },
  {
    id: 'user-3',
    fullName: 'Robert Johnson',
    username: 'robert_j',
    profilePicture: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
    bio: 'Software Engineer | Tech Enthusiast',
    followers: 843,
    following: 267,
    posts: 32
  },
  {
    id: 'user-4',
    fullName: 'Emily Davis',
    username: 'emilyd',
    profilePicture: 'https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg',
    bio: 'Travel blogger | Adventure seeker',
    followers: 5243,
    following: 324,
    posts: 127
  },
  {
    id: 'user-5',
    fullName: 'Michael Wilson',
    username: 'mike_w',
    profilePicture: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
    bio: 'Photographer | Nature lover',
    followers: 1932,
    following: 512,
    posts: 89
  }
];

// Commented by DJ

export const posts: Post[] = [
  {
    id: 'post-1',
    userId: 'user-2',
    user: users[1],
    content: 'Just finished this new artwork. What do you think?',
    image: 'https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg',
    likes: 124,
    comments: 32,
    timestamp: '2023-04-12T14:30:00Z',
    liked: true
  },
  {
    id: 'post-2',
    userId: 'user-3',
    user: users[2],
    content: 'Beautiful sunset from my balcony tonight!',
    image: 'https://images.pexels.com/photos/2486168/pexels-photo-2486168.jpeg',
    likes: 89,
    comments: 14,
    timestamp: '2023-04-12T12:15:00Z',
    liked: false
  },
  {
    id: 'post-3',
    userId: 'user-4',
    user: users[3],
    content: 'Exploring the mountains this weekend. The view was breathtaking!',
    image: 'https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg',
    likes: 213,
    comments: 45,
    timestamp: '2023-04-11T16:45:00Z',
    liked: true
  },
  {
    id: 'post-4',
    userId: 'user-5',
    user: users[4],
    content: 'Captured this amazing shot during my morning walk.',
    image: 'https://images.pexels.com/photos/1480807/pexels-photo-1480807.jpeg',
    likes: 76,
    comments: 9,
    timestamp: '2023-04-11T08:20:00Z',
    liked: false
  },
  {
    id: 'post-5',
    userId: 'user-1',
    user: users[0],
    content: 'Working on an exciting new project. Stay tuned!',
    likes: 32,
    comments: 7,
    timestamp: '2023-04-10T19:30:00Z',
    liked: false
  }
];
// Commented by DJ
export const stories: Story[] = [
  {
    id: 'story-1',
    userId: 'user-2',
    user: users[1],
    image: 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg',
    timestamp: '2023-04-12T18:30:00Z',
    viewed: false
  },
  {
    id: 'story-2',
    userId: 'user-3',
    user: users[2],
    image: 'https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg',
    timestamp: '2023-04-12T17:45:00Z',
    viewed: false
  },
  {
    id: 'story-3',
    userId: 'user-4',
    user: users[3],
    image: 'https://images.pexels.com/photos/933054/pexels-photo-933054.jpeg',
    timestamp: '2023-04-12T16:30:00Z',
    viewed: true
  },
  {
    id: 'story-4',
    userId: 'user-5',
    user: users[4],
    image: 'https://images.pexels.com/photos/2832773/pexels-photo-2832773.jpeg',
    timestamp: '2023-04-12T15:15:00Z',
    viewed: true
  }
];

export const notifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'like',
    userId: 'user-2',
    user: users[1],
    postId: 'post-5',
    content: 'liked your post',
    timestamp: '2023-04-12T19:30:00Z',
    read: false
  },
  {
    id: 'notif-2',
    type: 'comment',
    userId: 'user-3',
    user: users[2],
    postId: 'post-5',
    content: 'commented on your post',
    timestamp: '2023-04-12T18:45:00Z',
    read: false
  },
  {
    id: 'notif-3',
    type: 'follow',
    userId: 'user-4',
    user: users[3],
    content: 'started following you',
    timestamp: '2023-04-12T15:20:00Z',
    read: true
  },
  {
    id: 'notif-4',
    type: 'mention',
    userId: 'user-5',
    user: users[4],
    postId: 'post-3',
    content: 'mentioned you in a comment',
    timestamp: '2023-04-11T14:30:00Z',
    read: true
  },
  {
    id: 'notif-5',
    type: 'like',
    userId: 'user-2',
    user: users[1],
    postId: 'post-5',
    content: 'liked your comment',
    timestamp: '2023-04-11T11:15:00Z',
    read: true
  }
];

export const conversations: Conversation[] = [
  {
    id: 'conv-1',
    userId: 'user-2',
    user: users[1],
    lastMessage: 'Hey! How are you doing?',
    timestamp: '2023-04-12T20:15:00Z',
    unread: 2
  },
  {
    id: 'conv-2',
    userId: 'user-3',
    user: users[2],
    lastMessage: 'Thanks for sharing that project. It looks amazing!',
    timestamp: '2023-04-12T16:30:00Z',
    unread: 0
  },
  {
    id: 'conv-3',
    userId: 'user-4',
    user: users[3],
    lastMessage: 'Let me know when you want to meet up',
    timestamp: '2023-04-11T19:45:00Z',
    unread: 0
  },
  {
    id: 'conv-4',
    userId: 'user-5',
    user: users[4],
    lastMessage: 'Did you see the latest photos I posted?',
    timestamp: '2023-04-10T21:30:00Z',
    unread: 0
  }
];

export const messages = {
  'conv-1': [
    {
      id: 'msg-1',
      senderId: 'user-2',
      receiverId: 'user-1',
      content: 'Hey! How are you doing?',
      timestamp: '2023-04-12T20:15:00Z',
      read: false
    },
    {
      id: 'msg-2',
      senderId: 'user-2',
      receiverId: 'user-1',
      content: 'I saw your latest post. Looks great!',
      timestamp: '2023-04-12T20:16:00Z',
      read: false
    }
  ],
  'conv-2': [
    {
      id: 'msg-3',
      senderId: 'user-1',
      receiverId: 'user-3',
      content: 'Hey Robert, check out this project I\'ve been working on',
      timestamp: '2023-04-12T16:25:00Z',
      read: true
    },
    {
      id: 'msg-4',
      senderId: 'user-3',
      receiverId: 'user-1',
      content: 'Thanks for sharing that project. It looks amazing!',
      timestamp: '2023-04-12T16:30:00Z',
      read: true
    }
  ]
};