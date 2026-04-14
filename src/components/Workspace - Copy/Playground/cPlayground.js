import React, { useEffect } from 'react'
import PreferenceNav from './PreferenceNav/cPreferenceNav'
import Split from 'react-split'
import CodeMirror from '@uiw/react-codemirror'
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { cpp } from '@codemirror/lang-cpp';
import EditorFooter from './cEditorFooter';
import { useState } from 'react';
import { supabase } from '../../../supabase/supabase';
import { toast } from "react-toastify";
import useLocalStorage from '../../../Hooks/useLocalStorage';

export default function Playground({problem, setSuccess}) {
  const { currentProblem, loading } = useGetCurrentProblem(problem.id);
  const [activeTestCaseId, setActiveTestCaseId] = useState(0);
  let [userCode, setUserCode] = useState("//Enter your code here");
  const [solved, setSolved] = useState([]);
  const [fontSize,setFontSize] = useLocalStorage("lcc-fontSize","16px");
  const [testTab,setTestTab] = useState(0);
  const [submitMessage,setSubmitMessage] = useState('You have to submit your code first');
  const [askMessage,setAskMessage] = useState('Try the Ask AI feature');
  const [submitting,setSubmitting] = useState(false)
  const [asking,setAsking] = useState(false)

  const [settings,setSettings] = useState({
    fontSize: fontSize,
    settingsModalIsOpen: false,
    dropdownIsOpen: false,
  })

  // console.log(activeTestCaseId)

  
  const handleSubmit = async() =>{
    const { data: { user } } = await supabase.auth.getUser()

    if(!user){
      toast.error("Please log in to submit your code", { position: "top-center", autoClose: 3000, theme: "dark" });
      return;
    }
    if(submitting) return;
    setSubmitting(true)
      const apiUrl = 'http://127.0.0.1:8000/compile/';
      const language = JSON.parse(localStorage.getItem('selected_language'));
      
      const requestBody = {
        source_code: userCode,
        language_id:language.id ,
        testcases: currentProblem.testcases
      };
      console.log(requestBody);

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: `);
        }

        const responseData = await response.json();
        console.log(responseData)
        if(responseData.status.id === 3)
        {
            toast.success("Congrats! All tests passed!", { position: "top-center", autoClose: 3000, theme: "dark" });
            setSuccess(true);
            setTimeout(() => {
              setSuccess(false);
            }, 4000);
          
    
          //get solved problem array
          console.log(user.email)
          const { data,error } = await supabase
            .from('contests')
            .select('*')
            .eq('uemail',user.email)
          console.log(data)
            setSolved(data[0].solvedProblems)
            setSubmitMessage(responseData.status.description)
            setTestTab(1)
          //add to solved array if not present

          if(!(solved.includes(problem.id)))
          {
            const { error1 } = await supabase
            .from('contests')
            .update({ solvedProblems:[...solved,problem.id] })
            .eq('uemail', user.email)
      
            if(error1) console.log(error1)
            const pointsToAdd = currentProblem.difficulty === "Easy" ? 10 : currentProblem.difficulty === "Medium" ? 20 : 30;
            console.log(data[0].points)
          
            const { error3 } = await supabase
              .from('contests')
              .update({ points: data[0].points + pointsToAdd })
              .eq('uemail', user.email);

            if (error3) console.log(error3);
          }
        }
        else{
          setSubmitMessage(responseData.status.description)
          setTestTab(1)
          toast.error(responseData.status.description, { position: "top-center", autoClose: 3000, theme: "dark" });
        }
      } catch (error) {
        console.error('Error:', error.message);
      }
      setSubmitting(false)
  }

  useEffect(()=>{
    const updateUserCode = async()=>{
      const { data: { user } } = await supabase.auth.getUser()

      const code = localStorage.getItem(`code-${problem.id}`)
      if(user){
        setUserCode(code?JSON.parse(code):"//Enter your code here")
      }else{
        setUserCode("//Enter your code here")
      }
    }
    updateUserCode() 
  },[problem.id,problem.starterCode])

  const onChange = (value) =>{
      setUserCode(value)
      localStorage.setItem(`code-${problem.id}`,JSON.stringify(value))
  }

  return (
    <>
    <div className="flex flex-col bg-dark-layer-1 relative overflow-x-hidden">
      <PreferenceNav settings={settings} setSettings={setSettings} />
      <Split className="h-[calc(100vh-94px)]" direction="vertical" sizes={[60, 40]} minSize={60}>
        <div className="w-full overflow-auto">
          <CodeMirror
            value={userCode}
            theme={vscodeDark}
            onChange={onChange}
            extensions={[cpp()]}
            style={{ fontSize: settings.fontSize }}
          />
        </div>
        <div className="w-full px-5 overflow-auto">
          {/* testcase heading */}
          {!loading && currentProblem && (<div className="flex h-10 items-center space-x-6">
            <div className="relative flex h-full flex-col justify-center cursor-pointer" onClick={() => setTestTab(0)}>
              <div className={`text-sm font-medium leading-5  ${testTab === 0? "text-white" : "text-gray-500"}`}>Test Cases</div>
              <hr className={`absolute bottom-0 h-0.5 w-full rounded-full border-none ${testTab === 0? "bg-white" : "bg-gray-500"}`}  />
            </div>
            <div className="relative flex h-full flex-col justify-center cursor-pointer" onClick={() => setTestTab(1)}>
              <div className={`text-sm font-medium leading-5 ${testTab === 1? "text-white" : "text-gray-500"}`}>Test Result</div>
              <hr className={`absolute bottom-0 h-0.5 w-full rounded-full border-none ${testTab === 1? "bg-white" : "bg-gray-500"}`} />
            </div>
            <div className="relative flex h-full flex-col justify-center cursor-pointer" onClick={() => setTestTab(2)}>
              <div className={`text-sm font-medium leading-5 ${testTab === 2? "text-white" : "text-gray-500"}`}>AI Assistant</div>
              <hr className={`absolute bottom-0 h-0.5 w-full rounded-full border-none ${testTab === 2? "bg-white" : "bg-gray-500"}`} />
            </div>
          </div>)}
          {testTab === 0 && (<>
            {!loading && currentProblem &&(<>
            <div className="flex">
            {currentProblem.examples.map((example, index) => (
              <div className="mr-2 items-start mt-2 text-white" key={example.id} onClick={() => setActiveTestCaseId(index)} >
                <div className="flex flex-wrap items-center gap-y-4">
                  <div
                    className={`font-medium items-center transition-all focus:outline-none inline-flex bg-dark-fill-3 hover:bg-dark-fill-2 relative rounded-lg px-4 py-1 cursor-pointer whitespace-nowrap
                    ${activeTestCaseId === index ? "text-white" : "text-gray-500"}`}
                  >
                    Case {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="font-semibold my-4 pb-10">
            <p className="text-sm font-medium mt-4 text-white">Input: </p>
            <div className="w-full cursor-text rounded-lg border px-3 py-[10px] bg-dark-fill-3 border-transparent text-white mt-2">
              {currentProblem.examples[activeTestCaseId].inputText}
            </div>
            <p className="text-sm font-medium mt-4 text-white">Output: </p>
            <div className="w-full cursor-text rounded-lg border px-3 py-[10px] bg-dark-fill-3 border-transparent text-white mt-2">
              {currentProblem.examples[activeTestCaseId].outputText}
            </div>
          </div>
          </>
          )}
          </>)}
          {testTab === 1 && (
          <div className="font-semibold my-4 pb-10">
            <p className="text-sm font-medium mt-4 text-white">Result: </p>
            <div className="w-full cursor-text rounded-lg border px-3 py-[10px] bg-dark-fill-3 border-transparent text-white mt-2">
              {submitMessage}
            </div>
          </div>
          )}
          
        </div>
        </Split>
        <EditorFooter handleSubmit={handleSubmit} submitting={submitting}  asking={asking} />
    </div>
    </>
  )
}

function useGetCurrentProblem(problemId){
	const [currentProblem, setCurrentProblem] = useState(null);
	const [loading, setLoading] = useState(true);
	const [problemDifficultyClass, setProblemDifficultyClass] = useState("");

	useEffect(()=>{
		//fetch data from db
		const getCurrentProblem =async ()=>{
			setLoading(true)
			const { data, error } = await supabase
			.from('Problems')
			.select()
			.eq('id',problemId)
			// console.log(data[0])
			if(data !== 'undefined')
			{
				setCurrentProblem(data[0])
				// easy, medium, hard
				setProblemDifficultyClass(
					data[0].difficulty === "Easy"
					  ? "bg-olive text-olive"
					  : data[0].difficulty === "Medium"
					  ? "bg-dark-yellow text-dark-yellow"
					  : " bg-dark-pink text-dark-pink"
				  );
			}
			setLoading(false)
		}
		getCurrentProblem()
	},[problemId])
	return { currentProblem, loading };
}