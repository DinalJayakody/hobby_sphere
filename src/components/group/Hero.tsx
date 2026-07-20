// src/components/group/Hero.tsx
import React from "react";
import { Lock, Globe } from "lucide-react";

type Props = {
    group: any;
    role: "SUPER_ADMIN" | "ADMIN" | "MEMBER" | null;
};

const Hero: React.FC<Props> = ({ group }) => {
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

    return (
        <section className="mt-6 bg-white rounded-2xl overflow-hidden border border-sky-100 shadow-sm">
            <div className="relative">
                {/* Cover area */}
                <div className="w-full h-44 md:h-56 bg-slate-100">
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
                    <div className="bg-white/90 backdrop-blur-md border border-sky-100 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="flex-shrink-0">
                            {/* simple round avatar (first letter) or group avatar */}
                            <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 text-lg font-bold">
                                {name.charAt(0) || "G"}
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-xl md:text-2xl font-extrabold text-sky-800">{name}</h1>
                                    {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
                                </div>

                                <div className="text-right hidden md:block">
                                    <div className="flex items-center gap-2">
                                        {/* privacy badge */}
                                        {isPublic ? (
                                            <span className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-sky-100 text-sm text-sky-600 shadow-sm">
                                                <Globe className="w-4 h-4" /> Public
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-sky-100 text-sm text-sky-600 shadow-sm">
                                                <Lock className="w-4 h-4" /> Private
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-xs text-gray-500 mt-2">{memberCount} members</div>
                                </div>
                            </div>

                            {/* mobile privacy + meta under title */}
                            <div className="md:hidden mt-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {isPublic ? (
                                        <span className="inline-flex items-center gap-1 bg-sky-50 px-2 py-1 rounded-full text-xs text-sky-600 border border-sky-100">
                                            <Globe className="w-3 h-3" /> Public
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-sky-50 px-2 py-1 rounded-full text-xs text-sky-600 border border-sky-100">
                                            <Lock className="w-3 h-3" /> Private
                                        </span>
                                    )}
                                </div>

                                <div className="text-xs text-gray-500">{memberCount} members</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
