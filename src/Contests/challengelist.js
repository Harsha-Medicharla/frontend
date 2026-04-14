import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { styles } from '../styles';
import { supabase } from '../supabase/supabase';

const ChallengesPage = () => {
  const [challengeNames, setChallengeNames] = useState([]);
  const [contestData, setContestData] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallenges = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to submit", { position: "top-center", autoClose: 3000, theme: "dark" });
        return;
      }
      try {
        const uemail = user.email;
        const { data: contestData, error: contestError } = await supabase.from('contests').select('*').eq('uemail', uemail).single();
        if (contestError) {
          throw contestError;
        }
        
        setChallengeNames(contestData.questions);
        setContestData(contestData);
        console.log(contestData)
        const endTime = new Date(contestData.startTime).getTime() + contestData.duration * 60000; // Convert duration to milliseconds
        const timer = setInterval(() => {
          const remaining = calculateRemainingTime(endTime);
          setRemainingTime(remaining);
        }, 1000);
        return () => clearInterval(timer);
      } catch (error) {
        console.error('Error fetching challenges:', error.message);
      }
    };
    fetchChallenges();
  }, []);

  const calculateRemainingTime = (endTime) => {
    const now = new Date();
    const timeDiff = Math.max(endTime - now, 0);
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    return {
      days,
      hours,
      minutes,
      seconds
    };
  };

  const formatTime = (time) => {
    return time < 10 ? `0${time}` : time;
  };

  const remainingTimeString = () => {
    if (!remainingTime) return '';

    const { days, hours, minutes, seconds } = remainingTime;
    if (days > 0) return `${days}d ${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;
    return `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;
  };

  return (
    <div>
           {remainingTime && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          {remainingTime.days === 0 && remainingTime.hours === 0 && remainingTime.minutes === 0 && remainingTime.seconds === 0 ? (
            <><div class="bg-gray-200 p-4 rounded-lg">
            <div class="text-lg font-bold mb-2">Contest ended</div>
            <div class="text-sm">Total {contestData.points} Points Earned. Keep Practicing and Learning DSA.</div>
        </div>
</>        
          )  :  ( <div className="container mx-auto px-4">
          <h2 className={`${styles.questionsHeadText} text-center color-black`}>Challenges</h2>
          <div className="text-center my-4">
            <p className="text-lg font-semibold">Remaining Time:</p>
            <div className="flex items-center justify-center">
              <p className="text-2xl font-bold text-blue-500">{remainingTimeString()}</p>
            </div>
          </div></div>
      )}</div>)}
      {!remainingTime || (remainingTime.days !== 0 || remainingTime.hours !== 0 || remainingTime.minutes !== 0 || remainingTime.seconds !== 0) && (
        <div >
        {challengeNames.map((challengeName, index) => (
          <div key={index} className="bg-gray-200 h-16 flex items-center justify-center rounded-md">
            <Link to={`/contestproblems/${challengeName}`} className="hover:text-blue-600 cursor-pointer text-lg font-semibold">
              {challengeName}
            </Link>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default ChallengesPage;
