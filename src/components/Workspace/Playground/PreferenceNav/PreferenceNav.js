import React,{useState,useEffect,useRef} from 'react'
import { AiOutlineFullscreen, AiOutlineSetting, AiOutlineFullscreenExit, AiOutlineTeam } from "react-icons/ai";
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import {db} from '../firebaseConfig'
import {
	collection,
	doc,
	setDoc,
	addDoc,
	updateDoc,
	onSnapshot,
	getDoc,
	getDocs,
	deleteDoc
  } from 'firebase/firestore';


const configuration = {
	iceServers: [
	  {
		urls: [
		  'stun:stun1.l.google.com:19302',
		  'stun:stun2.l.google.com:19302',
		],
	  },
	],
	iceCandidatePoolSize: 10,
  };

export default function PreferenceNav({settings,setSettings}) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [roomId, setRoomId] = useState("");
	const [videoId, setvideoId] = useState("");
	const [isFullScreen, setIsFullScreen] = useState(false);
	const [languages, setLanguages] = useState([]);
	const [loadingLanguages,setLoadingLanguages] = useState(true)
	const [selectedLanguage, setSelectedLanguage] = useState(null)
	console.log(selectedLanguage)
	const [showWebRTC, setShowWebRTC] = useState(false);
	 const localVideoRef = useRef(null);
	  const remoteVideoRef = useRef(null);
	
	  const [localStream, setLocalStream] = useState(null);
	  const [remoteStream, setRemoteStream] = useState(null);
	  const [peerConnection, setPeerConnection] = useState(null);
	   const [isCaller, setIsCaller] = useState(false);
		const [isDialogOpen, setIsDialogOpen] = useState(true); // Open modal initially
		const [joinRoomId, setJoinRoomId] = useState(''); // room id input in modal

// Register peer connection event listeners
const registerPeerConnectionListeners = (pc) => {
    pc.addEventListener('icegatheringstatechange', () => {
      console.log(`ICE gathering state: ${pc.iceGatheringState}`);
    });
    pc.addEventListener('connectionstatechange', () => {
      console.log(`Connection state: ${pc.connectionState}`);
    });
    pc.addEventListener('signalingstatechange', () => {
      console.log(`Signaling state: ${pc.signalingState}`);
    });
    pc.addEventListener('iceconnectionstatechange', () => {
      console.log(`ICE connection state: ${pc.iceConnectionState}`);
    });
  };

  // Request access to camera & microphone
  const openUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setLocalStream(stream);

      const remote = new MediaStream();
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remote;
      setRemoteStream(remote);
    } catch (error) {
      console.error('Error accessing media devices.', error);
    }
  };

	const handleButtonClick = () => {
		setIsModalOpen(true); // Open modal on button click
	  };
	
	  const handleWebRTCClick = () => {
		setShowWebRTC(true);
	  };
	
	  const createRoom = () => {
		const newRoomId = uuidv4().slice(0, 8); // Generate a short room ID
		setRoomId(newRoomId); // Set room ID for display
	  };
	
	  const joinRoom = () => {
		if (roomId.trim() !== "") {
		 localStorage.setItem('roomId',roomId);
		 setIsModalOpen(false);
		 toast("CODE JAM STARTED")
		 window.location.reload(); // Refresh the window after entering the room
		} else {
		  alert("Enter a valid Room ID!");
		}
	  };
	
	  const copyRoomId = () => {
		navigator.clipboard.writeText(roomId);
		alert("Room ID copied!");
	  };


	// Create a room (caller)
	  const createVideoRoom = async () => {
		if (!localStream) return;
		const roomRef = doc(collection(db, 'rooms'));
		console.log('Creating PeerConnection with configuration', configuration);
		const pc = new RTCPeerConnection(configuration);
		setPeerConnection(pc);
		registerPeerConnectionListeners(pc);
	
		localStream.getTracks().forEach((track) => {
		  pc.addTrack(track, localStream);
		});
	
		// Collect ICE candidates and store them in Firestore
		const callerCandidatesCollection = collection(roomRef, 'callerCandidates');
		pc.addEventListener('icecandidate', (event) => {
		  if (!event.candidate) {
			console.log('Got final candidate!');
			return;
		  }
		  console.log('Got candidate: ', event.candidate);
		  addDoc(callerCandidatesCollection, event.candidate.toJSON());
		});
	
		// Create offer
		const offer = await pc.createOffer();
		await pc.setLocalDescription(offer);
		const roomWithOffer = {
		  offer: {
			type: offer.type,
			sdp: offer.sdp,
		  },
		};
		await setDoc(roomRef, roomWithOffer);
		localStorage.setItem('videoId',roomRef.id)
		setvideoId(roomRef.id);
		setIsCaller(true);
		console.log(`Room created with ID: ${roomRef.id}`);
		document.title = `CodeCraft - Room: ${roomRef.id} (Caller)`;
	
		// Listen for remote answer
		onSnapshot(roomRef, async (snapshot) => {
		  const data = snapshot.data();
		  if (!pc.currentRemoteDescription && data && data.answer) {
			console.log('Got remote description: ', data.answer);
			await pc.setRemoteDescription(data.answer);
		  }
		});
	
		// Listen for remote ICE candidates
		const calleeCandidatesCollection = collection(roomRef, 'calleeCandidates');
		onSnapshot(calleeCandidatesCollection, (snapshot) => {
		  snapshot.docChanges().forEach(async (change) => {
			if (change.type === 'added') {
			  let data = change.doc.data();
			  console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
			  await pc.addIceCandidate(data);
			}
		  });
		});
	  };
	
	  // Join room process (callee)
	  const confirmJoinRoom = async () => {
		// Request media access if not already granted
		if (!localStream) {
		  await openUserMedia();
		}
		setIsDialogOpen(false);
		const joinRoomId = videoId;
		const roomRef = doc(db, 'rooms', joinRoomId);
		console.log("roomref",roomRef)
		const roomSnapshot = await getDoc(roomRef);
		if (!roomSnapshot.exists()) {
		  console.error('Room does not exist.');
		  return;
		}
		console.log('Joining room: ', joinRoomId);
		const pc = new RTCPeerConnection(configuration);
		setPeerConnection(pc);
		registerPeerConnectionListeners(pc);
	   
		localStream.getTracks().forEach((track) => {
		  pc.addTrack(track, localStream);
		});
	
		// Collect ICE candidates and store them in Firestore
		const calleeCandidatesCollection = collection(roomRef, 'calleeCandidates');
		pc.addEventListener('icecandidate', (event) => {
		  if (!event.candidate) {
			console.log('Got final candidate!');
			return;
		  }
		  console.log('Got candidate: ', event.candidate);
		  addDoc(calleeCandidatesCollection, event.candidate.toJSON());
		});
	
		pc.addEventListener('track', (event) => {
		  console.log('Got remote track:', event.streams[0]);
		  event.streams[0].getTracks().forEach((track) => {
			remoteStream.addTrack(track);
		  });
		});
	
		// Set remote description with the offer and create answer
		const roomData = roomSnapshot.data();
		await pc.setRemoteDescription(roomData.offer);
		const answer = await pc.createAnswer();
		await pc.setLocalDescription(answer);
		const roomWithAnswer = {
		  answer: {
			type: answer.type,
			sdp: answer.sdp,
		  },
		};
		await updateDoc(roomRef, roomWithAnswer);
	
		// Listen for remote ICE candidates
		const callerCandidatesCollection = collection(roomRef, 'callerCandidates');
		onSnapshot(callerCandidatesCollection, (snapshot) => {
		  snapshot.docChanges().forEach(async (change) => {
			if (change.type === 'added') {
			  let data = change.doc.data();
			  console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
			  await pc.addIceCandidate(data);
			}
		  });
		});
		document.title = `CodeCraft - Room: ${videoId} (Callee)`;
	  };
	  const hangUp = async () => {
		if (localStream && localStream.getTracks) {
		  localStream.getTracks().forEach((track) => track.stop());
		}
		if (remoteStream && remoteStream.getTracks) {
		  remoteStream.getTracks().forEach((track) => track.stop());
		}
		if (peerConnection) {
		  peerConnection.close();
		}
		// If caller, delete room and ICE candidates
		if (videoId && isCaller) {
		  const roomRef = doc(db, 'rooms', videoId);
		  const calleeCandidatesSnapshot = await getDocs(collection(roomRef, 'calleeCandidates'));
		  calleeCandidatesSnapshot.forEach(async (candidate) => {
			await deleteDoc(candidate.ref);
		  });
		  const callerCandidatesSnapshot = await getDocs(collection(roomRef, 'callerCandidates'));
		  callerCandidatesSnapshot.forEach(async (candidate) => {
			await deleteDoc(candidate.ref);
		  });
		  await deleteDoc(roomRef);
		}
		setPeerConnection(null);
		setvideoId('');
		setLocalStream(null);
		setRemoteStream(null);
		document.title = 'CodeCraft - LiveConnect';
	  };
	  
	  
	
	  // Cleanup on unmount
	  useEffect(() => {
		return () => {
		  hangUp();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	  }, []);
	
	useEffect(() => {
		const fetchData = async () => {
			try {
			  const response = await fetch('http://127.0.0.1:8000/languages/');
		  
			  if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			  }
		  
			  const data = await response.json();
		      console.log(data)
			  // Log the response for further investigation
			//   console.log('Response:', data.languages);
		  
			  // Set languages in the state
			  setLanguages(data);
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
	         </div>
			 <div className='flex items-center m-2'>
				<button className='preferenceBtn group'
				onClick={handleFullScreen}
				>
					<div className='h-4 w-4 text-dark-gray-6 font-bold text-lg'>
						<AiOutlineFullscreen />
					</div>
					<div className='preferenceBtn-tooltip'>Full Screen</div>
				</button>
				
	        </div>

			  {/* Collaborate Icon */}
			  <div className="flex items-center m-2">
        <button 
          className="preferenceBtn group" 
          onClick={handleButtonClick} 
        >
          <div className="h-4 w-4 text-dark-gray-6 font-bold text-lg">
            <AiOutlineTeam />
          </div>
          <div className="preferenceBtn-tooltip">Collaborate</div>
        </button>
      </div>

 {/* VideoCollab Icon */}
 <div className="flex items-center m-2">
        <button 
          className="preferenceBtn group" 
          onClick={handleWebRTCClick} 
        >
          <div className="h-4 w-4 text-dark-gray-6 font-bold text-lg">
            <AiOutlineTeam />
          </div>
          <div className="preferenceBtn-tooltip">Collaborate</div>
        </button>
      </div>

	

      {/* Modal - Collaborate Room Create/Join */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-dark-layer-3 p-6 rounded-xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-white text-center mb-4">Collaborate in a Room</h2>
            
            <div className="flex flex-col space-y-4">
              {/* Create Room */}
              <div>
                <button
                  className="w-full py-2 bg-blue-600 text-white rounded-lg"
                  onClick={createRoom}
                >
                  Create Room
                </button>
                {roomId && (
                  <div className="mt-4 text-center text-white">
                    <p>Room ID: <strong>{roomId}</strong></p>
                    <button 
                      className="mt-2 py-1 px-3 bg-gray-700 text-white rounded-lg"
                      onClick={copyRoomId}
                    >
                      Copy Room ID
                    </button>
                    <button 
                      className="mt-2 py-1 px-3 bg-green-600 text-white rounded-lg"
                      onClick={joinRoom}
                    >
                      Enter Room
                    </button>
                  </div>
                )}
              </div>

              {/* Join Room */}
              <div className="flex flex-col space-y-2">
                <input
                  type="text"
                  placeholder="Enter Room ID"
                  className="p-2 bg-dark-fill-3 text-white rounded-lg"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                />
                <button 
                  className="py-2 bg-purple-600 text-white rounded-lg"
                  onClick={joinRoom}
                >
                  Join Room
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-white text-xl"
              onClick={() => setIsModalOpen(false)}
            >
              X
            </button>
          </div>
        </div>
      )}


{showWebRTC && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-dark-layer-3 p-6 rounded-xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-white text-center mb-4"> Video Collaboration</h2>
            
            <div className="flex flex-col space-y-4">
              {/* Create Room */}
              <div>
                <button
                  className="w-full py-2 bg-blue-600 text-white rounded-lg"
                  onClick={createVideoRoom}
                >
                  Create Room
                </button>
                {roomId && (
                  <div className="mt-4 text-center text-white">
                    <p>Room ID: <strong>{roomId}</strong></p>
                    <button 
                      className="mt-2 py-1 px-3 bg-green-600 text-white rounded-lg"
                      onClick={confirmJoinRoom}
                    >
                      Enter Room
                    </button>
                  </div>
                )}
              </div>

              {/* Join Room */}
              <div className="flex flex-col space-y-2">
                <input
                  type="text"
                  placeholder="Enter Room ID"
                  className="p-2 bg-dark-fill-3 text-white rounded-lg"
                  value={roomId}
                  onChange={(e) => setvideoId(e.target.value)}
                />
                <button 
                  className="py-2 bg-purple-600 text-white rounded-lg"
                  onClick={confirmJoinRoom}
                >
                  Join Room
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-white text-xl"
              onClick={() => setShowWebRTC(false)}
            >
              X
            </button>
          </div>
        </div>
      )}
	  </div>
  )
}