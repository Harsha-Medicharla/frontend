import React, { useEffect, useState } from 'react'
import { AiFillYoutube } from 'react-icons/ai'
import { BsCheckCircle } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import { supabase } from '../../supabase/supabase'

export default function ProblemsTable({filteredProblems}) {
    const solvedProblems = useGetSolvedProblems();
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {filteredProblems.map((problem) => {
                const difficultyColor =
                    problem.difficulty === "Easy"
                        ? "from-dark-green-s/20 to-dark-green-s/5"
                        : problem.difficulty === "Medium"
                            ? "from-dark-yellow/20 to-dark-yellow/5"
                            : "from-dark-pink/20 to-dark-pink/5";
                const isSolved = solvedProblems && solvedProblems.includes(problem.id);
                
                return (
                    <div 
                        key={problem.id}
                        className={`bg-gradient-to-br ${difficultyColor} rounded-xl p-4 hover:shadow-xl transition-all duration-300 border border-dark-divider-border-2 hover:border-opacity-50 hover:scale-[1.02]`}
                    >
                        <div className="mb-3 flex items-center gap-2">
                            <div className="w-5 h-5 flex items-center justify-center">
                                {isSolved ? (
                                    <BsCheckCircle className="text-dark-green-s" fontSize={"18"} />
                                ) : (
                                    <div className="w-3 h-3 border border-dark-gray-6 rounded-full"></div>
                                )}
                            </div>
                            <Link 
                                to={`/problems/${problem.id}`} 
                                className="block text-white hover:text-brand-orange transition-colors duration-200 font-medium text-base"
                            >
                                {problem.title}
                            </Link>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                                problem.difficulty === "Easy"
                                    ? "bg-dark-green-s/30 text-dark-green-s border border-dark-green-s/30"
                                    : problem.difficulty === "Medium"
                                        ? "bg-dark-yellow/30 text-dark-yellow border border-dark-yellow/30"
                                        : "bg-dark-pink/30 text-dark-pink border border-dark-pink/30"
                            }`}>
                                {problem.difficulty}
                            </span>
                            <span className="text-sm text-white bg-dark-fill-3/70 px-3 py-1.5 rounded-full border border-dark-divider-border-2">
                                {problem.category}
                            </span>
                            {problem.videoId ? (
                                <a 
                                    href={`https://youtube.com/watch?v=${problem.videoId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-2 text-white hover:text-red-500 transition-colors duration-200 bg-dark-fill-3/70 px-3 py-1.5 rounded-full border border-dark-divider-border-2 hover:bg-dark-fill-3/90"
                                >
                                    <AiFillYoutube fontSize={"18"} />
                                    <span className="text-sm font-medium">Solution</span>
                                </a>
                            ) : (
                                <span className="text-sm text-dark-gray-6 bg-dark-fill-3/70 px-3 py-1.5 rounded-full border border-dark-divider-border-2">
                                    Coming soon
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    )
}

// function useGetProblems(setLoadingProblems){
//     const [problems,setProblems] = useState([])

//     useEffect(()=>{
//         //fetch data from db
//         const fetchProblems = async () => {
//             setLoadingProblems(false)
//             try {
//               const { data, error } = await supabase
//                 .from('Problems')
//                 .select()
//                 .order('order', { ascending: true });
        
//             //   console.log(data)
        
//               if (error) {
//                 console.error('Error fetching problems:', error);
//               } else if (data) {
//                 setProblems(data)
//                 setLoadingProblems(false)
//               }
//             } catch (error) {
//               console.error('Error fetching problems:', error);
//             }
//           };
//           fetchProblems();
//     },[setLoadingProblems])
//     return problems;
// }

function useGetSolvedProblems() {
    const [solvedProblems, setSolvedProblems] = useState([]);
  
    useEffect(() => {
      const getSolvedProblems = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data, error } = await supabase
                    .from('users')
                    .select('solvedProblems')
                    .eq('email', user.email)
                
                if (error) {
                    console.error('Error fetching solved problems:', error);
                } else if (data && data.length > 0) {
                    setSolvedProblems(data[0].solvedProblems || [])
                }
            } else {
                setSolvedProblems([])
            }
        } catch (error) {
            console.error('Error in getSolvedProblems:', error);
            setSolvedProblems([])
        }
      };
      getSolvedProblems();
    }, []);
  
    return solvedProblems;
}