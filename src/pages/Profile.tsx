import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Navbar from '../components/layout/Navbar';
import PostCard from '../components/home/PostCard';
import Button from '../components/ui/Button';
import cover from '../assets/cover.png';
import Chanuka from "../assets/Chanuka.jpg";
import Prashan from "../assets/Prashan.jpg";
import Dinal from "../assets/Dinal.jpg";
import Maniya from "../assets/Maniya.jpg";
import Kavindu from "../assets/Kavindu.jpg";
import Tharinda from "../assets/Tharinda.jpg";
import Prabs from "../assets/Prabs.jpg";
import { Grid, Bookmark, Settings, Image, MapPin, Tag, Link as LinkIcon, Heart, MessageCircle } from 'lucide-react';

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { posts } = useData();
  const [activeTab, setActiveTab] = useState('posts');

  // For follwing and followers pop up
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersList, setFollowersList] = useState<any[]>([
    {
      id: 1,
      fullName: "Tharinda Withanage",
      username: "tharinda_withanage",
      avatarUrl: Tharinda,
    },
    {
      id: 2,
      fullName: "Chanuka Nuwankalpa",
      username: "chanuka_nuwankalpa",
      avatarUrl: Chanuka,
    },
    {
      id: 3,
      fullName: "Prabuddha Rathnayaka",
      username: "prabuddha_rathnayaka",
      avatarUrl: Prabs,
    },
    {
      id: 4,
      fullName: "Prashan Thilakawardana",
      username: "prashan_thilakawaradana",
      avatarUrl: Prashan,
    },
    {
      id: 5,
      fullName: "Dinal Jayakody",
      username: "dinal_jayakody",
      avatarUrl: Dinal,
    },
    {
      id: 6,
      fullName: "Kavindu Rathnayaka",
      username: "kavindu_rathnayaka",
      avatarUrl: Kavindu,
    },
  ]);
  const [followingList, setFollowingList] = useState<any[]>([]);



  if (!currentUser) return null;

  // In a real app, you'd fetch the user profile based on the username
  // For now, we'll just use the current user
  const user = currentUser;
  const imageSrc = `data:image/png;base64,${user.profilePicture}`;
  // Filter posts by the current user
  const userPosts = posts.filter(post => String(post.userId) === String(user?.id));

  console.log('User posts:', userPosts);
  console.log('Post:', posts);
  // user.location = 'Gampaha';
  console.log('User hobby', user.mainHobby);
  return (
    <div className="min-h-screen bg-sky-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-16 pb-20 md:pt-20 md:pb-6">
        {/* Profile header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          {/* Cover photo */}
          {/* <img
            src={cover}
            className="h-48 w-auto object-cover rounded-xl"
          /> */}
          <div
            className="h-48 bg-gradient-to-r from-navy-500 to-sky-400" />
          {/* className="h-48 bg-gradient-to-r from-navy-500 to-sky-400"/> */}

          {/* Profile info */}
          <div className="px-6 py-4 flex flex-col md:flex-row">
            <div className="flex-shrink-0 -mt-16 md:-mt-20 mb-4 md:mb-0 z-10">
              <img
                // src='https://kristalle.com/wp-content/uploads/2020/07/dummy-profile-pic-1.jpg'
                src={imageSrc}
                // alt={user.name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white object-cover"
              />
            </div>

            <div className="flex-1 md:ml-6 md:mt-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold">{user.fullName}</h1>
                  <p className="text-gray-400 text-md font-bold">@{user.username}</p>
                </div>

                <div className="mt-3 md:mt-0 flex space-x-2">
                  <Button variant="primary" size="sm" onClick={() => navigate("/ProfileEdit")}>
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate("/Settings")}>
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <p className="text-gray-700 mb-4">
                <span className="font-bold">Bio:</span> {user.bio}
              </p>
              {/* <p className="text-gray-700 mb-4"> */}

              {/* {user.location ? `Location: ${user.location}` : ' '} */}
              <div className="flex gap-x-12 mb-4">
                <p className="text-gray-700">📍 {"Panadura"}</p>
                <p className="text-gray-700">🎯 {user.mainHobby || "Music"}</p>

              </div>

              <div className="flex flex-wrap justify-between mb-2">
                <div className="mr-6 mb-2">
                  <span className="font-semibold text-gray-900">{user.posts}</span>{' '}
                  <span className="text-gray-600">Posts</span>
                </div>
                {/* Followers Button */}
                <button
                  className="mr-6 mb-2 text-left"
                  onClick={() => setShowFollowers(true)}
                >
                  <span className="font-semibold text-gray-900">{user.followersCount ?? 0}</span>{" "}
                  <span className="text-gray-600">Followers</span>
                </button>

                {/* Following Button */}
                <button
                  className="mb-2 text-left"
                  onClick={() => setShowFollowing(true)}
                >
                  <span className="font-semibold text-gray-900">{user.followingCount ?? 0}</span>{" "}
                  <span className="text-gray-600">Following</span>
                </button>
              </div>
            </div>
          </div>

          {/* Profile tabs */}
          <div className="border-t border-gray-200">
            <div className="flex">
              <button
                className={`flex-1 py-3 font-medium text-sm flex items-center justify-center ${activeTab === 'posts'
                  ? 'text-navy-600 border-b-2 border-navy-600'
                  : 'text-gray-500'
                  }`}
                onClick={() => setActiveTab('posts')}
              >
                <Grid className="w-5 h-5 mr-1" />
                Posts
              </button>
              <button
                className={`flex-1 py-3 font-medium text-sm flex items-center justify-center ${activeTab === 'saved'
                  ? 'text-navy-600 border-b-2 border-navy-600'
                  : 'text-gray-500'
                  }`}
                onClick={() => setActiveTab('saved')}
              >
                <Bookmark className="w-5 h-5 mr-1" />
                Saved
              </button>
              <button
                className={`flex-1 py-3 font-medium text-sm flex items-center justify-center ${activeTab === 'tagged'
                  ? 'text-navy-600 border-b-2 border-navy-600'
                  : 'text-gray-500'
                  }`}
                onClick={() => setActiveTab('tagged')}
              >
                <Tag className="w-5 h-5 mr-1" />
                Tagged
              </button>
            </div>
          </div>
        </div>

        {/* Post grid (for desktop) or list (for mobile) */}
        {activeTab === 'posts' && (
          <>
            {/* Mobile view - post list */}
            <div className="md:hidden space-y-4">
              {userPosts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <Image className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
                  <p className="text-gray-500 mb-4">When you share posts, they'll appear here.</p>
                  <Button variant="primary">Create First Post</Button>
                </div>
              ) : (
                userPosts.map(post => <PostCard key={post.id} post={post} />)
              )}
            </div>

            {/* Desktop view - post grid */}
            <div className="hidden md:grid grid-cols-3 gap-1">
              {userPosts.length === 0 ? (
                <div className="col-span-3 bg-white rounded-lg shadow-sm p-8 text-center">
                  <Image className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
                  <p className="text-gray-500 mb-4">When you share posts, they'll appear here.</p>
                  <Button variant="primary">Create First Post</Button>
                </div>
              ) : (
                userPosts.map(post => (
                  <div key={post.id} className="aspect-square overflow-hidden bg-gray-100 relative group">
                    {post.images && post.images.length > 0 ? (
                      <img
                        src={
                          post.images && Array.isArray(post.images) && post.images.length > 0
                            ? `data:image/png;base64,${post.images}`
                            : undefined
                        }
                        alt="Post"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <p className="text-sm text-gray-500 p-4 text-center">{post.content}</p>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-4 text-white">
                        <div className="flex items-center">
                          <Heart className="w-6 h-6 mr-2" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="w-6 h-6 mr-2" />
                          <span>{post.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'saved' && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Bookmark className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No Saved Posts</h3>
            <p className="text-gray-500">When you save posts, they'll appear here.</p>
          </div>
        )}

        {activeTab === 'tagged' && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Tag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No Tagged Posts</h3>
            <p className="text-gray-500">When people tag you in posts, they'll appear here.</p>
          </div>
        )}

        {/* Followers Modal */}
        {showFollowers && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            onClick={() => setShowFollowers(false)}
          >
            <div
              className="bg-white rounded-lg w-80 max-h-[80vh] overflow-y-auto p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4 flex justify-between items-center">
                Followers
                <button
                  className="text-gray-500 text-xl font-bold"
                  onClick={() => setShowFollowers(false)}
                >
                  ×
                </button>
              </h3>
              {followersList.length === 0 ? (
                <p className="text-gray-500 text-center">No followers yet</p>
              ) : (
                followersList.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 mb-3 cursor-pointer hover:bg-sky-50 rounded-lg p-2"
                    onClick={() => navigate(`/FriendProfile/${user.id}`)}
                  >
                    <img
                      src={user.avatarUrl || "/default-avatar.png"}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{user.fullName || "No Name"}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Following Modal pop up box */}
        {showFollowing && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            onClick={() => setShowFollowing(false)}
          >
            <div
              className="bg-white rounded-lg w-80 max-h-[80vh] overflow-y-auto p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4 flex justify-between items-center">
                Following
                <button
                  className="text-gray-500 text-xl font-bold"
                  onClick={() => setShowFollowing(false)}
                >
                  ×
                </button>
              </h3>
              {followingList.length === 0 ? (
                <p className="text-gray-500 text-center">Not following anyone yet</p>
              ) : (
                followingList.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 mb-3 cursor-pointer hover:bg-sky-50 rounded-lg p-2"
                    onClick={() => navigate(`/FriendProfile/${user.id}`)}
                  >
                    <img
                      src={user.avatarUrl || "/default-avatar.png"}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{user.fullName || "No Name"}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;