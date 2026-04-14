import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSetRecoilState } from 'recoil';
import { authModalState } from '../../atoms/authModalAtom';
import { supabase } from '../../supabase/supabase';
import { FiLogOut } from 'react-icons/fi';

export default function Navbar() {
  const setAuthModalState = useSetRecoilState(authModalState);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const getUserSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching user session:', error.message);
        return null;
      }

      setUser(session?.user);
    };

    getUserSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleClick = () => {
    setAuthModalState((prev) => ({ ...prev, isOpen: true }));
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error.message);
    }
  };

  const handlelearn = () => {
    navigate(`/learn`)
  }

  return (
    <div className="flex items-center justify-between py-4">
      <Link to="/" className="flex items-center">
        <img src="/logonew-removebg.png" alt="CodeCraft" className="h-28 w-28" />
      </Link>
      <div className="flex items-center justify-center flex-1 space-x-16 ml-[30rem]">
        <button
          className="px-6 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
          onClick={() => navigate('/problems')}
        >
          Problems
        </button>
        <button
          className="px-6 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
          onClick={handlelearn}
        >
          Learn
        </button>
        {!user ? (
          <button
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={handleClick}
          >
            Sign In
          </button>
        ) : (
          <div className="flex items-center space-x-4">
            <div className="cursor-pointer group relative">
              <img src="/avatar.png" alt="Avatar" width={30} height={30} className="rounded-full" />
              <div className="absolute top-10 left-2/4 -translate-x-2/4 mx-auto bg-dark-layer-1 p-2 rounded shadow-lg z-40 group-hover:scale-100 scale-0 transition-all duration-300 ease-in-out">
                <p className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">{user.email}</p>
              </div>
            </div>
            <button
              className="px-6 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
              onClick={handleLogout}
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
