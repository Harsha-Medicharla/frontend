import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import AuthModal from '../../components/Modals/AuthModal';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { authModalState } from '../../atoms/authModalAtom';
import { supabase } from '../../supabase/supabase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AuthPage() {
  const navigate = useNavigate();
  const authModal = useRecoilValue(authModalState);
  const setAuthModalState = useSetRecoilState(authModalState);
  const [user, setUser] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const getUserSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching user session:', error.message);
        return null;
      }

      return session?.user;
    };

    const fetchData = async () => {
      const userData = await getUserSession();
      setUser(userData);
      setPageLoading(false);

      if (userData) {
        navigate('/problems');
      }
    };

    fetchData();
  }, [navigate]);

  if (pageLoading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Navbar />
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-[calc(100vh-5rem)] -mt-8">
          {/* Left side - Hero content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:w-1/2 text-center lg:text-left mb-8 lg:mb-0 -mt-12"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Master Coding with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 block">
                CodeCraft
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-6 max-w-lg">
              Practice coding problems, collaborate with peers, and improve your skills with our interactive platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {!user ? (
                <button
                  onClick={() => setAuthModalState((prev) => ({ ...prev, isOpen: true }))}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Get Started
                </button>
              ) : (
                <button
                  onClick={() => navigate('/problems')}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Continue Learning
                </button>
              )}
              <button
                onClick={() => navigate('/problems')}
                className="px-8 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
              >
                View Problems
              </button>
              <button
                onClick={() => navigate('/learn')}
                className="px-8 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
              >
                Learn More
              </button>
            </div>
          </motion.div>

          {/* Right side - Hero image */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:w-1/2 relative -mt-4"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
              <img 
                src="/hero.png" 
                alt="Hero img" 
                className="relative z-10 w-full max-w-lg mx-auto"
              />
            </div>
          </motion.div>
        </div>
      </div>
      {authModal.isOpen && <AuthModal/>}
    </div>
  )
}