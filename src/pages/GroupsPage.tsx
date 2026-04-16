import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  PlusCircle,
  Users,
  Compass,
  User,
  Settings,
  ChevronRight,
} from "lucide-react";
import { useData } from "../context/DataContext";
import axiosInstance from "../types/axiosInstance";
import Navbar from "../components/layout/Navbar";

/**
 * HobbySphere Groups Page

 */

interface Group {
  id: number;
  name: string;
  members?: string;
  postsPerDay?: string;
  groupImage: string;
  lastActive?: string;
  joined?: boolean;
}

const GroupsPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("discover");
  const [managedGroupsAdmin, setManagedGroupsAdmin] = useState<Group[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  // const [suggestedGroups, setSuggestedGroups] = useState<Group[]>([]);

  const { managedGroups, suggestedGroups, searchGroups } = useData();

  const imageSrc = `data:image/png;base64,${managedGroups.groupImage}`;
  const imageSrc2 = `data:image/png;base64,${joinedGroups.groupImage}`;
  const imageSrc3 = `data:image/png;base64,${suggestedGroups.groupImage}`;
  // ✅ Call API when search changes (with debounce)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      searchGroups(search); // default page=0, size=20
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [search, searchGroups]);

  // Fetch groups from API (using dummy data now)
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axiosInstance.get(
          "/api/groups/userManagedGroups", {
          params: { page: 0, size: 20 }
        });
        // );
        const apiGroupsAdmin = res.data.data;

        console.log("API Managed Groups:", apiGroupsAdmin);
        const formattedGroupsAdmin = apiGroupsAdmin.map((g: any) => ({
          id: g.groupId,
          name: g.groupName,
          groupImage: g.groupImageUrl, // base64
          lastActive: g.updatedAt
            ? new Date(g.updatedAt).toLocaleDateString()
            : "Recently",
        }));
        // const [managed, joined, suggested] = await Promise.all([
        //   axiosInstance.get("/api/groups/managed"),
        //   axiosInstance.get("/api/groups/joined"),
        //   axiosInstance.get("/api/groups/suggested"),
        // ]);
        setManagedGroupsAdmin(formattedGroupsAdmin);
        // console.log("Managed groups data:", data);
        //       // setJoinedGroups(joined.data);
        //       // setSuggestedGroups(suggested.data);

        //       // Dummy fallback data
        //       setManagedGroupsAdmin([
        //         {
        //           id: 1,
        //           name: "Test",
        //           lastActive: "7 weeks ago",
        //           image: "https://i.ibb.co/QDrDp2t/group3.png",
        //         },
        //         {
        //           id: 2,
        //           name: "Test 2",
        //           lastActive: "1 week ago",
        //           image: "https://i.ibb.co/8NTJmKJ/group2.png",
        //         },
        //       ]);
        setJoinedGroups([
          {
            id: 3,
            name: "JSB TV SERIES",
            lastActive: "1 day ago",
            groupImage: "https://i.ibb.co/yfH6xv1/group1.png",
          },
        ]);
        //       setSuggestedGroups([
        //         {
        //           id: 4,
        //           name: "CSE - කොළඹ කොටස් වෙළඳපොළ ආයෝජකයෝ",
        //           members: "44K members",
        //           postsPerDay: "10+ posts a day",
        //           image: "https://i.ibb.co/GsXH1sf/group-suggest1.png",
        //         },
        //         {
        //           id: 5,
        //           name: "ගම්පහ ඉක්මන් විකුණුම් ඉඩම් නිවාස lk.",
        //           members: "10K members",
        //           postsPerDay: "10+ posts a day",
        //           image: "https://i.ibb.co/fMkhcc6/group4.png",
        //         },
        //       ]);
      } catch (err) {
        console.error("Error fetching groups", err);
      }
    };
    fetchGroups();
  }, []);

  const handleGroupClick = async (groupId: number) => {
    try {
      // 1️⃣ Call API to get group details by ID
      const res = await axiosInstance.get(`/api/groups/${groupId}`);
      const groupData = res.data; // backend returns { group: {...}, role: 'ADMIN' | 'MEMBER' | ... }

      // 2️⃣ Check role if needed
      const role = groupData.role;

      // 3️⃣ Navigate to Group page and pass data via state (optional)
      navigate(`/Group/${groupId}`, { state: { group: groupData.group, role } });
    } catch (err) {
      console.error("Failed to fetch group by ID", err);
      alert("Failed to load group details.");
    }
  };

  // Filter based on search
  const filteredManaged = managedGroups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredJoined = joinedGroups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredSuggested = suggestedGroups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-sky-100 to-sky-200">
      {/* ✅ Global Navbar */}
      <Navbar />

      <div className="flex flex-col md:flex-row pt-8">
        {/* LEFT SIDEBAR */}
        <aside className="w-full md:w-64 bg-white/70 backdrop-blur-lg border-r border-sky-100 p-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 text-sky-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search groups"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-full bg-sky-50 border border-sky-200 text-sm focus:ring-2 focus:ring-sky-300 outline-none"
            />
          </div>

          <nav className="flex flex-col gap-2 text-sm">
            <button
              onClick={() => navigate("/Groups/Feed")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50"
            >
              <User className="w-4 h-4" /> Your Feed
            </button>

            <button
              onClick={() => navigate("/Groups")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-100 text-sky-700 font-medium"
            >
              <Compass className="w-4 h-4" /> Discover
            </button>

            <button
              onClick={() => navigate("/Groups/MyGroups")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50"
            >
              <Users className="w-4 h-4" /> Your Groups
            </button>

            <button
              onClick={() => navigate("/CreateGroup")}
              className="flex items-center gap-2 px-3 py-2 text-sky-600 mt-3 hover:text-sky-700"
            >
              <PlusCircle className="w-4 h-4" /> Create New Group
            </button>
          </nav>

          {/* Managed groups */}
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              Groups You Manage
            </h2>
            <div className="space-y-2">
              {managedGroupsAdmin.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-sky-50 p-2 rounded-lg"
                  onClick={() => handleGroupClick(g.id)}
                >
                  <img
                    src={
                      g.groupImage
                        ? `data:image/png;base64,${g.groupImage}`
                        : "/group-placeholder.png"
                    }
                    alt={g.name}
                    className="w-9 h-9 rounded-md object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium">{g.name}</p>
                    <p className="text-xs text-gray-500">
                      Last active {g.lastActive}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <main className="flex-1 p-5">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-700">
                For You
              </h2>
              <button className="text-sky-600 text-sm hover:underline">
                See all
              </button>
            </div>
            {/* Suggested Groups */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSuggested.map((group) => (
                <div
                  key={group.id}
                  className="bg-white/80 border border-sky-100 rounded-2xl shadow hover:shadow-md transition-all overflow-hidden"
                  onClick={() => handleGroupClick(group.id)}
                >
                  <img
                    src={`data:image/png;base64,${group.groupImage}`}
                    alt={group.name}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-1">
                      {group.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {group.memberCount} • {group.postsPerDay}
                    </p>
                    <button className="mt-3 w-full bg-sky-50 border border-sky-200 text-sky-700 font-medium text-sm rounded-lg py-2 hover:bg-sky-100 transition"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent triggering tile click
                        alert("Join group functionality here"); // replace with join API
                      }}
                    >
                      Join Group
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Joined Groups */}
            <div className="mt-10">
              <h2 className="text-lg font-bold text-gray-700 mb-3">
                Groups You’ve Joined
              </h2>
              <div className="space-y-3">
                {filteredJoined.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => navigate(`/Group/${group.id}`)}
                    className="flex items-center gap-3 bg-white/80 border border-sky-100 hover:border-sky-300 rounded-xl p-3 cursor-pointer shadow-sm hover:shadow-md transition"
                  >
                    <img
                      src={`data:image/png;base64,${group.groupImage}`}
                      alt={group.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{group.name}</p>
                      <p className="text-xs text-gray-500">
                        Last active {group.lastActive}
                      </p>
                    </div>
                    <ChevronRight className="text-sky-400 w-4 h-4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GroupsPage;
