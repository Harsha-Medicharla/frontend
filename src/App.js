import ProblemsTable from "./components/ProblemsTable/ProblemsTable";
import Topbar from "./components/Topbar/Topbar";
import { useState, useEffect } from "react";
import useHasMounted from './Hooks/useHasmounted'
import { supabase } from "./supabase/supabase";
import AnimatedGrid from "./components/AnimatedGrid";

function App() {
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const problems = useGetProblems(setLoadingProblems);

  const filteredProblems = problems.filter(problem => {
    if (selectedDifficulty && problem.difficulty !== selectedDifficulty) {
      return false;
    }
    if (selectedType && problem.category !== selectedType) {
      return false;
    }
    return true;
  });

  const handleDifficultyFilter = (difficulty) => {
    setSelectedDifficulty(difficulty);
  };

  const handleTypeFilter = (type) => {
    setSelectedType(type);
  };

  const resetFilters = () => {
    setSelectedDifficulty(null);
    setSelectedType(null);
  };

  const hasMounted = useHasMounted();
  if (!hasMounted) return null;

  return (
    <main className="relative min-h-screen bg-dark-layer-2/80">
      <AnimatedGrid />
      <Topbar />
      <div className="flex gap-5 py-10 justify-evenly relative z-10">
        <div className="md:w-56 flex flex-wrap justify-start h-64 gap-3">
          <span className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 ${
            !selectedDifficulty && !selectedType 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
              : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
          }`} onClick={() => resetFilters()}>All</span>
          <span className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 ${
            selectedDifficulty === "Easy" 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
              : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
          }`} onClick={() => handleDifficultyFilter("Easy")}>Easy</span>
          <span className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 ${
            selectedDifficulty === "Medium" 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
              : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
          }`} onClick={() => handleDifficultyFilter("Medium")}>Medium</span>
          <span className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 ${
            selectedDifficulty === "Hard" 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
              : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
          }`} onClick={() => handleDifficultyFilter("Hard")}>Hard</span>
          <span className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 ${
            selectedType === "Dynamic Programming" 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
              : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
          }`} onClick={() => handleTypeFilter("Dynamic Programming")}>Dynamic Programming</span>
          <span className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 ${
            selectedType === "Two Pointers" 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
              : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
          }`} onClick={() => handleTypeFilter("Two Pointers")}>Two Pointers</span>
          <span className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 ${
            selectedType === "Array" 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
              : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
          }`} onClick={() => handleTypeFilter("Array")}>Array</span>
          <span className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 ${
            selectedType === "Binary Search" 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
              : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
          }`} onClick={() => handleTypeFilter("Binary Search")}>Binary Search</span>
          <span className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 ${
            selectedType === "Binary Tree" 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
              : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
          }`} onClick={() => handleTypeFilter("Binary Tree")}>Binary Tree</span>
          <span className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 ${
            selectedType === "Intervals" 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
              : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
          }`} onClick={() => handleTypeFilter("Intervals")}>Intervals</span>
          <span className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 ${
            selectedType === "Sliding Window" 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
              : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
          }`} onClick={() => handleTypeFilter("Sliding Window")}>Sliding Window</span>
          <span className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 ${
            selectedType === "Bit Manipulation" 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
              : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
          }`} onClick={() => handleTypeFilter("Bit Manipulation")}>Bit Manipulation</span>
          <span className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 ${
            selectedType === "Back Tracking" 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
              : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
          }`} onClick={() => handleTypeFilter("Back Tracking")}>Back Tracking</span>
        </div>
        <div className="overflow-x-auto md:w-1/2 flex flex-col">
          {loadingProblems && (
            <div className="max-w-[1200px] mx-auto sm:w-7/12 w-full animate-pulse">
              {[...Array(10)].map((_, idx) => (
                <LoadingSkeleton key={idx} />
              ))}
            </div>
          )}
          <div className="w-full max-w-[1200px] mx-auto">
            <ProblemsTable filteredProblems={filteredProblems} />
          </div>
        </div>
        </div>
    </main>
  );
}

function useGetProblems(setLoadingProblems) {
  const [problems, setProblems] = useState([])

  useEffect(() => {
    const fetchProblems = async () => {
      setLoadingProblems(false)
      try {
        const { data, error } = await supabase
          .from('Problems')
          .select()
          .order('order', { ascending: true });

        if (error) {
          console.error('Error fetching problems:', error);
        } else if (data) {
          setProblems(data)
          setLoadingProblems(false)
        }
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };
    fetchProblems();
  }, [setLoadingProblems])
  return problems;
}

export default App;

const LoadingSkeleton = () => {
  return (
    <div className="flex items-center space-x-12 mt-4 px-6">
      <div className="w-6 h-6 shrink-0 rounded-full bg-dark-layer-1"></div>
      <div className="h-4 sm:w-52  w-32  rounded-full bg-dark-layer-1"></div>
      <div className="h-4 sm:w-52  w-32 rounded-full bg-dark-layer-1"></div>
      <div className="h-4 sm:w-52 w-32 rounded-full bg-dark-layer-1"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};