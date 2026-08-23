// src/components/group/Hero.tsx
import React from "react";
import { Lock, Globe, UserPlus, Clock, Check } from "lucide-react";

type JoinStatus = "idle" | "joining" | "joined" | "pending";

type Props = {
    group: any;
    role: "SUPER_ADMIN" | "ADMIN" | "MEMBER" | null;
    joinStatus?: JoinStatus;
    onJoin?: () => void;
};

const Hero: React.FC<Props> = ({ group, role, joinStatus = "idle", onJoin }) => {
    // The getGroupById response shape isn't documented by the backend and
    // couldn't be verified live (group creation currently fails server-side)
    // — fall back across the field names used by the other group DTOs.
    const rawImage = group.groupImage ?? group.groupImageUrl ?? group.coverUrl ?? null;
    const imageSrc = rawImage
        ? (rawImage.startsWith('data:') || rawImage.startsWith('http') ? rawImage : `data:image/png;base64,${rawImage}`)
        : null;
    const name = group.groupName ?? group.name ?? 'Group';
    const description = group.description ?? '';
    const isPublic = (group.privacy ?? group.groupPrivacy) === 'PUBLIC' || (group.privacy ?? '').toLowerCase() === 'public';
    const memberCount = group.memberCount ?? group.groupMemberCount ?? group.membersCount ?? 0;
    const isMember = role != null;

    const JoinButton = ({ fullWidth = false }: { fullWidth?: boolean }) => {
        if (isMember || !onJoin) return null;
        const widthCls = fullWidth ? "w-full justify-center" : "";
        if (joinStatus === "pending") {
            return (
                <button
                    disabled
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-surface-muted text-ink-muted cursor-not-allowed ${widthCls}`}
                >
                    <Clock className="w-4 h-4" /> Request Pending
                </button>
            );
        }
        if (joinStatus === "joined") {
            return (
                <button
                    disabled
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 text-white ${widthCls}`}
                >
                    <Check className="w-4 h-4" /> Joined
                </button>
            );
        }
        return (
            <button
                onClick={onJoin}
                disabled={joinStatus === "joining"}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-sky-500 hover:bg-sky-600 text-white shadow-sm transition disabled:opacity-70 ${widthCls}`}
            >
                <UserPlus className="w-4 h-4" /> {joinStatus === "joining" ? "Joining…" : "Join Group"}
            </button>
        );
    };

    return (
        <section className="mt-6 bg-surface rounded-2xl overflow-hidden border border-sky-100 dark:border-border shadow-soft">
            <div className="relative">
                {/* Cover area */}
                <div className="w-full h-44 md:h-56 bg-surface-muted">
                    {imageSrc ? (
                        <img
                            src={imageSrc}
                            alt={`${name} cover`}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-sky-200 to-navy-300" />
                    )}
                    {/* gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* floating content card */}
                <div className="px-4 md:px-6 pb-4 -mt-10 relative z-10">
                    <div className="bg-surface/90 backdrop-blur-md border border-sky-100 dark:border-border rounded-xl p-4 shadow-soft flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="flex-shrink-0">
                            {/* simple round avatar (first letter) or group avatar */}
                            <div className="w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-500/15 flex items-center justify-center text-sky-600 dark:text-sky-400 text-lg font-bold">
                                {name.charAt(0) || "G"}
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-xl md:text-2xl font-extrabold text-sky-800 dark:text-sky-300">{name}</h1>
                                    {description && <p className="text-sm text-ink-muted mt-1">{description}</p>}
                                </div>

                                <div className="text-right hidden md:flex md:flex-col md:items-end gap-2">
                                    <div className="flex items-center gap-2">
                                        {/* privacy badge */}
                                        {isPublic ? (
                                            <span className="inline-flex items-center gap-2 bg-surface px-3 py-1 rounded-full border border-sky-100 dark:border-border text-sm text-sky-600 dark:text-sky-400 shadow-soft">
                                                <Globe className="w-4 h-4" /> Public
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-2 bg-surface px-3 py-1 rounded-full border border-sky-100 dark:border-border text-sm text-sky-600 dark:text-sky-400 shadow-soft">
                                                <Lock className="w-4 h-4" /> Private
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-xs text-ink-faint">{memberCount} members</div>

                                    <JoinButton />
                                </div>
                            </div>

                            {/* mobile privacy + meta under title */}
                            <div className="md:hidden mt-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {isPublic ? (
                                        <span className="inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-500/10 px-2 py-1 rounded-full text-xs text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-border">
                                            <Globe className="w-3 h-3" /> Public
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-500/10 px-2 py-1 rounded-full text-xs text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-border">
                                            <Lock className="w-3 h-3" /> Private
                                        </span>
                                    )}
                                </div>

                                <div className="text-xs text-ink-faint">{memberCount} members</div>
                            </div>

                            {!isMember && onJoin && (
                                <div className="md:hidden mt-3">
                                    <JoinButton fullWidth />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
