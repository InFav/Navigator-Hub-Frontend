import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Book, Users, Calendar, ExternalLink, MessageCircle } from 'lucide-react';
import { FaSignOutAlt, FaUser, FaHome } from 'react-icons/fa';
import { PlanData } from '../types/plans';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface PlanProps {
    type: string;
    data: PlanData;
  }
  
  /*
  interface PlansData {
    achievable: PlanData;
    negotiated: PlanData;
    ambitious: PlanData;
  }
  */
  interface LocationState {
    plans: {
      plan_id: number;
      data: {
        achievable: PlanData;
        negotiated: PlanData;
        ambitious: PlanData;
      };
    };
  }

const PlanCard: React.FC<PlanProps> = ({ type, data }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 capitalize">
        {type} Plan ({data.weekly_hours} hours/week)
      </h3>
      
      <div className={`space-y-6 ${isExpanded ? '' : 'max-h-96 overflow-hidden'}`}>
        {/* Courses Section */}
        <div>
          <h4 className="flex items-center text-lg font-medium text-gray-700 mb-3">
            <Book className="w-5 h-5 mr-2" /> Recommended Courses
          </h4>
          <ul className="space-y-3">
            {data.courses.map((course, index) => (
              <li key={index} className="ml-6">
                <p className="text-blue-600 hover:underline">
                  <a href={course.link} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    {course.name} <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </p>
                <p className="text-sm text-gray-600">Duration: {course.duration}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Connections Section */}
        <div>
          <h4 className="flex items-center text-lg font-medium text-gray-700 mb-3">
            <Users className="w-5 h-5 mr-2" /> Suggested Connections
          </h4>
          <ul className="space-y-3">
            {data.connections.map((connection, index) => (
              <li key={index} className="ml-6">
                <p className="font-medium">{connection.title}</p>
                <p className="text-sm text-gray-600">{connection.company}</p>
                <p className="text-sm text-gray-500">{connection.reason}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Events Section */}
        <div>
          <h4 className="flex items-center text-lg font-medium text-gray-700 mb-3">
            <Calendar className="w-5 h-5 mr-2" /> Community Events
          </h4>
          <ul className="space-y-3">
            {data.events.map((event, index) => (
              <li key={index} className="ml-6">
                <p className="font-medium">{event.name}</p>
                <p className="text-sm text-gray-600">{event.type}</p>
                <p className="text-sm text-gray-500">Frequency: {event.frequency}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Show More
        </button>
      )}
    </div>
  );
};



const AchievementPlans: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(false);
    const [planData, setPlanData] = useState<LocationState['plans'] | null>(null);

    const handleSignOut = async () => {
      try {
        await signOut();
        navigate('/login');
      } catch (error) {
        console.error('Error signing out:', error);
      }
    };
  
    useEffect(() => {
      const fetchPlans = async () => {
        if (!location.state?.plans) {
          try {
            setLoading(true);
            const idToken = await user?.getIdToken();
            const response = await axios.get(
              `${import.meta.env.VITE_API_URL}/negotiator/plans/${user?.uid}`,
              {
                headers: {
                  'Authorization': `Bearer ${idToken}`
                }
              }
            );
            setPlanData(response.data);
          } catch (error) {
            console.error('Error fetching plans:', error);
          } finally {
            setLoading(false);
          }
        }
      };
  
      fetchPlans();
    }, [user, location.state]);
  
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }
  
    // Add debug logging
    console.log('Location state plans:', location.state?.plans);
    console.log('Fetched plan data:', planData);
  
    const plans = location.state?.plans || planData;
  
    if (!plans || !plans.data) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No plans found</h2>
            <button
              onClick={() => navigate('/negotiator')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Achievement Plan
            </button>
          </div>
        </div>
      );
    }
  
return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
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
      <div className="ml-64 flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Achievement Plans</h1>
            <p className="text-lg text-gray-600">
              Choose the plan that best fits your goals and availability. Each plan includes personalized course recommendations,
              networking suggestions, and community events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans?.data && (
              <>
                <PlanCard type="achievable" data={plans.data.achievable} />
                <PlanCard type="negotiated" data={plans.data.negotiated} />
                <PlanCard type="ambitious" data={plans.data.ambitious} />
              </>
            )}
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => navigate('/negotiator')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create New Plan
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementPlans;