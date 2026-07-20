import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Navbar from '../components/layout/Navbar';
import PostCard from '../components/home/PostCard';
import Button from '../components/ui/Button';
import axiosInstance from "../types/axiosInstance";

import {
  Grid, Bookmark, Settings, Image, Tag,
  Heart, MessageCircle
} from 'lucide-react';

import { Post } from '../types';
import SavedPostModal from '../components/modals/SavedPostModal';
import SavedPostCard from '../components/profile/SavedPostCard';
import FollowersModal from "../components/modals/FollowersModal";
import FollowingModal from "../components/modals/FollowingModal";
import PostFeedModal from "../components/modals/FeedPage";
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import FeedPage from '../components/modals/FeedPage';

const Profile: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: routeUserId } = useParams(); // <-- added: route param if viewing another profile
  const { fetchFollowers } = useData();

  const [activeTab, setActiveTab] = useState('posts');
  const [userPosts, setUserPosts] = useState<Post[]>([]);

  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
   const [followersCount, setFollowersCount] = useState<number>(currentUser?.followersCount ?? 0);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [showFeed, setShowFeed] = useState(false);

  // Saved posts
  const [selectedPost, setSelectedPost] = useState<any>(null);

  // Saved Posts componenets
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [savedPage, setSavedPage] = useState(0);
  const [savedHasMore, setSavedHasMore] = useState(true);
  const [savedLoading, setSavedLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);


  if (!currentUser) return null;
  const user = currentUser;
  const imageSrc = `data:image/png;base64,${user.profilePicture}`;


  // ================= FETCH POSTS =================
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const res = await axiosInstance.get(`/api/post/user/${user.id}`);
        const formatted = res.data.content.map((p: any) => ({
          id: p.id.toString(),
          userId: p.userId.toString(),
          user: {
            id: p.userId,
            fullName: p.fullName,
            profilePicture: p.profilePictureUrl,
          },
          content: p.content,
          images: p.imageUrls || [],
          likes: p.likesCount,
          comments: p.commentsCount,
          timestamp: p.createdAt,
        }));
        setUserPosts(formatted);
      } catch (e) {
        console.error(e);
      }
    };
    fetchUserPosts();
  }, []);


  // ================= FETCH SAVED POSTS =================
  const fetchSavedPosts = async (page: number) => {
    if (!user?.id || savedLoading || !savedHasMore) return;

    try {
      setSavedLoading(true);

      const res = await axiosInstance.get(
        `/api/savePost/${user.id}?page=${page}&size=10`
      );
      const content = res.data.content.map((p: any) => ({
        id: p.id.toString(),
        userId: p.userId.toString(),
        user: {
          id: p.userId,
          fullName: p.fullName,
          profilePicture: p.profilePictureUrl,
        },
        content: p.content,
        images: p.imageUrls || [],
        likes: p.likesCount,
        comments: p.commentsCount,
        timestamp: p.createdAt,
      }));
      // const content = res.data.content ?? [];

      console.log("RAW API:", content);

      const posts: Post[] = content
        .map((item: any) => item?.post ?? item) // fallback if no nested post
        .filter((post: any) => post && post.id);

      setSavedPosts((prev) => {
        const newPosts = posts.filter(
          (p) => !prev.some((existing) => existing.id === p.id)
        );
        console.log("Saved Posts:", savedPosts);
        return [...prev, ...newPosts];
      });

      if (posts.length < 10) {
        setSavedHasMore(false);
      }
    } catch (err) {
      console.error("Failed to fetch saved posts", err);
    } finally {
      setSavedLoading(false);
    }
  };

  // Scroll to selected post in feed when feed opens
  useEffect(() => {
    if (showFeed) {
      setTimeout(() => {
        const el = document.getElementById(`post-${selectedIndex}`);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [showFeed]);

  // Refetch saved posts when page changes or tab changes
  useEffect(() => {
    if (activeTab === "saved") {
      fetchSavedPosts(savedPage);
    }
  }, [savedPage, activeTab]);

  // Listen to URL changes to switch tabs
  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab === "saved") {
      setActiveTab("saved");
    } else {
      setActiveTab("posts");
    }
  }, [searchParams]);

  // Reset saved posts when leaving tab
  useEffect(() => {
    if (activeTab === "saved") {
      setSavedPosts([]);
      setSavedPage(0);
      setSavedHasMore(true);
    }
  }, [activeTab]);

  // Infinite scroll handler for saved posts
  const loadMoreSaved = useCallback(() => {
    if (!savedLoading && savedHasMore) {
      setSavedPage((prev) => prev + 1);
    }
  }, [savedLoading, savedHasMore]);

  // Attach infinite scroll observer to the bottom div
  const savedObserverRef = useInfiniteScroll({
    loading: savedLoading,
    hasMore: savedHasMore,
    onLoadMore: loadMoreSaved,
  });



  // ================= FETCH FOLLOWERS =================
   const loadFollowers = async () => {
    const targetId = routeUserId ?? user?.id;
    if (!targetId) {
      console.error("No user id available for loading followers");
      return;
    }

    try {
      const res = await axiosInstance.get(`/api/users/followers`);
      const data = res?.data;

      // Normalize different possible response shapes into an array
      let list: any[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.content)) {
        list = data.content;
      } else if (Array.isArray(data?.followers)) {
        list = data.followers;
      } else if (data && typeof data === "object" && (data.id || data.userId || data.username)) {
        // single follower object returned
        list = [data];
      } else {
        list = [];
      }

      // Map to the Follower shape expected by the modal
      const normalized = list.map((item: any) => ({
        id: item.id ?? item.userId ?? item._id ?? "",
        avatarUrl:
          item.profilePictureUrl ??
          item.profilePicture ??
          item.avatarUrl ??
          item.avatar ??
          null,
        fullName: item.fullName ?? item.name ?? item.full_name ?? "Unknown",
        username: item.username ?? item.handle ?? item.userName ?? "",
      }));

      setFollowersList(normalized);
      setFollowersCount(Array.isArray(normalized) ? normalized.length : 0);
      setShowFollowers(true);

      console.log("Fetched followers:", followersList);

      console.debug("Normalized followers:", normalized, "raw:", res.data);
    } catch (err) {
      console.error("Failed to load followers:", err);
      // Friendly UI feedback
      alert("Unable to load followers. See console for details.");
    }
  };

  // Unfollow handler passed to FollowersModal
  const handleUnfollow = async (follower: any) => {
    try {
      // adjust endpoint to your backend (example: DELETE follower)
      await axiosInstance.delete(`/api/users/${user.id}/followers/${follower.id}`);
      // update local list and count
      setFollowersList((prev) => prev.filter((f) => f.id !== follower.id));
      setFollowersCount((c) => Math.max(0, c - 1));
      // optionally refresh user/auth context here to keep global counts consistent
    } catch (err) {
      console.error("Failed to unfollow:", err);
      throw err; // rethrow so modal's optimistic rollback works if implemented
    }
  };

  const loadFollowing = async () => {
    try {
      const res = await axiosInstance.get(`/api/users/${user.id}/following`);
      setFollowingList(res.data);
      setShowFollowing(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-16 pb-20">

        {/* ================= HEADER ================= */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">

          <div className="h-40 bg-gradient-to-r from-indigo-500 to-sky-400" />

          <div className="px-6 py-4 flex flex-col md:flex-row">

            <img
              src={imageSrc}
              className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white -mt-16 object-cover shadow-lg"
            />

            <div className="flex-1 md:ml-6">

              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-bold">{user.fullName}</h1>
                  <p className="text-gray-400">@{user.username}</p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={() => navigate("/ProfileEdit")}>
                    Edit Profile
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <p className="text-gray-700 mb-4">
                <span className="font-bold">Bio:</span> {user.bio}
              </p>


              <div className="flex gap-x-12 mb-4">
                <p className="text-gray-700">📍 {user.location || ""}</p>
                <p className="text-gray-700">🎯 {user.mainHobby || ""}</p>
              </div>


              {/* COUNTS */}
              <div className="flex gap-6 mt-3 text-sm">

                <div>
                  <b>{userPosts.length}</b> Posts
                </div>

                {/* Followers Button */}
                <button
                  className="mr-6 mb-2 text-left"
                  onClick={loadFollowers}
                >
                  <span className="font-semibold text-gray-900">{followersCount}</span>{" "}
                  <span className="text-gray-600">Followers</span>
                </button>
                {/* Following Button */}
                <button
                  className="mb-2 text-left"
                  onClick={loadFollowing}
                >
                  <span className="font-semibold text-gray-900">{user.followingCount ?? 0}</span>{" "}
                  <span className="text-gray-600">Following</span>
                </button>


              </div>

            </div>
          </div>

          {/* ================= TABS ================= */}
          <div className="border-t flex">
            {['posts', 'saved', 'tagged'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium ${activeTab === tab
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-400'
                  }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* ================= POSTS GRID ================= */}
        {activeTab === 'posts' && (
          <div className="grid grid-cols-3 gap-1">
            {userPosts.map((post, index) => (
              <div
                key={post.id}
                onClick={() => {
                  setFeedPosts(userPosts);
                  setSelectedIndex(index);
                  setShowFeed(true);
                }}
                className="aspect-square bg-gray-100 relative cursor-pointer group"
              >
                <img
                  src={
                    post.images?.[0]
                      ? `data:image/png;base64,${post.images[0]}`
                      : "/no-image.png"
                  }
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex justify-center items-center gap-4 text-white">
                  <div className="flex items-center">
                    <Heart className="w-5 mr-1" />
                    {post.likes}
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="w-5 mr-1" />
                    {post.comments}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= SAVED ================= */}
        {activeTab === 'saved' && (
          <div className="grid grid-cols-3 gap-1">
            {savedPosts.map((post, index) => (
              <div
                key={post.id}
                onClick={() => {
                  setFeedPosts(savedPosts);
                  setSelectedIndex(index);
                  setShowFeed(true);
                }}
                className="aspect-square bg-gray-100 relative cursor-pointer group"
              >
                <img
                  src={`data:image/png;base64,${post.images?.[0]}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex justify-center items-center gap-4 text-white">
                  <div className="flex items-center">
                    <Heart className="w-5 mr-1" />
                    {post.likes}
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="w-5 mr-1" />
                    {post.comments}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= MODALS ================= */}

        {/* Saved post modal */}
        {/* {selectedPost && (
  <SavedPostModal
    post={selectedPost}
    onClose={() => setSelectedPost(null)}
  />
)} */}



        {showFollowers && (
          <FollowersModal
            followers={followersList}
            onClose={() => setShowFollowers(false)}
            onUnfollow={handleUnfollow}
          />
        )}

        {showFollowing && (
          <FollowingModal
            users={followingList}
            onClose={() => setShowFollowing(false)} open={false} />
        )}

        {showFeed && (
  <FeedPage
    posts={feedPosts}
    startIndex={selectedIndex}
    onClose={() => setShowFeed(false)}
    title={activeTab === "saved" ? "Saved Posts" : "Posts"}
  />
)}

        {/* {showPostFeed && (
          <PostFeedModal
            posts={userPosts}
            startIndex={selectedIndex}
            onClose={() => setShowPostFeed(false)}
          />
        )}

          {showSavedPostFeed && (
          <PostFeedModal
            posts={savedPosts}
            startIndex={selectedIndex}
            onClose={() => setShowSavedPostFeed(false)}
          />
        )}

        {selectedPost && (
          <SavedPostModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
          />
        )} */}

      </div>
    </div>
  );
};

export default Profile;