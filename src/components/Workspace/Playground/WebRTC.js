import React, { useState, useRef, useEffect } from 'react';
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
import { db } from './firebaseConfig';

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

const WebRTCComponent = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [roomId, setRoomId] = useState('');
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

  // Create a room (caller)
  const createRoom = async () => {
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
    setRoomId(roomRef.id);
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
    setRoomId(joinRoomId);
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
    document.title = `CodeCraft - Room: ${joinRoomId} (Callee)`;
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
    if (roomId && isCaller) {
      const roomRef = doc(db, 'rooms', roomId);
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
    setRoomId('');
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

  return (
    <div>
      <h1>Codecraft LiveConnect: Collaborate, Discuss, and Code Together</h1>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={openUserMedia}>Open Camera &amp; Mic</button>
        <button onClick={createRoom} disabled={!localStream}>Create Room</button>
        <button onClick={() => setIsDialogOpen(true)} disabled={!localStream}>
          Join Room
        </button>
        <button onClick={hangUp} disabled={!localStream}>Hangup</button>
      </div>
      <div>
        <span>Current Room: {roomId}</span>
      </div>

      {/* Floating video elements in oval shape at bottom left and right */}
      <video
        ref={remoteVideoRef}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          width: '150px',
          height: '150px',
          backgroundColor: 'black',
          borderRadius: '50%',
          objectFit: 'cover',
          zIndex: 9999
        }}
        autoPlay
        playsInline
      ></video>
      <video
        ref={localVideoRef}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '150px',
          height: '150px',
          backgroundColor: 'black',
          borderRadius: '50%',
          transform: 'scaleX(-1)',
          objectFit: 'cover',
          zIndex: 9999
        }}
        autoPlay
        muted
        playsInline
      ></video>

      {/* Centered join room modal */}
      {isDialogOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '300px',
              textAlign: 'center',
            }}
          >
            <h2>Join Room</h2>
            <input
              type="text"
              placeholder="Enter Room ID"
              style={{ width: '100%', padding: '8px', marginTop: '10px' }}
              onChange={(e) => setJoinRoomId(e.target.value)}
            />
            <div
              style={{
                marginTop: '20px',
                display: 'flex',
                justifyContent: 'space-around',
              }}
            >
              <button onClick={confirmJoinRoom}>Join</button>
              <button onClick={() => setIsDialogOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebRTCComponent;
