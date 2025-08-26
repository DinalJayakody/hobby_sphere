// src/pages/FriendProfile.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import { Grid, Bookmark, Tag, MessageCircle, Heart, UserPlus, Send } from "lucide-react";
import { useData } from "../context/DataContext";
import LoadingScreen from "../components/ui/LoadingScreen";
import axiosInstance from "../types/axiosInstance";

type FriendUser = {
    id: string | number;
    fullName: string;
    username: string;
    bio?: string;
    profilePicture?: string; // base64
    imageUrl?: string;       // optional URL alternative
    location?: string;
    mainHobby?: string;
    followers?: number;
    following?: number;
    posts?: number;
};

const FriendProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { posts } = useData();

    const [friend, setFriend] = useState<FriendUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"posts" | "saved" | "tagged">("posts");
    const [isFollowing, setIsFollowing] = useState(false);
    const [error, setError] = useState<string | null>(null);


    axios.defaults.baseURL = 'http://localhost:8080';
    // Fetch friend profile by id
    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const res = await axios.get(`/api/users/${id}`
                    //   `http://16.170.26.131:8080/api/users/${id}`,
                );

                const data = res.data?.data ?? res.data;

                if (!cancelled) {
                    setFriend({
                        id: data.id,
                        fullName: data.fullName,
                        username: data.username,
                        bio: data.bio,
                        profilePicture: data.profilePicture, // base64 expected
                        imageUrl: data.imageUrl,
                        location: data.location,
                        mainHobby: data.mainHobby,
                        followers: data.followers,
                        following: data.following,
                        posts: data.posts,

                    });
                    setIsFollowing(true);
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

    const handleFollowToggle = async () => {
        try {
            setLoading(true);

            if (!isFollowing) {
                // 👉 Follow API
                await axios.post(
                    `/api/users/${id}/follow`,
                    {},
                    {
                        headers: {
                            Authorization: `${localStorage.getItem("token")}`,
                        },
                    }
                );
                setIsFollowing(true);
            } else {
                // 👉 Unfollow API
                await axios.post(
                    `/api/users/${id}/unfollow`,
                    {},
                    {
                        headers: {
                            Authorization: `${localStorage.getItem("token")}`,
                        },
                    }
                );
                setIsFollowing(false);
            }


        } catch (error) {
            console.error("Error updating follow status:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter posts from your context (if you already have them client-side)
    const friendPosts = posts.filter((p) => String(p.userId) === String(friend?.id));

    const imageSrc =
        friend?.profilePicture
            ? `data:image/png;base64,${friend.profilePicture}`
            : friend?.imageUrl || "/default-avatar.png";

    if (loading) {
        return <LoadingScreen />;  // 👈 Show full loading screen
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

            <div className="max-w-4xl mx-auto px-4 pt-16 pb-20 md:pt-20 md:pb-6">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
                    {/* fun cover */}
                    <div className="h-44 bg-gradient-to-r from-sky-400 via-pink-300 to-purple-400 animate-[pulse_6s_ease-in-out_infinite]" />

                    <div className="px-6 py-4 flex flex-col md:flex-row">
                        {/* Avatar */}
                        <div className="flex-shrink-0 -mt-16 md:-mt-20 mb-4 md:mb-0">
                            <img
                                src={imageSrc}
                                alt={friend.fullName}
                                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white object-cover shadow-lg hover:scale-105 transition-transform"
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
                                        disabled={loading}
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

                            <div className="flex gap-x-10 mb-4">
                                <p className="text-gray-700">📍 {friend.location || "Unknown"}</p>
                                <p className="text-gray-700">🎯 {friend.mainHobby || "No hobby"}</p>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap justify-between mb-2">
                                <div className="mr-6 mb-2">
                                    <span className="font-semibold text-gray-900">{friend.posts ?? 0}</span>{" "}
                                    <span className="text-gray-600">Posts</span>
                                </div>
                                <div className="mr-6 mb-2">
                                    <span className="font-semibold text-gray-900">{friend.followers ?? 0}</span>{" "}
                                    <span className="text-gray-600">Followers</span>
                                </div>
                                <div className="mb-2">
                                    <span className="font-semibold text-gray-900">{friend.following ?? 0}</span>{" "}
                                    <span className="text-gray-600">Following</span>
                                </div>
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
                </div>

                {/* Posts */}
                {activeTab === "posts" && (
                    <div className="grid md:grid-cols-3 gap-4">
                        {friendPosts.length === 0 ? (
                            <div className="col-span-3 bg-white rounded-lg shadow-md p-8 text-center">
                                <span className="text-6xl">🤷‍♂️</span>
                                <h3 className="text-lg font-semibold mt-4">No Posts Yet</h3>
                                <p className="text-gray-500">This user hasn’t shared any posts yet.</p>
                            </div>
                        ) : (
                            friendPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="aspect-square overflow-hidden bg-gray-100 relative group rounded-lg shadow hover:shadow-lg transition"
                                >
                                    {post.images && post.images.length > 0 ? (
                                        <img
                                            src={`data:image/png;base64,${post.images}`}
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
            </div>
        </div>
    );
};

export default FriendProfile;
