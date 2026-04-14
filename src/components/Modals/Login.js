import React from 'react'
import { useSetRecoilState } from 'recoil';
import { authModalState } from '../../atoms/authModalAtom';
import { supabase } from '../../supabase/supabase';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

export default function Login() {
  const navigate = useNavigate();
  const setAuthModalState = useSetRecoilState(authModalState);
  const handleClick = (type) => {
    setAuthModalState((prev) => ({ ...prev, type }));
  };
  const [inputs, setInputs] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
   
  const handleInputChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!inputs.email || !inputs.password) {
      return alert('Please fill all fields');
    }

    try {
      setLoading(true);
      setError(null);

      const { user, error } = await supabase.auth.signInWithPassword({
        email: inputs.email,
        password: inputs.password,
      });

      if (error) {
        throw error;
      }

      console.log('User signed in successfully:', user);
      toast.success('Login successful', {
        position: 'top-center',
        autoClose: 3000,
        theme: 'dark',
      });

      setAuthModalState((prev) => ({ ...prev, isOpen: false }));
      navigate('/problems');
    } catch (error) {
      setError(error.message);
      toast.error(error.message, {
        position: 'top-center',
        autoClose: 3000,
        theme: 'dark',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error)
    toast.error(error.message, {
      position: "top-center",
      autoClose: 3000,
      theme: "dark",
    });
  }, [error]);
  
  return (
    <form className="space-y-6 px-6 pb-4" onSubmit={handleLogin}>
      <h3 className="text-xl font-medium text-white">Sign in to CodeCraft</h3>
      <div>
        <label
          htmlFor="email"
          className="text-sm font-medium block mb-2 text-gray-300"
        >
          Your Email
        </label>
        <input
          onChange={handleInputChange}
          type="email"
          name="email"
          id="email"
          className="
            border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
            bg-gray-600 border-gray-500 placeholder-gray-400 text-white
          "
          placeholder="name@company.com"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="text-sm font-medium block mb-2 text-gray-300"
        >
          Your Password
        </label>
        <input
          onChange={handleInputChange}
          type="password"
          name="password"
          id="password"
          className="
            border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
            bg-gray-600 border-gray-500 placeholder-gray-400 text-white
          "
          placeholder="*******"
        />
      </div>

      <button
        type="submit"
        className="w-full text-white focus:ring-blue-300 font-medium rounded-lg
        text-sm px-5 py-2.5 text-center bg-brand-orange hover:bg-brand-orange-s
      ">
        {loading ? "Loading..." : "Log In"}
      </button>
      <button
        className="flex w-full justify-end"
      >
        <a
          href="#"
          className="text-sm block text-brand-orange hover:underline w-full text-right"
          onClick={() => handleClick("forgotPassword")}
        >
          Forgot Password?
        </a>
      </button>
      <div className="text-sm font-medium text-gray-300">
        Not Registered?{" "}
        <button
          className="text-blue-700 hover:underline"
          onClick={() => handleClick("register")}
        >
          Create account
        </button>
      </div>
    </form>
  )
}