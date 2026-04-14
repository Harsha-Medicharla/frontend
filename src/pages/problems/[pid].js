// Import necessary components and data
/*import React from 'react';
import { useParams } from 'react-router-dom';
import Topbar from '../../components/Topbar/Topbar';
import Workspace from '../../components/Workspace/Workspace';

// ProblemPage component
export default function ProblemPage() {
  // Get the 'pid' parameter from the URL
  const { pid } = useParams();
  console.log("is:",pid)
  
  // Fetch the corresponding problem data
  const problemData = problems[pid];

  // Handle case where 'pid' is not found
  if (!problemData) {
    return <div>Error: Problem not found</div>;
  }

  // Render the page using 'problemData'
  return (
    <>
      <Topbar problemPage />
      <Workspace problem={problemData} />
    </>
  );
}*/
/*import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabase/supabase';
import Topbar from '../../components/Topbar/Topbar';
import Workspace from '../../components/Workspace/Workspace';

const QuestionDetails = () => {
  const { pid } = useParams();
  const [question, setQuestion] = useState(null);
  

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('id', pid)
          console.log(data)

        if (error) {
          console.error('Error fetching question:', error.message);
        } else {
          setQuestion(data);
        }
      } catch (error) {
        console.error('Error fetching question:', error.message);
      }
    };

    fetchQuestion();
  }, [pid, supabase]);

  return (
    <div>
      
      {question ? (
        <div>
          <Topbar problemPage />
          <Workspace problem={question} />
         
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default QuestionDetails;*/

// Import necessary components and data
import React from 'react';
import { useParams } from 'react-router-dom';
import Topbar from '../../components/Topbar/Topbar';
import Workspace from '../../components/Workspace/Workspace';

// ProblemPage component
export default function ProblemPage() {
  // Get the 'pid' parameter from the URL
  const { pid } = useParams();

  // Fetch the corresponding problem id
  const problemData ={
    id:pid
  }

  // Handle case where 'pid' is not found
  if (!problemData) {
    return <div>Error: Problem not found</div>;
  }

  // Render the page using 'problemData'
  return (
    <>
      <Topbar problemPage />
      <Workspace problem={problemData} />
    </>
  );
}

