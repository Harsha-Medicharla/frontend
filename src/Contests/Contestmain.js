import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase/supabase';

const ContestDetailsPage = () => {
  const navigate = useNavigate()
  const { contestId } = useParams();
  const [confirm,setConfirm] = useState(false)
  const [selectedChallenges, setSelectedChallenges] = useState([]);
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    const { data, error } = await supabase.from('Problems').select('*');
    if (error) {
      console.error('Error fetching challenges:', error.message);
    } else {
      setChallenges(data);
    }
  };

  const handleChallengeSelection = (challengeId) => {
    // Toggle challenge selection
    const isSelected = selectedChallenges.includes(challengeId);
    if (isSelected) {
      setSelectedChallenges(selectedChallenges.filter(id => id !== challengeId));
    } else {
      setSelectedChallenges([...selectedChallenges, challengeId]);
    }
  };

  const handleSubmit = async () => {
    const { error } = await supabase.from('contests').update({ questions: selectedChallenges }).eq('id', contestId);
    if (error) {
      console.error('Error updating contest with selected challenges:', error.message);
    } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return;
        }
        console.log(user.email)
        setConfirm(true)
        const {data : userdata} = await supabase.from('contestusers').select('*').eq('email',user.email)
        console.log(userdata)
        const currentDateTime = new Date().toISOString();
        await supabase.from('contests').update({ startTime: currentDateTime }).eq('id', contestId);
        navigate(`/contests/challenges`)
    }
  };

  return (
    <div>
      {confirm ? (
        <p>Already selected</p>
      ) : (
        <>
        <h2>Challenges</h2>
        {challenges.map(challenge => (
          <div key={challenge.id}>
            <input
              type="checkbox"
              id={challenge.id}
              onChange={() => handleChallengeSelection(challenge.id)}
              checked={selectedChallenges.includes(challenge.id)}
            />
            <label htmlFor={challenge.id}>{challenge.id}</label>
          </div>
        ))}
        <button onClick={handleSubmit}>Submit</button>
      </>
      )}
    </div>
  );
  
};

export default ContestDetailsPage;