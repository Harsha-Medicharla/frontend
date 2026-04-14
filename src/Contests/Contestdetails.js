// ContestForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar/Topbar';
import { toast } from 'react-toastify';
import { supabase } from '../supabase/supabase';
const ContestForm = () => {
  const navigate = useNavigate();
  const [contestData, setContestData] = useState({
    contestName: '',
    //startTime: '',
    //endTime: '',
    duration : '',
    uemail: '',
    organizationType: '',
    organizationName: '',
  });

  const handleChange = (e) => {
    setContestData({ ...contestData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log(user.email)
        contestData.uemail=user.email
        if (!user) {
          toast.error("Please log in to submit", { position: "top-center", autoClose: 3000, theme: "dark" });
          return;
        }
      const { error } = await supabase.from('contests').insert(contestData).single();
      if (error) {
        throw error;
      }
      const { data } = await supabase.from('contests').select('*').eq('contestName',contestData.contestName);
      console.log(data)
      navigate(`/contests/${data[0].id}`);
    } catch (error) {
      console.error('Error inserting contest:', error.message);
    }
  }
  

  return (
    <>
    <Topbar />
    <br></br>
    <div className="max-w-md mx-auto mt-8 bg-black">
     <form className="space-y-6 px-6 pb-4 overflow-y-auto h-screen" onSubmit={handleSubmit}>
      <h3 className="text-xl font-medium text-white my-10">CREATE YOUR OWN CONTEST</h3>
      
      <div>
        <label htmlFor="contestName" className="text-sm font-medium block mb-2 text-gray-300">
          Contest Name
        </label>
        <input
        onChange={handleChange}
          type="text"
          name="contestName"
          id="contestName"
          className="
        border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
        bg-gray-600 border-gray-500 placeholder-gray-400 text-white
    "
          placeholder="Your Contest Name"
          required
        />
      </div>
      <div>
          <label htmlFor="duration" className="text-sm font-medium block mb-2 text-gray-300">Duration (in minutes)</label>
          <input
            type="text"
            id="duration"
            name="duration"
            value={contestData.duration}
            onChange={handleChange}
            className=" border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
            bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="organizationName" className="text-sm font-medium block mb-2 text-gray-300">Organization Name</label>
          <input
            type="text"
            id="organizationName"
            name="organizationName"
            value={contestData.organizationName}
            onChange={handleChange}
            className=" border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
            bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
            placeholder="Enter Organization Name"
            required
          />
        </div>
        <div>
          <label htmlFor="organizationType" className="text-sm font-medium block mb-2 text-gray-300">Organization Type</label>
          <select
            id="organizationType"
            name="organizationType"
            value={contestData.organizationType}
            onChange={handleChange}
            className=" border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
            bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
            required
          >
            <option value="">Select Organization Type</option>
            <option value="Company">Company</option>
            <option value="University">University</option>
            <option value="Community">Community</option>
            {/* Add more options as needed */}
          </select>
        </div>
        <button
        type="submit"
        className="w-full text-white focus:ring-blue-300 font-medium rounded-lg
            text-sm px-5 py-2.5 text-center bg-brand-orange hover:bg-brand-orange-s
        "
      >SUBMIT</button>
      </form>
    </div></>
  );
};

export default ContestForm;