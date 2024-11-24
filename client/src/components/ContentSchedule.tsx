import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import dayjs from 'dayjs';
import { FaSignOutAlt, FaUser, FaPlus } from 'react-icons/fa';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    IconButton,
    Modal,
    Textarea,
    CircularProgress,
    Typography,
    Select,
    Option,
} from "@mui/joy";

interface Post {
    Post_content: string;
    Post_date: string;
}

interface EventData {
    eventName: string;
    engagementType: string;
    description: string;
    contacts: string;
    deadlines: string;
    eventDate: string;
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
    const [openModalEvent, setOpenModalEvent] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
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
            } else {
                try {
                    console.log("Fetching posts from API for user:", user?.uid);
                    const idToken = await user?.getIdToken();
                    const response = await axios.get(
                        'http://localhost:8000/api/schedule/' + user?.uid,
                        {
                            headers: {
                                'Authorization': `Bearer ${idToken}`
                            }
                        }
                    );
                    console.log("API Response:", response.data);
                    setPosts(response.data.generated_posts);
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

    const handleOpenModalPost = (post: Post) => {
        setSelectedPost(post);
        setOpenModalPost(true);
    };

    const handleCloseModalPost = () => {
        setSelectedPost(null);
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

    const handleEventSubmit = async () => {
        if (selectedDate && user) {
            try {
                const response = await axios.post('http://localhost:8000/api/events', {
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
                            onClick={() => handleOpenModalPost(post)}
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
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Navigator Hub
                        </h1>
                        
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                                ) : (
                                    <FaUser className="w-6 h-6 text-gray-600" />
                                )}
                                <span className="text-sm font-medium text-gray-700">
                                    {user?.displayName || user?.email}
                                </span>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                            >
                                <FaSignOutAlt className="mr-2" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Your Content Calendar</h2>
                    <p className="text-lg text-gray-600">
                        Here's your AI-generated posting schedule. Add events, customize posts, and manage your content.
                    </p>
                </div>


                <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 1 }}>
                    {/* Calendar Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <IconButton onClick={handlePrevMonth}>
                            <ArrowBackIosIcon />
                        </IconButton>
                        <Typography
                            sx={{ 
                                fontSize: '1.5rem',
                                fontWeight: 'bold' 
                            }}
                        >
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
                            <Typography>
                                {selectedPost.Post_content}
                            </Typography>
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
                        <Typography
                            sx={{ 
                                fontSize: '1.25rem',
                                fontWeight: 'bold',
                                mb: 2 
                            }}
                        >
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
        </div>
    );
};

export default ContentSchedule;