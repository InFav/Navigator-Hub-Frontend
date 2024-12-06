import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import dayjs from 'dayjs';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FeedbackModal from './FeedbackModal';
import { Calendar, MessageCircle } from 'lucide-react';
import { FaSignOutAlt, FaUser, FaHome } from 'react-icons/fa';

import {
    Box,
    Button,
    FormControl,
    FormLabel,
    IconButton,
    Modal,
    Textarea,
    Typography,
    Select,
    Option,
} from "@mui/joy";

interface Post {
    Post_content: string;
    Post_date: string;
    post_index?: number;
}

interface EventData {
    eventName: string;
    engagementType: string;
    description: string;
    contacts: string;
    deadlines: string;
    eventDate: string;
}
interface RegeneratePostData {
    customPrompt?: string;
}

const ContentSchedule: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [posts, setPosts] = useState<{ [key: string]: Post }>({});
    const [events, setEvents] = useState<{ [key: string]: EventData }>({});
    const [openModalPost, setOpenModalPost] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
    const [openModalEvent, setOpenModalEvent] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [personaId, setPersonaId] = useState<number | null>(null);
    const [customPrompt, setCustomPrompt] = useState<string>('');

    const [eventData, setEventData] = useState<EventData>({
        eventName: '',
        engagementType: 'Conferences',
        description: '',
        contacts: '',
        deadlines: '',
        eventDate: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            console.log("Location state:", location.state);
            
            if (location.state?.generatedPosts) {
                console.log("Setting posts from location state:", location.state.generatedPosts);
                setPosts(location.state.generatedPosts);
                // Set persona ID from location state
                if (location.state.personaId) {
                    setPersonaId(location.state.personaId);
                }
            } else {
                try {
                    console.log("Fetching posts from API for user:", user?.uid);
                    const idToken = await user?.getIdToken();
                    const response = await axios.get(
                        `${import.meta.env.VITE_API_URL}/api/schedule/${user?.uid}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${idToken}`
                            }
                        }
                    );
                    console.log("API Response:", response.data);
                    setPosts(response.data.generated_posts);
                    // Set persona ID from API response
                    if (response.data.persona_id) {
                        setPersonaId(response.data.persona_id);
                    }
                } catch (error) {
                    console.error('Error fetching posts:', error);
                }
            }
        };
    
        if (user) {
            fetchData();
        }
    }, [location.state, user]);

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const handleNextMonth = () => {
        setCurrentDate(currentDate.add(1, 'month'));
    };

    const handlePrevMonth = () => {
        setCurrentDate(currentDate.subtract(1, 'month'));
    };

    const handleOpenModalPost = (post: Post, index: number) => {
        setSelectedPost(post);
        setSelectedPostIndex(index);
        setOpenModalPost(true);
    };

    const handleCloseModalPost = () => {
        setSelectedPost(null);
        setSelectedPostIndex(null);
        setOpenModalPost(false);
    };

    const handleOpenModalEvent = (date: string) => {
        setSelectedDate(date);
        setOpenModalEvent(true);
    };

    const handleCloseModalEvent = () => {
        setSelectedDate(null);
        setOpenModalEvent(false);
    };

    const handleRegeneratePost = async () => {
        if (!selectedPost || selectedPostIndex === null || !personaId) {
            console.error("Missing required data for regeneration:", {
                selectedPost: !!selectedPost,
                selectedPostIndex,
                personaId
            });
            return;
        }

        try {
            setIsRegenerating(true);
            const idToken = await user?.getIdToken();
            
            const regenerateData: RegeneratePostData = {};
            if (customPrompt.trim()) {
                regenerateData.customPrompt = customPrompt.trim();
            }
            
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/posts/${personaId}/${selectedPostIndex}/regenerate`,
                regenerateData,
                {
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                }
            );

            if (response.data.generated_posts) {
                setPosts(response.data.generated_posts);
                setSelectedPost(response.data.generated_posts[selectedPostIndex]);
                setCustomPrompt(''); // Clear the prompt after successful regeneration
            }
        } catch (error) {
            console.error('Error regenerating post:', error);
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleEventSubmit = async () => {
        if (selectedDate && user) {
            try {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/events`, {
                    ...eventData,
                    eventDate: selectedDate,
                    userId: user.uid
                }, {
                    headers: {
                        'Authorization': `Bearer ${await user.getIdToken()}`
                    }
                });

                setEvents(prev => ({
                    ...prev,
                    [selectedDate]: eventData
                }));

                handleCloseModalEvent();
            } catch (error) {
                console.error('Error saving event:', error);
            }
        }
    };

    const renderCalendar = () => {
        const daysInMonth = currentDate.daysInMonth();
        const calendarDays = [];

        for (let i = 1; i <= daysInMonth; i++) {
            const currentDay = currentDate.date(i).format('YYYY-MM-DD');
            const post = Object.values(posts).find(p => p.Post_date === currentDay);
            const event = events[currentDay];
            const postIndex = parseInt(Object.keys(posts).find(key => posts[key] === post) || "-1");

            calendarDays.push(
                <Box
                    key={i}
                    sx={{
                        flexBasis: 'calc(25% - 40px)',
                        minWidth: '150px',
                        border: '1px solid',
                        borderColor: 'primary.main',
                        borderRadius: 2,
                        padding: 2,
                        minHeight: 150,
                        backgroundColor: post ? 'lightgrey' : 'background.paper',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <Typography
                        sx={{ 
                            fontSize: '1.25rem',
                            fontWeight: 'bold'
                        }}
                    >
                        {i}
                    </Typography>
                    
                    <IconButton
                        onClick={() => handleOpenModalEvent(currentDay)}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                    >
                        <AddIcon />
                    </IconButton>

                    {event && (
                        <Box sx={{ mt: 1, p: 1, bgcolor: 'primary.light', borderRadius: 1 }}>
                            <Typography>
                                {event.eventName}
                            </Typography>
                        </Box>
                    )}

                    {post && (
                        <Box
                            onClick={() => handleOpenModalPost(post, postIndex)}
                            sx={{ 
                                mt: 1,
                                cursor: 'pointer',
                                '&:hover': { opacity: 0.8 }
                            }}
                        >
                            <Typography
                                noWrap
                                sx={{ fontSize: '0.875rem' }}
                            >
                                {post.Post_content.substring(0, 100)}...
                            </Typography>
                        </Box>
                    )}
                </Box>
            );
        }

        return calendarDays;
    };

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
                  className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 bg-gray-100 dark:bg-gray-700"
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
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Your Content Calendar</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Here's your AI-generated posting schedule. Add events, customize posts, and manage your content.
                </p>
              </div>
      
              <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 1 }}>
                {/* Calendar Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <IconButton onClick={handlePrevMonth}>
                    <ArrowBackIosIcon />
                  </IconButton>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {currentDate.format('MMMM YYYY')}
                  </Typography>
                  <IconButton onClick={handleNextMonth}>
                    <ArrowForwardIosIcon />
                  </IconButton>
                </Box>
      
                {/* Calendar Grid */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {renderCalendar()}
                </Box>
              </Box>
      
              {/* Post Modal */}
              <Modal open={openModalPost} onClose={handleCloseModalPost}>
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 400,
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 2,
                }}>
                  <IconButton
                    onClick={handleCloseModalPost}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                  >
                    <CloseIcon />
                  </IconButton>
                  {selectedPost && (
                    <>
                      <Typography sx={{ mb: 3, fontWeight: 'bold', fontSize: '1.25rem' }}>
                        Post Content
                      </Typography>
                      <Typography sx={{ mb: 3 }}>
                        {selectedPost.Post_content}
                      </Typography>
                      
                      <FormControl component="div" orientation="vertical" sx={{ mb: 3, width: '100%' }}>
                        <FormLabel>Custom Regeneration Prompt (Optional)</FormLabel>
                        <Textarea
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          minRows={3}
                          maxRows={6}
                          placeholder="Add specific instructions or topics for the regenerated post..."
                          sx={{ mt: 1 }}
                        />
                      </FormControl>
      
                      <Button
                        onClick={handleRegeneratePost}
                        disabled={isRegenerating}
                        variant="outlined"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2 }}
                      >
                        {isRegenerating ? 'Regenerating...' : 'Regenerate Post'}
                      </Button>
                    </>
                  )}
                </Box>
              </Modal>
      
              {/* Event Modal */}
              <Modal open={openModalEvent} onClose={handleCloseModalEvent}>
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 400,
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 2,
                }}>
                  <IconButton
                    onClick={handleCloseModalEvent}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                  >
                    <CloseIcon />
                  </IconButton>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 'bold', mb: 2 }}>
                    Add Event
                  </Typography>
                  <FormControl sx={{ mb: 2 }}>
                    <FormLabel>Event Name</FormLabel>
                    <Textarea
                      value={eventData.eventName}
                      onChange={(e) => setEventData({ ...eventData, eventName: e.target.value })}
                    />
                  </FormControl>
                  <FormControl sx={{ mb: 2 }}>
                    <FormLabel>Type</FormLabel>
                    <Select
                      value={eventData.engagementType}
                      onChange={(_, value) => setEventData({ ...eventData, engagementType: value || 'Conferences' })}
                    >
                      <Option value="Conferences">Conferences</Option>
                      <Option value="Meet-ups">Meet-ups</Option>
                      <Option value="Twitter Content">Twitter Content</Option>
                      <Option value="Instagram Content">Instagram Content</Option>
                    </Select>
                  </FormControl>
                  <Button onClick={handleEventSubmit} fullWidth>
                    Save Event
                  </Button>
                </Box>
              </Modal>
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
        </div>
      );
};

export default ContentSchedule;