import React,{useState,useEffect} from 'react'
import { AiOutlineFullscreen, AiOutlineSetting, AiOutlineFullscreenExit } from "react-icons/ai";
import SettingsModal from '../../../Modals/SettingsModal';

export default function PreferenceNav({settings,setSettings}) {
	const [isFullScreen, setIsFullScreen] = useState(false);
	const [languages, setLanguages] = useState([]);
	const [loadingLanguages,setLoadingLanguages] = useState(true)
	const [selectedLanguage, setSelectedLanguage] = useState(null)
	// console.log(selectedLanguage)
	
	useEffect(() => {
		const fetchData = async () => {
			try {
			  const response = await fetch('http://127.0.0.1:8000/languages');
		  
			  if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			  }
		  
			  const data = await response.json();
		  
			  // Log the response for further investigation
			//   console.log('Response:', data.languages);
		  
			  // Set languages in the state
			  setLanguages(data.languages);
			  // Set an initial default language if needed
			  setSelectedLanguage(JSON.parse(localStorage.getItem('selected_language'))|| languages[0])
			} catch (error) {
			  console.error('Error fetching languages:', error);
			}
		  };
		  setLoadingLanguages(true)
		  fetchData();
		  setLoadingLanguages(false)
	  }, []);

	const handleFullScreen = ()=>{
		if (isFullScreen) {
			document.exitFullscreen();
			} else {
			document.documentElement.requestFullscreen();
			}
			setIsFullScreen(!setIsFullScreen);
	}

	useEffect(() => {
		function exitHandler(e) {
		  if (!document.fullscreenElement) {
			setIsFullScreen(false);
			return;
		  }
		  setIsFullScreen(true);
		}
		if (document.addEventListener) {
		  document.addEventListener("fullscreenchange", exitHandler);
		  document.addEventListener("webkitfullscreenchange", exitHandler); //Safari and Google Chrome 
		  document.addEventListener("mozfullscreenchange", exitHandler); //Firefox
		  document.addEventListener("MSFullscreenChange", exitHandler); //Internet Explorer and Microsoft Edge)
		}
	  }, [isFullScreen]);

	  const handleLanguageChange = (selectedLanguage) => {
		setSelectedLanguage(selectedLanguage)
		localStorage.setItem('selected_language',JSON.stringify(selectedLanguage))
	  };

  return (
    <div className='flex items-center justify-between bg-dark-layer-2 h-11 w-full'>
			{!loadingLanguages && <div className='flex items-center text-white'>
				<select
				value={selectedLanguage?.id}
				onChange={(e) =>{
						handleLanguageChange(
						languages.find((lang) => lang.id === parseInt(e.target.value))
						)
					}
				}
				className='mx-0 px-2 py-1.5 rounded bg-dark-fill-3 text-dark-label-2 focus:outline-none'
				>
				{languages.map((lang) => (
					<option key={lang.id} value={lang.id} className='cursor-pointer bg-black text-white hover:bg-dark-fill-3 rounded-lg' >
					{lang.name}
					</option>
				))}
				</select>
			</div>}

			<div className='flex items-center m-2'>
				<button className='preferenceBtn group'
				onClick={()=>setSettings({...settings,settingsModalIsOpen:true})}
				>
					<div className='h-4 w-4 text-dark-gray-6 font-bold text-lg'>
						<AiOutlineSetting />
					</div>
					<div className='preferenceBtn-tooltip'>Settings</div>
				</button>

				<button className='preferenceBtn group' onClick={handleFullScreen}>
					<div className='h-4 w-4 text-dark-gray-6 font-bold text-lg'>
						{!isFullScreen ? <AiOutlineFullscreen /> : <AiOutlineFullscreenExit />}
					</div>
					<div className='preferenceBtn-tooltip'>Full Screen</div>
				</button>
			</div>
			{settings.settingsModalIsOpen && <SettingsModal settings={settings} setSettings={setSettings} />}
	</div>
  )
}