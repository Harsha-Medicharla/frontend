// ContestForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../supabase/supabase';
const HostContestForm = () => {
  const navigate = useNavigate();
  const [contestDetails, setContestDetails] = useState({
    name: '',
    startTime: '',
    endTime: '',
    duration: '',
    organizationName: '',
    organizationType: '',
    numberOfQuestions: 0,
    uemail : '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContestDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log(user.email)
      contestDetails.uemail=user.email
      if (!user) {
        toast.error("Please log in to submit", { position: "top-center", autoClose: 3000, theme: "dark" });
        return;
      }
    const { error } = await supabase.from('hostcontests').insert(contestDetails).single();
    if (error) {
      throw error;
    }
    const { data } = await supabase.from('hostcontests').select('*').eq('name',contestDetails.name);
    console.log(data)
    navigate(`/hostcontests/${data[0].id}`);
  } catch (error) {
    console.error('Error inserting contest:', error.message);
  } 
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-1 font-semibold">Contest Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={contestDetails.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
            placeholder="Enter Contest Name"
            required
          />
        </div>
        <div>
          <label htmlFor="startTime" className="block mb-1 font-semibold">Start Time</label>
          <input
            type="datetime-local"
            id="startTime"
            name="startTime"
            value={contestDetails.startTime}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="endTime" className="block mb-1 font-semibold">End Time</label>
          <input
            type="datetime-local"
            id="endTime"
            name="endTime"
            value={contestDetails.endTime}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="duration" className="block mb-1 font-semibold">Duration (in hours)</label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={contestDetails.duration}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
            placeholder="Enter Duration"
            required
          />
        </div>
        <div>
          <label htmlFor="organizationName" className="block mb-1 font-semibold">Organization Name</label>
          <input
            type="text"
            id="organizationName"
            name="organizationName"
            value={contestDetails.organizationName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
            placeholder="Enter Organization Name"
            required
          />
        </div>
        <div>
          <label htmlFor="organizationType" className="block mb-1 font-semibold">Organization Type</label>
          <select
            id="organizationType"
            name="organizationType"
            value={contestDetails.organizationType}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
            required
          >
            <option value="">Select Organization Type</option>
            <option value="Company">Company</option>
            <option value="University">University</option>
            <option value="Community">Community</option>
            {/* Add more options as needed */}
          </select>
        </div>
        <div>
          <label htmlFor="numberOfQuestions" className="block mb-1 font-semibold">Number of Questions</label>
          <input
            type="number"
            id="numberOfQuestions"
            name="numberOfQuestions"
            value={contestDetails.numberOfQuestions}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
            placeholder="Enter Number of Questions"
            required
          />
        </div>
        <button type="submit"  className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600">Create Contest</button>
      </form>
    </div>
  );
};

export default HostContestForm;
