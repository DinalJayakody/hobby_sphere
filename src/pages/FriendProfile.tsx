// src/pages/FriendProfile.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import { Grid, Images, Tag, MessageCircle, Heart, UserPlus, Send, MoreHorizontal, UserX } from "lucide-react";
import LoadingScreen from "../components/ui/LoadingScreen";
import * as usersApi from "../api/users";
import * as postsApi from "../api/posts";
import { useToast } from "../context/ToastContext";
import { useData } from "../context/DataContext";
import FollowingModal, { FollowingRow } from "../components/modals/FollowingModal";

const toBase64Image = (raw?: string | null) =>
  raw ? (raw.startsWith('data:') || raw.startsWith('http') ? raw : `data:image/png;base64,${raw}`) : '';

const FriendProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [showFollowing, setShowFollowing] = useState(false);
    const [followingList, setFollowingList] = useState<FollowingRow[]>([]);
    const [followingLoading, setFollowingLoading] = useState(false);

    const [friend, setFriend] = useState<usersApi.UserDto | null>(null);
    const [friendPosts, setFriendPosts] = useState<postsApi.PostDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"posts" | "photos" | "tagged">("posts");
    const [isFollowing, setIsFollowing] = useState(false);
    const [followBusy, setFollowBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [blocking, setBlocking] = useState(false);
    const { toast } = useToast();
    const { showNewlyFollowedUserPosts } = useData();

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
                showNewlyFollowedUserPosts(id);
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

    const handleBlock = async () => {
        if (!id || blocking) return;
        if (!window.confirm(`Block @${friend?.username}? They won't be able to see your profile or contact you.`)) return;
        setBlocking(true);
        try {
            await usersApi.blockUser(id);
            toast(`@${friend?.username} has been blocked.`, 'success');
            navigate(-1);
        } catch (err) {
            console.error('Block failed:', err);
            toast("Couldn't block this user. Please try again.", 'error');
        } finally {
            setBlocking(false);
            setMenuOpen(false);
        }
    };

    // Each row's action button reflects the VIEWER's own relationship to that
    // person (not @friend's) — e.g. Instagram/Twitter-style, so the viewer
    // can quickly follow/unfollow people they discover in a friend's
    // following list. `following` on UserDto already reflects the viewer.
    const openFollowing = async () => {
        setShowFollowing(true);
        if (!id || followingList.length > 0) return;
        setFollowingLoading(true);
        try {
            const res = await usersApi.getUserFollowing(id);
            setFollowingList(
                (res.data.data || []).map((u) => ({
                    id: u.id,
                    fullName: u.fullName,
                    username: u.username,
                    avatarUrl: toBase64Image(u.profilePicture) || undefined,
                    followStatus: !!u.following,
                }))
            );
        } catch (e) {
            console.error("Failed to load following list:", e);
        } finally {
            setFollowingLoading(false);
        }
    };

    const handleFollowInFollowingList = async (userId: string | number) => {
        await usersApi.followUser(userId);
        setFollowingList((prev) => prev.map((u) => (u.id === userId ? { ...u, followStatus: true } : u)));
        showNewlyFollowedUserPosts(userId);
    };

    const handleUnfollowInFollowingList = async (userId: string | number) => {
        await usersApi.unfollowUser(userId);
        setFollowingList((prev) => prev.map((u) => (u.id === userId ? { ...u, followStatus: false } : u)));
    };

    const imageSrc = toBase64Image(friend?.profilePicture) || "/default-avatar.svg";

    if (loading) {
        return <LoadingScreen />;
    }

    if (error || !friend) {
        return (
            <div className="min-h-screen bg-sky-50 dark:bg-navy-900">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 pt-24">
                    <div className="bg-surface rounded-xl p-8 shadow-soft text-center text-coral-600 dark:text-coral-400">
                        {error || "Profile not found"}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-navy-900 dark:to-surface">
            <Navbar />

            <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-16 pb-24 md:pt-20 md:pb-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-surface rounded-2xl shadow-soft border border-border overflow-hidden mb-6"
                >
                    {/* fun cover */}
                    <div className="h-28 sm:h-44 bg-gradient-to-r from-sky-400 via-pink-300 to-purple-400 animate-[pulse_6s_ease-in-out_infinite]" />

                    <div className="px-4 sm:px-6 py-4 flex flex-col md:flex-row">
                        {/* Avatar */}
                        <div className="flex-shrink-0 -mt-12 sm:-mt-16 md:-mt-20 mb-4 md:mb-0 relative z-10">
                            <img
                                src={imageSrc}
                                alt={friend.fullName}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/default-avatar.svg';
                                }}
                                className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-surface object-cover shadow-lg bg-surface-muted"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 md:ml-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-ink">{friend.fullName}</h1>
                                    <p className="text-ink-faint text-md font-bold">@{friend.username}</p>
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
                                        onClick={() => navigate('/chat', { state: { openUserId: Number(friend.id) } })}
                                    >
                                        <Send className="w-4 h-4 mr-1" /> Message
                                    </Button>
                                    <div className="relative">
                                        <button
                                            onClick={() => setMenuOpen((v) => !v)}
                                            className="p-2 rounded-lg border border-border text-ink-muted hover:text-ink hover:bg-surface-muted transition"
                                            aria-label="More options"
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                        {menuOpen && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                                                <div className="absolute right-0 mt-1 bg-surface-raised border border-border rounded-lg shadow-soft-lg py-1 z-20 w-40">
                                                    <button
                                                        onClick={handleBlock}
                                                        disabled={blocking}
                                                        className="flex items-center gap-2 px-3 py-2 text-sm text-coral-500 hover:bg-surface-muted w-full text-left disabled:opacity-50"
                                                    >
                                                        <UserX className="w-3.5 h-3.5" /> {blocking ? 'Blocking…' : 'Block user'}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <p className="text-ink-muted mb-3">
                                <span className="font-bold text-ink">Bio:</span> {friend.bio || "—"}
                            </p>

                            <div className="flex flex-wrap gap-x-6 gap-y-1 mb-4">
                                {friend.location && <p className="text-ink-muted">📍 {friend.location}</p>}
                                {friend.mainHobby && <p className="text-ink-muted">🎯 {friend.mainHobby}</p>}
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap justify-between mb-2">
                                <div className="mr-6 mb-2">
                                    <span className="font-semibold text-ink">{friendPosts.length}</span>{" "}
                                    <span className="text-ink-muted">Posts</span>
                                </div>

                                {/* Followers — the backend only exposes the current user's own follower
                                    list, not another user's, so this is a plain count, not a clickable modal */}
                                <div className="mr-6 mb-2">
                                    <span className="font-semibold text-ink">{friend.followersCount ?? 0}</span>{" "}
                                    <span className="text-ink-muted">Followers</span>
                                </div>

                                <button
                                    className="mb-2 text-left"
                                    onClick={openFollowing}
                                >
                                    <span className="font-semibold text-ink">{friend.followingCount ?? 0}</span>{" "}
                                    <span className="text-ink-muted">Following</span>
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-t border-border">
                        <div className="flex">
                            <button
                                className={`flex-1 py-3 font-medium text-sm flex items-center justify-center ${activeTab === "posts" ? "text-navy-600 dark:text-sky-400 border-b-2 border-navy-600 dark:border-sky-400" : "text-ink-faint"
                                    }`}
                                onClick={() => setActiveTab("posts")}
                            >
                                <Grid className="w-5 h-5 mr-1" />
                                Posts
                            </button>
                            <button
                                className={`flex-1 py-3 font-medium text-sm flex items-center justify-center ${activeTab === "photos" ? "text-navy-600 dark:text-sky-400 border-b-2 border-navy-600 dark:border-sky-400" : "text-ink-faint"
                                    }`}
                                onClick={() => setActiveTab("photos")}
                            >
                                <Images className="w-5 h-5 mr-1" />
                                Photos
                            </button>
                            <button
                                className={`flex-1 py-3 font-medium text-sm flex items-center justify-center ${activeTab === "tagged" ? "text-navy-600 dark:text-sky-400 border-b-2 border-navy-600 dark:border-sky-400" : "text-ink-faint"
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
                            <div className="col-span-2 md:col-span-3 text-center text-ink-faint py-8 animate-pulse">Loading posts...</div>
                        ) : friendPosts.length === 0 ? (
                            <div className="col-span-2 md:col-span-3 bg-surface rounded-lg shadow-soft border border-border p-8 text-center">
                                <span className="text-6xl">🤷‍♂️</span>
                                <h3 className="text-lg font-semibold mt-4 text-ink">No Posts Yet</h3>
                                <p className="text-ink-muted">This user hasn’t shared any posts yet.</p>
                            </div>
                        ) : (
                            friendPosts.map((post, index) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04 }}
                                    className="aspect-square overflow-hidden bg-surface-muted relative group rounded-lg shadow-soft hover:shadow-soft-lg transition"
                                >
                                    {post.imageUrls && post.imageUrls.length > 0 ? (
                                        <img
                                            src={toBase64Image(post.imageUrls[0])}
                                            alt="Post"
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-surface-muted">
                                            <p className="text-sm text-ink-muted p-4 text-center">{post.content}</p>
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

                {/* Photos — replaces a "Saved Posts" tab, which would have leaked
                    @friend's private bookmarks to any visitor; a photo grid of
                    their own posts is the honest, practical equivalent for a
                    profile that isn't the viewer's own. */}
                {activeTab === "photos" && (() => {
                    const postsWithImages = friendPosts.filter((p) => p.imageUrls && p.imageUrls.length > 0);
                    return (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                            {postsLoading ? (
                                <div className="col-span-2 md:col-span-3 text-center text-ink-faint py-8 animate-pulse">Loading photos...</div>
                            ) : postsWithImages.length === 0 ? (
                                <div className="col-span-2 md:col-span-3 bg-surface rounded-lg shadow-soft border border-border p-8 text-center">
                                    <Images className="w-12 h-12 mx-auto mb-4 text-ink-faint" />
                                    <h3 className="text-lg font-semibold mb-2 text-ink">No Photos Yet</h3>
                                    <p className="text-ink-muted">Posts with photos will appear here.</p>
                                </div>
                            ) : (
                                postsWithImages.map((post, index) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04 }}
                                        onClick={() => navigate(`/post/${post.id}`)}
                                        className="aspect-square overflow-hidden bg-surface-muted relative group rounded-lg shadow-soft hover:shadow-soft-lg transition cursor-pointer"
                                    >
                                        <img
                                            src={toBase64Image(post.imageUrls[0])}
                                            alt="Post"
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
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
                    );
                })()}

                {activeTab === "tagged" && (
                    <div className="bg-surface rounded-lg shadow-soft border border-border p-8 text-center">
                        <Tag className="w-12 h-12 mx-auto mb-4 text-ink-faint" />
                        <h3 className="text-lg font-semibold mb-2 text-ink">No Tagged Posts</h3>
                        <p className="text-ink-muted">Tagged posts will appear here.</p>
                    </div>
                )}

                <FollowingModal
                    open={showFollowing}
                    users={followingList}
                    loading={followingLoading}
                    onClose={() => setShowFollowing(false)}
                    onFollow={handleFollowInFollowingList}
                    onUnfollow={handleUnfollowInFollowingList}
                />

            </div>
        </div>
    );
};

export default FriendProfile;
