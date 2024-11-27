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
      <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 z-50">
      <div className="flex flex-col md:flex-row justify-between items-center h-auto md:h-16 px-4 py-2 md:px-8">
        {/* Logo section */}
        <div className="w-full md:w-auto flex justify-between items-center">
          <a href="/" className="flex items-center">
            <h1 className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
              Navigator Hub
            </h1>
          </a>
          
          {/* Mobile Menu Button - Only show on mobile */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={() => scrollToSection(productsRef)}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
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

        {/* Desktop Menu - Hide on mobile */}
        <div className="hidden md:flex items-center gap-12">
          <button
            onClick={() => scrollToSection(productsRef)}
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
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
        className="relative min-h-screen flex items-center justify-center transform transition-all duration-1000 scale-90 opacity-0 px-4 md:px-0"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo animation */}
            <div className="mb-8 animate-bounce-slow">
              <div className="inline-block p-2 rounded-full bg-blue-100">
                <div className="p-2 sm:p-4 rounded-full bg-blue-200">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 animate-fade-in">
              Boost your Career With Us!
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-gray-600 mb-4 sm:mb-6 px-4 animate-fade-in-delay-1">
              Where Mentors and Mentees Connect, Learn, and Grow Together
            </p>

            {/* Description */}
            <p className="text-lg sm:text-xl text-gray-600 mb-8 px-4 animate-fade-in-delay-2">
              Join our vibrant community of professionals and aspirants. Whether you're looking to share your expertise or seeking guidance, Navigator Hub is your platform for meaningful career connections.
            </p>

            {/* CTA Button */}
            <button
              onClick={handleGetStarted}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all animate-fade-in-delay-3"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <button
            onClick={() => scrollToSection(productsRef)}
            className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-all"
            aria-label="Scroll to products"
          >
            <FaArrowDown className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Products Section */}
      <section 
        ref={productsRef}
        className="relative min-h-screen flex items-center transform transition-all duration-1000 scale-90 opacity-0 py-20"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Explore Our Products
          </h2>
          <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Influence Navigator Card */}
            <div className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="mb-6">
                <h3 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Influence Navigator
                </h3>
                <p className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-6">
                  Strategically Grow Your Personal Influence with AI Assistance
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Influence Navigator is your ultimate tool for building and managing your personal influence in professional circles. Whether you're looking to enhance your LinkedIn presence, establish thought leadership, or strategically share your growth journey, our AI-powered platform offers:
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">AI-Driven Content Guidance</h4>
                    <p className="text-gray-600 dark:text-gray-400">Personalized content suggestions, posting strategies, and analytics to amplify your professional voice.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">Growth Tracking and Insights</h4>
                    <p className="text-gray-600 dark:text-gray-400">Measure the impact of your posts, audience engagement, and influence metrics with actionable insights.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">Content Calendar Feature</h4>
                    <p className="text-gray-600 dark:text-gray-400">Stay consistent with a strategic content plan tailored to your personal brand goals.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">Elite Achievers' Community</h4>
                    <p className="text-gray-600 dark:text-gray-400">Unlock exclusive networking opportunities with our top-tier influencers and achievers.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Talent Navigator Card */}
            <div className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="mb-6">
                <h3 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  Talent Navigator
                </h3>
                <div className="inline-block px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 text-sm font-semibold mb-4">
                  Coming Soon
                </div>
                <p className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-6">
                  Unlock Your Talent Potential with AI-Enhanced Guidance
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Talent Navigator is your personal roadmap to skill mastery and career growth. Whether you're advancing your product management skills or exploring new career paths, this AI-powered platform provides:
                </p>
              </div>

              <div className="space-y-6 opacity-75">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">Goal Discovery and Learning Plans</h4>
                    <p className="text-gray-600 dark:text-gray-400">Identify, prioritize, and execute on your career goals with tailored AI suggestions.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">Personalized Skill Development</h4>
                    <p className="text-gray-600 dark:text-gray-400">Access structured learning paths aligned with your aspirations and professional needs.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">Real-World Opportunities</h4>
                    <p className="text-gray-600 dark:text-gray-400">Engage in project-based learning, mentorship programs, and exclusive career opportunities.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">Gamified Achievements</h4>
                    <p className="text-gray-600 dark:text-gray-400">Stay motivated with Achiever Points and unlock access to elite communities and industry events.</p>
                  </div>
                </div>
              </div>
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