// src/pages/FriendProfile.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import { Grid, Bookmark, Tag, MessageCircle, Heart, UserPlus, Send } from "lucide-react";
import LoadingScreen from "../components/ui/LoadingScreen";
import * as usersApi from "../api/users";
import * as postsApi from "../api/posts";

const toBase64Image = (raw?: string | null) =>
  raw ? (raw.startsWith('data:') || raw.startsWith('http') ? raw : `data:image/png;base64,${raw}`) : '';

const FriendProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [showFollowing, setShowFollowing] = useState(false);
    const [followingList, setFollowingList] = useState<usersApi.UserDto[]>([]);
    const [followingLoading, setFollowingLoading] = useState(false);

    const [friend, setFriend] = useState<usersApi.UserDto | null>(null);
    const [friendPosts, setFriendPosts] = useState<postsApi.PostDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"posts" | "saved" | "tagged">("posts");
    const [isFollowing, setIsFollowing] = useState(false);
    const [followBusy, setFollowBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch friend profile by id
    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const res = await usersApi.getUserById(id!);
                if (!cancelled) {
                    setFriend(res.data);
                    setIsFollowing(!!res.data.following);
                }
            } catch (e: any) {
                if (!cancelled) {
                    setError(e?.response?.data?.message || e.message || "Failed to load profile");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        if (id) load();
        return () => { cancelled = true; };
    }, [id]);

    // Fetch this user's real posts (not the viewer's own feed cache)
    useEffect(() => {
        let cancelled = false;

        async function loadPosts() {
            if (!id) return;
            setPostsLoading(true);
            try {
                const res = await postsApi.getPostsByUser(id, 0, 30);
                if (!cancelled) setFriendPosts(res.data.content);
            } catch (e) {
                console.error("Failed to load user posts:", e);
            } finally {
                if (!cancelled) setPostsLoading(false);
            }
        }

        loadPosts();
        return () => { cancelled = true; };
    }, [id]);

    const handleFollowToggle = async () => {
        if (!id || followBusy) return;
        setFollowBusy(true);
        try {
            if (!isFollowing) {
                await usersApi.followUser(id);
                setIsFollowing(true);
                setFriend((prev) => prev ? { ...prev, followersCount: prev.followersCount + 1 } : prev);
            } else {
                await usersApi.unfollowUser(id);
                setIsFollowing(false);
                setFriend((prev) => prev ? { ...prev, followersCount: Math.max(0, prev.followersCount - 1) } : prev);
            }
        } catch (error) {
            console.error("Error updating follow status:", error);
        } finally {
            setFollowBusy(false);
        }
    };

    const openFollowing = async () => {
        setShowFollowing(true);
        if (!id || followingList.length > 0) return;
        setFollowingLoading(true);
        try {
            const res = await usersApi.getUserFollowing(id);
            setFollowingList(res.data.data || []);
        } catch (e) {
            console.error("Failed to load following list:", e);
        } finally {
            setFollowingLoading(false);
        }
    };

    const imageSrc = toBase64Image(friend?.profilePicture) || "/default-avatar.png";

    if (loading) {
        return <LoadingScreen />;
    }

    if (error || !friend) {
        return (
            <div className="min-h-screen bg-sky-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 pt-24">
                    <div className="bg-white rounded-xl p-8 shadow-sm text-center text-red-600">
                        {error || "Profile not found"}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
            <Navbar />

            <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-16 pb-20 md:pt-20 md:pb-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-2xl shadow-md overflow-hidden mb-6"
                >
                    {/* fun cover */}
                    <div className="h-28 sm:h-44 bg-gradient-to-r from-sky-400 via-pink-300 to-purple-400 animate-[pulse_6s_ease-in-out_infinite]" />

                    <div className="px-4 sm:px-6 py-4 flex flex-col md:flex-row">
                        {/* Avatar */}
                        <div className="flex-shrink-0 -mt-12 sm:-mt-16 md:-mt-20 mb-4 md:mb-0 relative z-10">
                            <img
                                src={imageSrc}
                                alt={friend.fullName}
                                className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-white object-cover shadow-lg"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 md:ml-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                <div>
                                    <h1 className="text-2xl font-bold">{friend.fullName}</h1>
                                    <p className="text-gray-400 text-md font-bold">@{friend.username}</p>
                                </div>

                                <div className="mt-3 md:mt-0 flex space-x-2">
                                    <Button
                                        variant={isFollowing ? "outline" : "primary"}
                                        size="sm"
                                        onClick={handleFollowToggle}
                                        disabled={followBusy}
                                    >
                                        <UserPlus className="w-4 h-4 mr-1" />
                                        {isFollowing ? "Following" : "Follow"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/chat?user=${encodeURIComponent(friend.username)}`)}
                                    >
                                        <Send className="w-4 h-4 mr-1" /> Message
                                    </Button>
                                </div>
                            </div>

                            <p className="text-gray-700 mb-3">
                                <span className="font-bold">Bio:</span> {friend.bio || "—"}
                            </p>

                            <div className="flex flex-wrap gap-x-6 gap-y-1 mb-4">
                                {friend.location && <p className="text-gray-700">📍 {friend.location}</p>}
                                {friend.mainHobby && <p className="text-gray-700">🎯 {friend.mainHobby}</p>}
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap justify-between mb-2">
                                <div className="mr-6 mb-2">
                                    <span className="font-semibold text-gray-900">{friendPosts.length}</span>{" "}
                                    <span className="text-gray-600">Posts</span>
                                </div>

                                {/* Followers — the backend only exposes the current user's own follower
                                    list, not another user's, so this is a plain count, not a clickable modal */}
                                <div className="mr-6 mb-2">
                                    <span className="font-semibold text-gray-900">{friend.followersCount ?? 0}</span>{" "}
                                    <span className="text-gray-600">Followers</span>
                                </div>

                                <button
                                    className="mb-2 text-left"
                                    onClick={openFollowing}
                                >
                                    <span className="font-semibold text-gray-900">{friend.followingCount ?? 0}</span>{" "}
                                    <span className="text-gray-600">Following</span>
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-t border-gray-200">
                        <div className="flex">
                            <button
                                className={`flex-1 py-3 font-medium text-sm flex items-center justify-center ${activeTab === "posts" ? "text-navy-600 border-b-2 border-navy-600" : "text-gray-500"
                                    }`}
                                onClick={() => setActiveTab("posts")}
                            >
                                <Grid className="w-5 h-5 mr-1" />
                                Posts
                            </button>
                            <button
                                className={`flex-1 py-3 font-medium text-sm flex items-center justify-center ${activeTab === "saved" ? "text-navy-600 border-b-2 border-navy-600" : "text-gray-500"
                                    }`}
                                onClick={() => setActiveTab("saved")}
                            >
                                <Bookmark className="w-5 h-5 mr-1" />
                                Saved
                            </button>
                            <button
                                className={`flex-1 py-3 font-medium text-sm flex items-center justify-center ${activeTab === "tagged" ? "text-navy-600 border-b-2 border-navy-600" : "text-gray-500"
                                    }`}
                                onClick={() => setActiveTab("tagged")}
                            >
                                <Tag className="w-5 h-5 mr-1" />
                                Tagged
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Posts */}
                {activeTab === "posts" && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                        {postsLoading ? (
                            <div className="col-span-2 md:col-span-3 text-center text-gray-400 py-8 animate-pulse">Loading posts...</div>
                        ) : friendPosts.length === 0 ? (
                            <div className="col-span-2 md:col-span-3 bg-white rounded-lg shadow-md p-8 text-center">
                                <span className="text-6xl">🤷‍♂️</span>
                                <h3 className="text-lg font-semibold mt-4">No Posts Yet</h3>
                                <p className="text-gray-500">This user hasn’t shared any posts yet.</p>
                            </div>
                        ) : (
                            friendPosts.map((post, index) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04 }}
                                    className="aspect-square overflow-hidden bg-gray-100 relative group rounded-lg shadow hover:shadow-lg transition"
                                >
                                    {post.imageUrls && post.imageUrls.length > 0 ? (
                                        <img
                                            src={toBase64Image(post.imageUrls[0])}
                                            alt="Post"
                                            loading="lazy"
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
                                                <span>{post.likesCount}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <MessageCircle className="w-6 h-6 mr-2" />
                                                <span>{post.commentsCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === "saved" && (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <Bookmark className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold mb-2">No Saved Posts</h3>
                        <p className="text-gray-500">Saved posts will appear here.</p>
                    </div>
                )}

                {activeTab === "tagged" && (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <Tag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold mb-2">No Tagged Posts</h3>
                        <p className="text-gray-500">Tagged posts will appear here.</p>
                    </div>
                )}

                {/* Following Modal */}
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
                            {followingLoading ? (
                                <p className="text-gray-400 text-center animate-pulse">Loading...</p>
                            ) : followingList.length === 0 ? (
                                <p className="text-gray-500 text-center">Not following anyone yet</p>
                            ) : (
                                followingList.map((u) => (
                                    <div
                                        key={u.id}
                                        className="flex items-center justify-between mb-3 hover:bg-sky-50 rounded-lg p-2"
                                    >
                                        <div
                                            className="flex items-center space-x-3 cursor-pointer"
                                            onClick={() => {
                                                setShowFollowing(false);
                                                navigate(`/FriendProfile/${u.id}`);
                                            }}
                                        >
                                            <img
                                                src={toBase64Image(u.profilePicture) || "/default-avatar.png"}
                                                alt={u.username}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <div>
                                                <div className="font-semibold text-gray-900">
                                                    {u.fullName || "No Name"}
                                                </div>
                                                <div className="text-sm text-gray-500">@{u.username}</div>
                                            </div>
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

export default FriendProfile;
