import ContestProblemsTable from "../components/Workspace - Copy/contestprob";
import Topbar from "../components/Topbar/Topbar";
import { useState } from "react";
import useHasMounted from "../Hooks/useHasmounted";

function Select() {
  const [loadingProblems, setLoadingProblems] = useState(true);

  const hasMounted = useHasMounted();
  if (!hasMounted) return null;
  return (
    <>
      <main className="">
        <Topbar />
        <h1 className="text-2xl text-center text-white-700 dark:text-white-400 font-medium uppercase mt-10 mb-5">
        &ldquo; Choose Questions &rdquo; 👇
      </h1>
      <div className="relative overflow-x-auto mx-auto px-6 pb-10">
      {loadingProblems && (
          <div className="max-w-[1200px] mx-auto sm:w-7/12 w-full animate-pulse">
            {[...Array(10)].map((_, idx) => (
              <LoadingSkeleton key={idx} />
            ))}
          </div>
        )}
        <table className="text-sm text-left text-white-500 text-white-400 sm:w-7/12 w-full max-w-[1200px] mx-auto">
        {!loadingProblems && (
                      <thead className="text-xs text-white-700 uppercase text-white-400 border-b ">
                      <tr>
                      <th scope="col" className="px-1 py-3 w-0 font-medium">
                          Choose
                        </th>
                        <th scope="col" className="px-1 py-3 w-0 font-medium">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 w-0 font-medium">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 w-0 font-medium">
                          Difficulty
                        </th>
                        <th scope="col" className="px-6 py-3 w-0 font-medium">
                          Category
                        </th>
                      </tr>
                    </thead>
        )}
            <ContestProblemsTable setLoadingProblems={setLoadingProblems}/>
        </table>
      </div>
      </main>
    </>

  );
}

export default Select;

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