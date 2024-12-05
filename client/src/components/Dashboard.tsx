import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';
import { Calendar, TrendingUp, MessageCircle } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import axios from 'axios';
import dayjs from 'dayjs';
import { FaHome } from 'react-icons/fa';
import { Tooltip } from '@mui/joy';
import { InfoIcon } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Navigator Hub
            </h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaHome className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="ml-3">Dashboard</span>
            </button>

            <button 
              onClick={() => navigate('/chat')}
              className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <MessageCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="ml-3">Chat with Aru</span>
            </button>

            <button 
              onClick={() => navigate('/schedule')}
              className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="ml-3">Content Calendar</span>
            </button>
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                ) : (
                  <FaUser className="w-8 h-8 text-gray-400" />
                )}
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {user?.displayName || user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                title="Sign Out"
              >
                <FaSignOutAlt className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64"> {/* Offset by sidebar width */}
        <div className="p-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 mb-8 text-white">
            <h1 className="text-3xl font-bold mb-2">
              Welcome, {user?.displayName?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-lg opacity-90">
              Where Mentors and Mentees Connect, Learn, and Grow Together
            </p>
          </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Career Growth Milestones Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md hover:shadow-lg transition-all duration-200">
                    <div className="text-center">
                        <h3 className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-4">
                            Career Growth Milestones
                        </h3>
                        <div className="relative inline-flex items-center justify-center mb-4">
                            <div className="absolute">
                                <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    5/10
                                </p>
                            </div>
                            <svg className="w-24 h-24" viewBox="0 0 36 36">
                                {/* ... existing svg code ... */}
                            </svg>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Goals Achieved
                        </span>
                    </div>
                </div>

                {/* Skill Development Progress Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md hover:shadow-lg transition-all duration-200">
                    <div className="text-center">
                        <h3 className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-4">
                            Skill Development Progress
                        </h3>
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
                                        Networking
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold inline-block text-purple-600">
                                        60%
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
                                <div 
                                    style={{ width: "60%" }}
                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-purple-600 to-blue-600"
                                ></div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                On track for next milestone
                            </span>
                        </div>
                    </div>
                </div>

                {/* Strategic Growth Score (SGS) Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md hover:shadow-lg transition-all duration-200">
                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                            <h3 className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                                Strategic Growth Score
                            </h3>
                            <Tooltip
                                title="Your SGS reflects your progress in three areas: goals you've completed (Branding), skills you've improved (Education), and your engagement with the community (Networking)"
                                arrow
                                placement="top"
                            >
                                <InfoIcon className="w-4 h-4 text-gray-400 cursor-help" />
                            </Tooltip>
                        </div>
                        <div className="flex justify-center items-center space-x-6">
                            {/* Branding Score */}
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-2">
                                    <span className="text-2xl font-bold text-white">85</span>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Branding</span>
                            </div>
                            {/* Education Score */}
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-2">
                                    <span className="text-2xl font-bold text-white">72</span>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Education</span>
                            </div>
                            {/* Networking Score */}
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-2">
                                    <span className="text-2xl font-bold text-white">68</span>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Networking</span>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Overall Score: <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">75</span>
                            </p>
                        </div>
                    </div>
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Action Plan Calendar</h3>
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Strategic Career Guidance</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Career advancement planning and guidance</p>
                <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                  Coming Soon
                </span>
              </div>
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