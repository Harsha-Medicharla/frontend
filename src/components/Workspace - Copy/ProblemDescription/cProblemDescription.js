/*import React from 'react'
import { AiFillLike, AiFillDislike } from "react-icons/ai";
import { BsCheck2Circle } from "react-icons/bs";
import { TiStarOutline } from "react-icons/ti";

export default function ProblemDescription({ problem }) {
	console.log(problem)
	return (
		<div className='bg-dark-layer-1'>
			<div className='flex h-11 w-full items-center pt-2 bg-dark-layer-2 text-white overflow-x-hidden'>
				<div className={"bg-dark-layer-1 rounded-t-[5px] px-5 py-[10px] text-xs cursor-pointer"}>
					Description
				</div>
			</div>

			<div className='flex px-0 py-4 h-[calc(100vh-94px)] overflow-y-auto'>
				<div className='px-5'>
					<div className='w-full'>
						<div className='flex space-x-4'>
							<div className='flex-1 mr-2 text-lg text-white font-medium'>{problem[0].title}</div>
						</div>
						<div className='flex items-center mt-3'>
							<div
								className={`text-olive bg-olive inline-block rounded-[21px] bg-opacity-[.15] px-2.5 py-1 text-xs font-medium capitalize `}
							>
								{problem[0].difficulty}
							</div>
							<div className='rounded p-[3px] ml-4 text-lg transition-colors duration-200 text-green-s text-dark-green-s'>
								<BsCheck2Circle />
							</div>
							<div className='flex items-center cursor-pointer hover:bg-dark-fill-3 space-x-1 rounded p-[3px]  ml-4 text-lg transition-colors duration-200 text-dark-gray-6'>
								<AiFillLike />
								<span className='text-xs'>120</span>
							</div>
							<div className='flex items-center cursor-pointer hover:bg-dark-fill-3 space-x-1 rounded p-[3px]  ml-4 text-lg transition-colors duration-200 text-green-s text-dark-gray-6'>
								<AiFillDislike />
								<span className='text-xs'>2</span>
							</div>
							<div className='cursor-pointer hover:bg-dark-fill-3  rounded p-[3px]  ml-4 text-xl transition-colors duration-200 text-green-s text-dark-gray-6 '>
								<TiStarOutline />
							</div>
						</div>

					
						<div className='text-white text-sm'>
							<div dangerouslySetInnerHTML={{ __html: problem[0].data }} />
						</div>

					
						<div className="mt-4">
							{console.log("problem check",problem[0].title)}
							{problem[0].examples.map((example, index) => (
								
								<div key={example[0]}>
									{console.log("example :",example[0])}
									<p className="font-medium text-white ">Example {index + 1}: </p>
									{example.img && <img src={example.img} alt="" className="mt-3" />}
									<div className="example-card">
										<pre>
											<strong className="text-white">Input:</strong>{example[1]}
											<br />
											<strong>Output:</strong>
											{example[2]} <br />
											{example[3] && (
												<>
													<strong>Explanation:</strong>{example[3]}
												</>
											)}
										</pre>
									</div>
								</div>
							))}
						</div>


					
						<div className="my-8 pb-4">
							<div className="text-white text-sm font-medium">Constraints:</div>
							<ul className="text-white ml-5 list-disc ">
								<div dangerouslySetInnerHTML={{ __html: problem[0].constraints }} />
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}*/

import React, { useEffect,useState } from 'react'
import { AiFillLike, AiFillDislike,AiOutlineLoading3Quarters, AiFillStar } from "react-icons/ai";
import { BsCheck2Circle } from "react-icons/bs";
import { TiStarOutline } from "react-icons/ti";
import { supabase } from '../../../supabase/supabase';
import CircleSkeleton from '../../Skeletons/CircleSkeleton';
import RectangleSkeleton from '../../Skeletons/RectangleSkeleton';
import { toast } from "react-toastify";



export default function ProblemDescription({ problem }) {
	const { currentProblem, loading, problemDifficultyClass, setCurrentProblem} = useGetCurrentProblem(problem.id);
	const { userData, setUserData, userDoc } = useGetUsersDataOnProblem(problem.id);
	const [updating, setUpdating] = useState(false)
	

	const handleLike = async()=>{
		const { data: { user } } = await supabase.auth.getUser()
		// console.log(user.id)
		if (!user) {
			toast.error("You must be logged in to like a problem", {
			  position: "top-left",
			  theme: "dark",
			});
			return;
		  }
		if(updating) return;
		setUpdating(true);
		//if already liked, if dislike, neither
		if(userData.liked)
		{
			//decrease likes count
			const { error1 } = await supabase
			.from('Problems')
			.update({ likes: currentProblem.likes -1 })
			.eq('id', problem.id)

			if(error1) console.log(error1)

			//remove from liked array
			const { error2 } = await supabase
			.from('users')
			.update({ likedProblems: userDoc.likedProblems.filter((id) => id !== problem.id) })
			.eq('id', user.id)

			if(error2) console.log(error2)

			//Update UI
			setCurrentProblem((prev) => (prev ? { ...prev, likes: prev.likes - 1 } : null));
          	setUserData((prev) => ({ ...prev, liked: false }));
		}else if(userData.disliked){
			
			//add to liked array and removed from disliked array
			const { error1 } = await supabase
			.from('users')
			.update({ likedProblems: [...userDoc.likedProblems,problem.id], dislikedProblems: userDoc.dislikedProblems.filter((id) => id !== problem.id)  })
			.eq('id', user.id)

			if(error1) console.log(error1)

			//likes +1, dislikes -1
			const { error2 } = await supabase
			.from('Problems')
			.update({ likes: currentProblem.likes + 1,dislikes: currentProblem.dislikes - 1 })
			.eq('id', problem.id)

			if(error2) console.log(error2)

			//update UI
			setCurrentProblem((prev) => (prev ? { ...prev, likes: prev.likes + 1, dislikes: prev.dislikes - 1 } : null));
			setUserData((prev) => ({ ...prev, liked: true, disliked: false }));
		}else{
			//increase likes count
			const { error1 } = await supabase
			.from('Problems')
			.update({ likes: currentProblem.likes + 1 })
			.eq('id', problem.id)

			if(error1) console.log(error1)

			//add to liked array
			const { error2 } = await supabase
			.from('users')
			.update({ likedProblems: [...userDoc.likedProblems,problem.id]})
			.eq('id', user.id)

			if(error2) console.log(error2)

			// update UI
			setCurrentProblem((prev) => (prev ? { ...prev, likes: prev.likes + 1 } : null));
			setUserData((prev) => ({ ...prev, liked: true }));
		}
		setUpdating(false);
	}

	const handleDislike = async()=>{
		const { data: { user } } = await supabase.auth.getUser()
		// console.log(user.id)
		if (!user) {
			toast.error("You must be logged in to dislike a problem", {
			  position: "top-left",
			  theme: "dark",
			});
			return;
		  }
		if(updating) return;
		setUpdating(true);
		//if already disliked, if liked, neither
		if(userData.disliked)
		{
			//decrease likes count
			const { error1 } = await supabase
			.from('Problems')
			.update({ dislikes: currentProblem.dislikes - 1 })
			.eq('id', problem.id)

			if(error1) console.log(error1)

			//remove from disliked array
			const { error2 } = await supabase
			.from('users')
			.update({ dislikedProblems: userDoc.dislikedProblems.filter((id) => id !== problem.id) })
			.eq('id', user.id)

			if(error2) console.log(error2)

			//Update UI
			setCurrentProblem((prev) => (prev ? { ...prev, dislikes: prev.dislikes - 1 } : null));
          	setUserData((prev) => ({ ...prev, disliked: false }));
		}else if(userData.liked){
			
			//add to disliked array and removed from liked array
			const { error1 } = await supabase
			.from('users')
			.update({ dislikedProblems: [...userDoc.dislikedProblems,problem.id], likedProblems: userDoc.likedProblems.filter((id) => id !== problem.id)  })
			.eq('id', user.id)

			if(error1) console.log(error1)

			//likes -1, dislikes +1
			const { error2 } = await supabase
			.from('Problems')
			.update({ likes: currentProblem.likes - 1,dislikes: currentProblem.dislikes + 1 })
			.eq('id', problem.id)

			if(error2) console.log(error2)

			//update UI
			setCurrentProblem((prev) => (prev ? { ...prev, likes: prev.likes - 1, dislikes: prev.dislikes + 1 } : null));
			setUserData((prev) => ({ ...prev, disliked: true, liked: false }));
		}else{
			//increase dislikes count
			const { error1 } = await supabase
			.from('Problems')
			.update({ dislikes: currentProblem.dislikes + 1 })
			.eq('id', problem.id)

			if(error1) console.log(error1)

			//add to disliked array
			const { error2 } = await supabase
			.from('users')
			.update({ dislikedProblems: [...userDoc.dislikedProblems,problem.id]})
			.eq('id', user.id)

			if(error2) console.log(error2)

			// update UI
			setCurrentProblem((prev) => (prev ? { ...prev, dislikes: prev.dislikes + 1 } : null));
			setUserData((prev) => ({ ...prev, disliked: true }));
		}
		setUpdating(false);
	}

	const handleStar = async ()=>{
		const { data: { user } } = await supabase.auth.getUser()
		// console.log(user.id)
		if (!user) {
			toast.error("You must be logged in to star a problem", {
			  position: "top-left",
			  theme: "dark",
			});
			return;
		  }
		if(updating) return;
		setUpdating(true);
		//user has starred the problem or not
		if(userData.starred){
			//remove from starred array
			const { error1 } = await supabase
			.from('users')
			.update({ starredProblems: userDoc.starredProblems.filter((id) => id !== problem.id)  })
			.eq('id', user.id)

			if(error1) console.log(error1)

			//update ui
			setUserData((prev) => ({ ...prev, starred: false }));
		}else{
			//add to starred array
			const { error1 } = await supabase
			.from('users')
			.update({ starredProblems: [...userDoc.starredProblems,problem.id]})
			.eq('id', user.id)

			if(error1) console.log(error1)

			//update ui
			setUserData((prev) => ({ ...prev, starred: true }));
		}

		setUpdating(false);
	}

	return (
		<div className='bg-dark-layer-1'>
			{/* TAB */}
			<div className='flex h-11 w-full items-center pt-2 bg-dark-layer-2 text-white overflow-x-hidden'>
				<div className={"bg-dark-layer-1 rounded-t-[5px] px-5 py-[10px] text-xs cursor-pointer"}>
					Description
				</div>
			</div>

			<div className='flex px-0 py-4 h-[calc(100vh-94px)] overflow-y-auto'>
				<div className='px-5'>
					{/* Problem heading */}
					<div className='w-full'>
						{!loading && currentProblem && (<div className='flex space-x-4'>
							<div className='flex-1 mr-2 text-lg text-white font-medium'>{currentProblem.title}</div>
						</div>)}
						{!loading && currentProblem && (
							<div className='flex items-center mt-3'>
								<div
									className={`${problemDifficultyClass} inline-block rounded-[21px] bg-opacity-[.15] px-2.5 py-1 text-xs font-medium capitalize `}
								>
									{currentProblem.difficulty}
								</div>
								{userData.solved && (
									<div className='rounded p-[3px] ml-4 text-lg transition-colors duration-200 text-green-s text-dark-green-s'>
									<BsCheck2Circle />
								</div>
								)}
								<div className='flex items-center cursor-pointer hover:bg-dark-fill-3 space-x-1 rounded p-[3px]  ml-4 text-lg transition-colors duration-200 text-dark-gray-6'
								onClick={handleLike}
								>
								{userData.liked && !updating && <AiFillLike className="text-dark-blue-s" />}
                  				{!userData.liked && !updating && <AiFillLike />}
								{updating && <AiOutlineLoading3Quarters className="animate-spin" />}
									<span className='text-xs'>{currentProblem.likes}</span>
								</div>
								<div className='flex items-center cursor-pointer hover:bg-dark-fill-3 space-x-1 rounded p-[3px]  ml-4 text-lg transition-colors duration-200 text-green-s text-dark-gray-6'
								onClick={handleDislike}
								>
								{userData.disliked && !updating && <AiFillDislike className="text-dark-blue-s" />}
								{!userData.disliked && !updating && <AiFillDislike />}
								{updating && <AiOutlineLoading3Quarters className="animate-spin" />}
									<span className='text-xs'>{currentProblem.dislikes}</span>
								</div>
								<div className='cursor-pointer hover:bg-dark-fill-3  rounded p-[3px]  ml-4 text-xl transition-colors duration-200 text-green-s text-dark-gray-6 '
								onClick={handleStar}
								>
									{userData.starred && !updating && <AiFillStar className="text-dark-yellow" />}
									{!userData.starred && !updating && <TiStarOutline />}
									{updating && <AiOutlineLoading3Quarters className="animate-spin" />}
								</div>
							</div>
						)}

						{loading && (
							<div className="mt-3 flex space-x-2">
							<RectangleSkeleton />
							<CircleSkeleton />
							<RectangleSkeleton />
							<RectangleSkeleton />
							<CircleSkeleton />
						  </div>
						)}

						{/* Problem Statement(paragraphs) */}
						{!loading && currentProblem && (<div className='text-white text-sm'>
							<div dangerouslySetInnerHTML={{ __html: currentProblem.problem_statement }} />
						</div>)}

						{/* Examples */}
						{!loading && currentProblem && (<div className="mt-4">
							{currentProblem.examples.map((example, index) => (
								<div key={example.id}>
									<p className="font-medium text-white ">Example {index + 1}: </p>
									{example.img && <img src={example.img} alt="" className="mt-3" />}
									<div className="example-card">
										<pre>
											<strong className="text-white">Input: </strong> {example.inputText}
											<br />
											<strong>Output:</strong>
											{example.outputText} <br />
											{example.explanation && (
												<>
													<strong>Explanation:</strong> {example.explanation}
												</>
											)}
										</pre>
									</div>
								</div>
							))}
						</div>)}


						{/* Constraints */}
						{!loading && currentProblem && (<div className="my-8 pb-4">
							<div className="text-white text-sm font-medium">Constraints:</div>
							<ul className="text-white ml-5 list-disc ">
								<div dangerouslySetInnerHTML={{ __html: currentProblem.constraints }} />
							</ul>
						</div>)}
					</div>
				</div>
			</div>
		</div>
	);
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
	return { currentProblem, loading, problemDifficultyClass, setCurrentProblem};
}

function useGetUsersDataOnProblem(problemId){
	const [userData,setUserData] = useState({
		liked:false,
		disliked:false,
		solved:false,
		starred:false
	})

	const [userDoc, setUserDoc] = useState({
		likedProblems:[],
		dislikedProblems:[],
		starredProblems:[],
		solvedProblems:[]
	})

	useEffect(()=>{
		//get user info from db
		const getUsersDataOnProblems = async()=>{
			const { data: { user } } = await supabase.auth.getUser()
			// console.log(user)
			if(user !== null)
			{
				const { data,error } = await supabase
				.from('users')
				.select('likedProblems,dislikedProblems,starredProblems,solvedProblems')
				.eq('id',user.id)
				//console.log(data[0])


				const { solvedProblems, likedProblems, dislikedProblems, starredProblems } = data[0];
				setUserData({
					liked:likedProblems?likedProblems.includes(problemId):false,
					disliked:dislikedProblems?dislikedProblems.includes(problemId):false,
					solved:solvedProblems?solvedProblems.includes(problemId):false,
					starred:starredProblems?starredProblems.includes(problemId):false
				})

				setUserDoc({
					likedProblems:likedProblems?likedProblems:[],
					dislikedProblems:dislikedProblems?dislikedProblems:[],
					starredProblems:starredProblems?starredProblems:[],
					solvedProblems:solvedProblems?solvedProblems:[]
				})
				// console.log(userData)
			}
		}
		getUsersDataOnProblems();
	},[])

	return {userData,setUserData, userDoc}
}