import React, { useState, useEffect, useRef } from 'react';
import { AiOutlineFullscreen, AiOutlineSetting, AiOutlineFullscreenExit, AiOutlineTeam } from "react-icons/ai";
import { MdVideoCall } from "react-icons/md";
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { db } from '../firebaseConfig';
import {
  collection, doc, setDoc, addDoc, updateDoc,
  onSnapshot, getDoc, getDocs
} from 'firebase/firestore';
import SettingsModal from '../../../Modals/SettingsModal';

// ─── WebRTC Configuration ───────────────────────────────────────────────────
const configuration = {
  iceServers: [
    { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function PreferenceNav({ settings, setSettings }) {
  // ── UI State ──
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showWebRTC, setShowWebRTC] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // ── Language State ──
  const [languages, setLanguages] = useState([]);
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  // ── Collab State ──
  const [collabRoomId, setCollabRoomId] = useState('');

  // ── Video Call State ──
  const [videoRoomId, setVideoRoomId] = useState('');
  const [videoJoinInput, setVideoJoinInput] = useState('');
  const [hasLocalStream, setHasLocalStream] = useState(false);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  const [isCaller, setIsCaller] = useState(false);

  // ── Refs ──
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const pendingCandidates = useRef([]);

  // ─── Language Fetch ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/languages/');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setLanguages(data);
        setSelectedLanguage(
          JSON.parse(localStorage.getItem('selected_language')) || data[0]
        );
      } catch (err) {
        console.error('Error fetching languages:', err);
      } finally {
        setLoadingLanguages(false);
      }
    };
    fetchLanguages();
  }, []);

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    localStorage.setItem('selected_language', JSON.stringify(lang));
  };

  // ─── Fullscreen ──────────────────────────────────────────────────────────────
  const handleFullScreen = () => {
    if (isFullScreen) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
    setIsFullScreen(!isFullScreen);
  };

  useEffect(() => {
    const onFSChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, []);

  // ─── Code Collab ─────────────────────────────────────────────────────────────
  const createCollabRoom = () => setCollabRoomId(uuidv4().slice(0, 8));

  const joinCollabRoom = () => {
    if (!collabRoomId.trim()) return;
    localStorage.setItem('roomId', collabRoomId);
    setIsModalOpen(false);
    toast('CODE JAM STARTED');
    window.location.reload();
  };

  const copyCollabRoomId = () => {
    navigator.clipboard.writeText(collabRoomId);
    toast('Room ID copied!');
  };

  // ─── WebRTC Helpers ──────────────────────────────────────────────────────────
  const openMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setHasLocalStream(true);
      return stream;
    } catch (err) {
      console.error('Media access error:', err);
      toast.error('Camera/Mic access failed');
      return null;
    }
  };

  /** Queue candidate if remote description isn't set yet, otherwise add immediately */
  const safeAdd = async (pc, data) => {
    if (!pc.remoteDescription) {
      pendingCandidates.current.push(data);
    } else {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data));
      } catch (e) {
        console.warn('addIceCandidate error:', e);
      }
    }
  };

  /** Flush all queued ICE candidates after remote description is set */
  const flushPending = async (pc) => {
    for (const c of pendingCandidates.current) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(c));
      } catch (e) {
        console.warn('flush candidate error:', e);
      }
    }
    pendingCandidates.current = [];
  };

  // ─── Create Video Room ───────────────────────────────────────────────────────
  const createRoom = async () => {
    const stream = localStreamRef.current || await openMedia();
    if (!stream) return;

    const roomRef = doc(collection(db, 'rooms'));
    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      setHasRemoteStream(true);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(collection(roomRef, 'callerCandidates'), event.candidate.toJSON());
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await setDoc(roomRef, { offer: { type: offer.type, sdp: offer.sdp } });

    setVideoRoomId(roomRef.id);
    setIsCaller(true);
    toast.success(`Room created! ID: ${roomRef.id}`);

    // Listen for callee's answer
    onSnapshot(roomRef, async (snap) => {
      const data = snap.data();
      if (data?.answer && !pc.currentRemoteDescription) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        await flushPending(pc);
      }
    });

    // Listen for callee ICE candidates
    onSnapshot(collection(roomRef, 'calleeCandidates'), (snap) => {
      snap.docChanges().forEach(async (change) => {
        if (change.type === 'added') await safeAdd(pc, change.doc.data());
      });
    });
  };

  // ─── Join Video Room ─────────────────────────────────────────────────────────
  const joinRoom = async () => {
    const roomId = videoJoinInput.trim();
    if (!roomId) return toast.error('Enter a Room ID');

    const stream = localStreamRef.current || await openMedia();
    if (!stream) return;

    const roomRef = doc(db, 'rooms', roomId);
    const snap = await getDoc(roomRef);

    if (!snap.exists()) return toast.error('Room not found');

    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      setHasRemoteStream(true);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(collection(roomRef, 'calleeCandidates'), event.candidate.toJSON());
      }
    };

    const data = snap.data();
    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    await flushPending(pc);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await updateDoc(roomRef, { answer: { type: answer.type, sdp: answer.sdp } });

    // Listen for caller ICE candidates
    onSnapshot(collection(roomRef, 'callerCandidates'), (snap) => {
      snap.docChanges().forEach(async (change) => {
        if (change.type === 'added') await safeAdd(pc, change.doc.data());
      });
    });

    setVideoRoomId(roomId);
  };

  // ─── Hang Up ─────────────────────────────────────────────────────────────────
  const hangUp = async () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    peerConnectionRef.current?.close();

    peerConnectionRef.current = null;
    localStreamRef.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setVideoRoomId('');
    setHasLocalStream(false);
    setHasRemoteStream(false);
    setShowWebRTC(false);
    setIsCaller(false);
    setVideoJoinInput('');
    pendingCandidates.current = [];
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className='flex items-center justify-between bg-dark-layer-2 h-11 w-full'>

      {/* Language Selector */}
      <div className='flex items-center text-white ml-2'>
        {!loadingLanguages && (
          <select
            value={selectedLanguage?.id}
            onChange={(e) =>
              handleLanguageChange(languages.find(l => l.id === parseInt(e.target.value)))
            }
            className='px-2 py-1.5 rounded bg-dark-fill-3 text-dark-label-2 focus:outline-none'
          >
            {languages.map(lang => (
              <option key={lang.id} value={lang.id} className='bg-black'>
                {lang.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Action Buttons */}
      <div className='flex items-center m-2'>
        <button
          className='preferenceBtn group'
          onClick={() => setSettings({ ...settings, settingsModalIsOpen: true })}
        >
          <AiOutlineSetting className='h-4 w-4' />
          <div className='preferenceBtn-tooltip'>Settings</div>
        </button>

        <button className='preferenceBtn group' onClick={handleFullScreen}>
          {isFullScreen
            ? <AiOutlineFullscreenExit className='h-4 w-4' />
            : <AiOutlineFullscreen className='h-4 w-4' />
          }
          <div className='preferenceBtn-tooltip'>Full Screen</div>
        </button>

        <button className='preferenceBtn group' onClick={() => setIsModalOpen(true)}>
          <AiOutlineTeam className='h-4 w-4' />
          <div className='preferenceBtn-tooltip'>Collaborate</div>
        </button>

        <button className='preferenceBtn group' onClick={() => setShowWebRTC(true)}>
          <MdVideoCall className='h-5 w-5' />
          <div className='preferenceBtn-tooltip'>Video Call</div>
        </button>
      </div>

      {/* ── Video Call Modal ── */}
      {showWebRTC && (
        <div className='fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4'>
          <div className='bg-dark-layer-2 p-6 rounded-xl w-full max-w-sm border border-gray-700'>
            <h2 className='text-xl font-bold text-white text-center mb-6'>Video Collaboration</h2>

            <div className='flex flex-col gap-4'>
              <button
                className='w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'
                onClick={createRoom}
              >
                Create New Room
              </button>

              {videoRoomId && (
                <div className='p-3 bg-dark-fill-3 rounded text-center border border-gray-600'>
                  <p className='text-xs text-gray-400'>ROOM ID</p>
                  <p className='text-yellow-400 font-mono font-bold'>{videoRoomId}</p>
                </div>
              )}

              <div className='relative flex items-center py-2'>
                <div className='flex-grow border-t border-gray-700' />
                <span className='flex-shrink mx-4 text-gray-500 text-sm'>OR</span>
                <div className='flex-grow border-t border-gray-700' />
              </div>

              <input
                type='text'
                placeholder='Enter Room ID'
                className='p-2 bg-dark-fill-3 text-white rounded border border-gray-600 outline-none focus:border-blue-500'
                value={videoJoinInput}
                onChange={e => setVideoJoinInput(e.target.value)}
              />

              <button
                className='w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition'
                onClick={joinRoom}
              >
                Join Room
              </button>

              <button
                className='text-gray-400 text-sm hover:text-white transition mt-2'
                onClick={() => setShowWebRTC(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Video Bubbles ── */}
      {/* Videos are ALWAYS mounted so refs are valid when streams are assigned.
          Visibility is toggled via CSS to avoid ref-is-null race. */}
      <div className='pointer-events-none fixed inset-0 z-[9999]'>
        <video
          ref={localVideoRef}
          className='pointer-events-auto fixed bottom-5 right-5 w-32 h-32 md:w-40 md:h-40 bg-black rounded-full object-cover border-2 border-purple-500 shadow-2xl'
          autoPlay muted playsInline
          style={{ transform: 'scaleX(-1)', display: hasLocalStream ? 'block' : 'none' }}
        />
        <video
          ref={remoteVideoRef}
          className='pointer-events-auto fixed bottom-5 left-5 w-32 h-32 md:w-40 md:h-40 bg-black rounded-full object-cover border-2 border-blue-500 shadow-2xl'
          autoPlay playsInline
          style={{ display: hasRemoteStream ? 'block' : 'none' }}
        />
        {(hasLocalStream || hasRemoteStream) && (
          <button
            className='pointer-events-auto fixed bottom-5 left-1/2 -translate-x-1/2 p-3 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-xl'
            onClick={hangUp}
          >
            Hang Up
          </button>
        )}
      </div>

      {/* ── Code Collab Modal ── */}
      {isModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
          <div className='bg-dark-layer-2 p-6 rounded-xl w-full max-w-md relative'>
            <h2 className='text-2xl font-bold text-white text-center mb-4'>Collaborate in a Room</h2>

            <div className='flex flex-col space-y-4'>
              <div>
                <button
                  className='w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                  onClick={createCollabRoom}
                >
                  Create Room
                </button>
                {collabRoomId && (
                  <div className='mt-3 text-center text-white'>
                    <p>Room ID: <strong className='text-yellow-400'>{collabRoomId}</strong></p>
                    <div className='flex gap-2 justify-center mt-2'>
                      <button
                        className='py-1 px-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600'
                        onClick={copyCollabRoomId}
                      >
                        Copy ID
                      </button>
                      <button
                        className='py-1 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700'
                        onClick={joinCollabRoom}
                      >
                        Enter Room
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <hr className='border-gray-600' />

              <div className='flex flex-col space-y-2'>
                <p className='text-gray-400 text-sm'>Or join an existing room:</p>
                <input
                  type='text'
                  placeholder='Enter Room ID'
                  className='p-2 bg-dark-fill-3 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500'
                  value={collabRoomId}
                  onChange={e => setCollabRoomId(e.target.value)}
                />
                <button
                  className='py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700'
                  onClick={joinCollabRoom}
                >
                  Join Room
                </button>
              </div>
            </div>

            <button
              className='absolute top-3 right-4 text-white text-xl hover:text-gray-300'
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── Settings Modal ── */}
      {settings.settingsModalIsOpen && (
        <SettingsModal settings={settings} setSettings={setSettings} />
      )}
    </div>
  );
}


// import React, { useState, useRef } from 'react';
// import { MdVideoCall } from "react-icons/md";
// import { toast } from 'react-toastify';
// import { db } from '../firebaseConfig';
// import {
//   collection, doc, setDoc, addDoc, updateDoc,
//   onSnapshot, getDoc
// } from 'firebase/firestore';

// const configuration = {
//   iceServers: [
//     { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
//     {
//       urls: 'turn:openrelay.metered.ca:80',
//       username: 'openrelayproject',
//       credential: 'openrelayproject',
//     },
//   ],
// };

// export default function PreferenceNav() {
//   const [videoRoomId, setVideoRoomId] = useState("");
//   const [videoJoinInput, setVideoJoinInput] = useState("");
//   const [showWebRTC, setShowWebRTC] = useState(false);

//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const peerConnectionRef = useRef(null);

//   const pendingCandidates = useRef([]);

//   const flushPending = async (pc) => {
//     for (const c of pendingCandidates.current) {
//       await pc.addIceCandidate(new RTCIceCandidate(c));
//     }
//     pendingCandidates.current = [];
//   };

//   const safeAdd = async (pc, data) => {
//     if (!pc.remoteDescription) {
//       pendingCandidates.current.push(data);
//     } else {
//       await pc.addIceCandidate(new RTCIceCandidate(data));
//     }
//   };

//   const openMedia = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//     localStreamRef.current = stream;
//     localVideoRef.current.srcObject = stream;
//     return stream;
//   };

//   // ================= CREATE ROOM =================
//   const createRoom = async () => {
//     console.log("🚀 Creating room");

//     const stream = localStreamRef.current || await openMedia();

//     const roomRef = doc(collection(db, 'rooms'));

//     const pc = new RTCPeerConnection(configuration);
//     peerConnectionRef.current = pc;

//     stream.getTracks().forEach(track => pc.addTrack(track, stream));

//     pc.ontrack = (event) => {
//       console.log("📡 Remote stream received");
//       remoteVideoRef.current.srcObject = event.streams[0];
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         addDoc(collection(roomRef, 'callerCandidates'), event.candidate.toJSON());
//       }
//     };

//     pc.oniceconnectionstatechange = () => {
//       console.log("ICE:", pc.iceConnectionState);
//     };

//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);

//     await setDoc(roomRef, {
//       offer: { type: offer.type, sdp: offer.sdp }
//     });

//     console.log("🔥 Room created:", roomRef.id);
//     setVideoRoomId(roomRef.id);

//     // listen answer
//     onSnapshot(roomRef, async (snap) => {
//       const data = snap.data();
//       if (data?.answer && !pc.currentRemoteDescription) {
//         await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
//         await flushPending(pc);
//       }
//     });

//     // listen callee ICE
//     onSnapshot(collection(roomRef, 'calleeCandidates'), (snap) => {
//       snap.docChanges().forEach(async (change) => {
//         if (change.type === 'added') {
//           await safeAdd(pc, change.doc.data());
//         }
//       });
//     });
//   };

//   // ================= JOIN ROOM =================
//   const joinRoom = async () => {
//     const roomId = videoJoinInput.trim();
//     if (!roomId) return;

//     console.log("🔗 Joining:", roomId);

//     const stream = localStreamRef.current || await openMedia();

//     const roomRef = doc(db, 'rooms', roomId);
//     const snap = await getDoc(roomRef);

//     if (!snap.exists()) {
//       toast.error("Room not found");
//       return;
//     }

//     const pc = new RTCPeerConnection(configuration);
//     peerConnectionRef.current = pc;

//     stream.getTracks().forEach(track => pc.addTrack(track, stream));

//     pc.ontrack = (event) => {
//       console.log("📡 Remote stream received");
//       remoteVideoRef.current.srcObject = event.streams[0];
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         addDoc(collection(roomRef, 'calleeCandidates'), event.candidate.toJSON());
//       }
//     };

//     const data = snap.data();

//     await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
//     await flushPending(pc);

//     const answer = await pc.createAnswer();
//     await pc.setLocalDescription(answer);

//     await updateDoc(roomRef, {
//       answer: { type: answer.type, sdp: answer.sdp }
//     });

//     // listen caller ICE
//     onSnapshot(collection(roomRef, 'callerCandidates'), (snap) => {
//       snap.docChanges().forEach(async (change) => {
//         if (change.type === 'added') {
//           await safeAdd(pc, change.doc.data());
//         }
//       });
//     });
//   };

//   return (
//     <div>
//       <button onClick={() => setShowWebRTC(true)}>
//         <MdVideoCall size={30} />
//       </button>

//       {showWebRTC && (
//         <div>
//           <button onClick={createRoom}>Create Room</button>

//           {videoRoomId && <p>Room ID: {videoRoomId}</p>}

//           <input
//             placeholder="Enter Room ID"
//             value={videoJoinInput}
//             onChange={(e) => setVideoJoinInput(e.target.value)}
//           />

//           <button onClick={joinRoom}>Join</button>
//         </div>
//       )}

//       {/* Videos */}
//       <video ref={localVideoRef} autoPlay muted playsInline style={{ width: 200 }} />
//       <video ref={remoteVideoRef} autoPlay playsInline style={{ width: 200 }} />
//     </div>
//   );
// }