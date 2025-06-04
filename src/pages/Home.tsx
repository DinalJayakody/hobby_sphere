import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Navbar from '../components/layout/Navbar';
import Stories from '../components/home/Stories';
import CreatePostCard from '../components/home/CreatePostCard';
import PostCard from '../components/home/PostCard';
import Avatar from '../components/ui/Avatar';
import { ShieldPlus as FriendPlus, Users, Cake, Bell } from 'lucide-react';

const Home: React.FC = () => {
  const { user, loading } = useAuth();
  const { posts } = useData();

  if (user) {
    user.followers = 100; // Example data, replace with actual user data
    user.following = 50; // Example data, replace with actual user data
    user.profilePicture = 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg'; // Example data, replace with actual user data
    user.posts = 12;
  }

    if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
        <p className="mt-4 text-blue-600 font-medium">Loading...</p>
      </div>
    );
  }

  


  //   user.id: 12;
  // username: string;
  // email: string;
  // fullName: string,
  // profilePicture: string,
  // // posts: any[], // Adjust type based on your posts structure
  // followers: number,
  // following: number,
  // posts: number;

  if (!user) return null;
    console.log('check user response:', user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-sky-200 ">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-16 pb-24 md:pt-20 md:pb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar - Desktop only */}
        <div className="hidden md:block">
          <div className="static top-24 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                <Avatar 
                  src={user.profilePicture}
                  alt={user.fullName}
                  size="md"
                />
                <div>
                  <h3 className="font-semibold">{user.fullName}</h3>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
              </div>

              <div className="flex justify-between py-3 text-sm">
                <div className="text-center">
                  <p className="font-semibold">{user.posts}</p>

                  <p className="text-gray-500">Posts</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{user.followers}</p>
                  <p className="text-gray-500">Followers</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{user.following}</p>
                  <p className="text-gray-500">Following</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-3">Suggestions For You</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar 
                      src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg"
                      alt="Michael Wilson"
                      size="sm"
                    />
                    <div className="text-sm">
                      <p className="font-medium">Michael Wilson</p>
                      <p className="text-xs text-gray-500">Photographer</p>
                    </div>
                  </div>
                  <button className="text-navy-600 text-sm font-medium hover:underline">
                    Follow
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar 
                      src="https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg"
                      alt="Emily Davis"
                      size="sm"
                    />
                    <div className="text-sm">
                      <p className="font-medium">Emily Davis</p>
                      <p className="text-xs text-gray-500">Travel blogger</p>
                    </div>
                  </div>
                  <button className="text-navy-600 text-sm font-medium hover:underline">
                    Follow
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar 
                      src="https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg"
                      alt="Robert Johnson"
                      size="sm"
                    />
                    <div className="text-sm">
                      <p className="font-medium">Robert Johnson</p>
                      <p className="text-xs text-gray-500">Software Engineer</p>
                    </div>
                  </div>
                  <button className="text-navy-600 text-sm font-medium hover:underline">
                    Follow
                  </button>
                </div>
              </div>
              <button className="w-full text-navy-600 text-sm font-medium mt-3 pt-3 border-t border-gray-100">
                See All Suggestions
              </button>
              
            </div>
          </div>
        </div>

        {/* Middle - Posts feed */}

        {/* Commented by DJ */}
        <div className="md:col-span-2">
          <Stories />
          <CreatePostCard />
    {/* </div> */}
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* ______________________________________ */}
      </div>
    </div>
  );
};

export default Home;


// -------------------------------------------------------
// Divider Test code
// -------------------------------------------------------


// import React, { useState } from 'react';
// import React from 'react';
// import { useAuth } from '../context/AuthContext';


// const Home = () => {
//   // const userString = localStorage.getItem('user');
//   // const user = userString ? JSON.parse(userString) : {};

// const { user, logout } = useAuth();
// console.log('Home response:', user);
// console.log('Uname:', user?.username);
//   // const user = JSON.parse(localStorage.getItem('user')) || { };

//   return (
//     <div style={{
//       display: 'flex',
//       justifyContent: 'center',  // horizontal center
//       alignItems: 'center',      // vertical center
//       height: '100vh',           // full viewport height
//       textAlign: 'center',       // text center inside
//     }}>
//       <center>

//             {user ? (
//         <>
//           <p>Welcome, {user.username}</p>
//           <p>Email: {user.email}</p>
//           <button onClick={logout}>Logout</button>
//         </>
//       ) : (
//         <p>No user data available.</p>
//       )}

//         {/* <h1 style={{ fontSize: '34px' }}>Hi ! {username}</h1>
//         <h3 style={{ fontSize: '44px', color: 'red' }}>Your Home Page In Under Maintenance</h3> */}
//       </center>
//     </div>
//   );
// };

// export default Home;
