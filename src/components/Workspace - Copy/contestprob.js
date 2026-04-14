import React, { useEffect, useState } from 'react';
import { BsCheckCircle } from 'react-icons/bs';
import { AiFillYoutube } from 'react-icons/ai';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/supabase';

export default function ProblemsTable({ setLoadingProblems }) { 
    const [selectedChallenges, setSelectedChallenges] = useState([]);
    const problems = useGetProblems(setLoadingProblems);
    const solvedProblems = useGetSolvedProblems();
    const { contestId } = useParams();
    const navigate = useNavigate();

    const handleChallengeSelection = (challengeId) => {
        // Toggle challenge selection
        setSelectedChallenges(prevSelectedChallenges => {
            if (prevSelectedChallenges.includes(challengeId)) {
                return prevSelectedChallenges.filter(id => id !== challengeId);
            } else {
                return [...prevSelectedChallenges, challengeId];
            }
        });
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
            console.log(user.email);
            const { data: userdata } = await supabase.from('contestusers').select('*').eq('email', user.email);
            console.log(userdata);
            const currentDateTime = new Date().toISOString();
            await supabase.from('contests').update({ startTime: currentDateTime }).eq('id', contestId);
            navigate(`/contests/challenges`);
        }
    };

    return (
        <>
                <tbody className="text-white">
                    {problems.map((problem, idx) => {
                        const difficultyColor =
                            problem.difficulty === "Easy"
                                ? "text-dark-green-s"
                                : problem.difficulty === "Medium"
                                    ? "text-dark-yellow"
                                    : "text-dark-pink";
                        return (
                            <tr className={`${idx % 2 === 1 ? "bg-dark-layer-1" : ""}`} key={problem.id}>
                                <td className="px-2 py-4">
                                    <input
                                        type="checkbox"
                                        id={`checkbox_${problem.id}`}
                                        onChange={() => handleChallengeSelection(problem.id)}
                                        checked={selectedChallenges.includes(problem.id)}
                                    />
                                </td>
                                <td className="px-2 py-4 font-medium whitespace-nowrap text-dark-green-s">
                                    {solvedProblems && solvedProblems.includes(problem.id) && (
                                        <BsCheckCircle fontSize={"18"} width="18" />
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <Link
                                        to={`/problems/${problem.id}`}
                                        className="hover:text-blue-600 cursor-pointer"
                                    >
                                        {problem.title}
                                    </Link>
                                </td>
                                <td className={`px-6 py-4 ${difficultyColor}`}>
                                    {problem.difficulty}
                                </td>
                                <td className={"px-6 py-4"}>{problem.category}</td>
                            </tr>
                        );
                    })}
                </tbody>
                <br></br>
                <button className="w-full text-white focus:ring-blue-300 font-medium rounded-lg
                            text-sm px-5 py-2.5 text-center bg-brand-orange hover:bg-brand-orange-s" onClick={handleSubmit}>Submit</button>
        </>
    );
}

function useGetProblems(setLoadingProblems) {
    const [problems, setProblems] = useState([]);

    useEffect(() => {
        //fetch data from db
        const fetchProblems = async () => {
            setLoadingProblems(false);
            try {
                const { data, error } = await supabase
                    .from('Problems')
                    .select()
                    .order('order', { ascending: true });

                if (error) {
                    console.error('Error fetching problems:', error);
                } else if (data) {
                    setProblems(data);
                    setLoadingProblems(false);
                }
            } catch (error) {
                console.error('Error fetching problems:', error);
            }
        };
        fetchProblems();
    }, [setLoadingProblems]);
    return problems;
}

function useGetSolvedProblems() {
    const [solvedProblems, setSolvedProblems] = useState([]);

    useEffect(() => {
        const getSolvedProblems = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data, error } = await supabase
                    .from('users')
                    .select('solvedProblems')
                    .eq('id', user.id);

                if (error) {
                    console.error('Error fetching solved problems:', error);
                } else if (data && data.length > 0) {
                    setSolvedProblems(data[0].solvedProblems);
                }
            } else {
                setSolvedProblems([]);
            }
        };
        getSolvedProblems();
    }, []);

    return solvedProblems;
}
