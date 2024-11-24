import React, { useEffect, useRef } from 'react';
import { FaLinkedin, FaArrowDown, FaEnvelope  } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const heroRef = useRef<HTMLElement | null>(null);
  const productsRef = useRef<HTMLElement | null>(null);
  const socialRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scale-100', 'opacity-100');
            entry.target.classList.remove('scale-90', 'opacity-0');
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "0px"
      }
    );

    if (heroRef.current) observer.observe(heroRef.current);
    if (productsRef.current) observer.observe(productsRef.current);
    if (socialRef.current) observer.observe(socialRef.current);

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/chat');
    } else {
      navigate('/login');
    }
  };
  return (
    <div className="relative min-h-screen font-sans overflow-x-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-blue-200 animate-gradient-xy" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white z-50">
        <div className="flex justify-between items-center h-16 px-8">
          <div className="absolute left-8">
            <a href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">
                Navigator Hub
              </h1>
            </a>
          </div>
          <div className="absolute right-8 flex items-center gap-12">
            <button
              onClick={() => scrollToSection(productsRef)}
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Products
            </button>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Login
              </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center transform transition-all duration-1000 scale-90 opacity-0"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8 animate-bounce-slow">
              <div className="inline-block p-2 rounded-full bg-blue-100">
                <div className="p-4 rounded-full bg-blue-200">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600" />
                </div>
              </div>
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
              Boost your Career With Us!
            </h1>
            <p className="text-2xl text-gray-600 mb-6 animate-fade-in-delay-1">
              Where Mentors and Mentees Connect, Learn, and Grow Together
            </p>
            <p className="text-xl text-gray-600 mb-8 animate-fade-in-delay-2">
              Join our vibrant community of professionals and aspirants. Whether you're looking to share your expertise or seeking guidance, Navigator Hub is your platform for meaningful career connections.
            </p>
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all animate-fade-in-delay-3"
            >
              Get Started
            </button>
          </div>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <button
              onClick={() => scrollToSection(productsRef)}
              className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-all"
            >
              <FaArrowDown className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section 
        ref={productsRef}
        className="relative min-h-screen flex items-center transform transition-all duration-1000 scale-90 opacity-0"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Explore Our Products
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="group p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-2 cursor-pointer">
              <h3 className="text-2xl font-semibold mb-3 text-blue-600">Influence Navigator</h3>
              <p className="text-gray-600 text-lg">
                Increase your reach on social media with our AI posts generator feature
              </p>
            </div>
            <div className="group p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-2">
              <h3 className="text-2xl font-semibold mb-3 text-purple-600">Talent Navigator</h3>
              <p className="text-gray-600 text-lg">Coming Soon...</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section 
        ref={socialRef}
        className="relative min-h-screen flex items-center transform transition-all duration-1000 scale-90 opacity-0"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Connect With Us
          </h2>
          <div className="flex justify-center items-center gap-8">
            <a 
              href="https://www.linkedin.com/company/navigator-hub/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block p-4 rounded-full bg-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
            >
              <FaLinkedin className="w-12 h-12 text-blue-600 hover:text-blue-700" />
            </a>
            <a 
              href="mailto:hello@navhub.ai"
              className="inline-flex items-center gap-3 p-4 rounded-full bg-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
            >
              <FaEnvelope className="w-12 h-12 text-blue-600 hover:text-blue-700" />
              <span className="text-lg font-medium text-blue-600 pr-4">hello@navhub.ai</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-r from-blue-900 to-purple-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div>
              <h3 className="text-2xl font-bold mb-4">Navigator Hub</h3>
              <p className="text-gray-300">Empowering careers through connection and mentorship</p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a></li>
                <li><a href="/login" className="text-gray-300 hover:text-white transition-colors">Login</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/" className="text-gray-300 hover:text-white transition-colors">Terms & Conditions</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p>© 2024 Navigator Hub | All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;