import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';
import { Calendar, TrendingUp, MessageCircle } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import axios from 'axios';
import dayjs from 'dayjs';

interface Post {
  Post_content: string;
  Post_date: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [posts, setPosts] = useState<{ [key: string]: Post }>({});
  const [currentDate] = useState(dayjs());

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return;
      try {
        const idToken = await user.getIdToken();
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/schedule/${user.uid}`,
          {
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          }
        );
        setPosts(response.data.generated_posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, [user]);

  const renderMiniCalendar = () => {
    const daysInMonth = currentDate.daysInMonth();
    //const days = [];
    const weeks = [];
    let currentWeek = [];

    // Create day cells
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDay = currentDate.date(i).format('YYYY-MM-DD');
      const hasPost = Object.values(posts).some(post => post.Post_date === currentDay);
      
      currentWeek.push(
        <div
          key={i}
          className={`aspect-square flex items-center justify-center text-xs 
            ${hasPost ? 'bg-purple-100 dark:bg-purple-900' : 'bg-gray-50 dark:bg-gray-800'}
            border border-gray-200 dark:border-gray-700`}
        >
          {i}
        </div>
      );

      if (currentWeek.length === 7 || i === daysInMonth) {
        weeks.push(
          <div key={`week-${i}`} className="grid grid-cols-7 gap-0.5">
            {currentWeek}
          </div>
        );
        currentWeek = [];
      }
    }

    return weeks;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Navigator Hub
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="flex items-center space-x-2">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                ) : (
                  <FaUser className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:inline">
                  {user?.displayName || user?.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-2 md:px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <FaSignOutAlt className="md:mr-2" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.displayName?.split(' ')[0] || 'User'}!</h1>
          <p className="text-lg opacity-90">Where Mentors and Mentees Connect, Learn, and Grow Together</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Engagements</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">1,768</p>
            <span className="text-sm text-gray-600 dark:text-gray-400">Across all posts</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Monthly Views</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">621</p>
            <span className="text-sm text-gray-600 dark:text-gray-400">Profile visits</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">New Connections</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">216</p>
            <span className="text-sm text-gray-600 dark:text-gray-400">This month</span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Section - Chat with Aru */}
          <div className="space-y-6">
            <button
              onClick={() => navigate('/chat')}
              className="w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex items-center space-x-4"
            >
              <MessageCircle className="w-8 h-8 text-purple-600" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chat with Aru</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get personalized guidance and create content strategies</p>
              </div>
            </button>
          </div>

          {/* Middle Section - Content Calendar */}
          <div className="space-y-6">
            <div 
              onClick={() => navigate('/schedule')}
              className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Content Calendar</h3>
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {currentDate.format('MMMM YYYY')}
                </p>
              </div>
              <div className="p-4">
                <div className="space-y-0.5">
                  {renderMiniCalendar()}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Achievement Plan */}
          <div className="space-y-6">
            <div className="w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md opacity-75">
              <div className="flex items-center space-x-4 mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Achievement Negotiator Plan</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Strategic career advancement planning and guidance</p>
              <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Button */}
      <button
        onClick={() => setIsFeedbackModalOpen(true)}
        className="fixed bottom-4 right-4 px-4 py-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 z-40"
      >
        Help Us Improve
      </button>

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        userEmail={user?.email ?? undefined}
      />
    </div>
  );
};

export default Dashboard;