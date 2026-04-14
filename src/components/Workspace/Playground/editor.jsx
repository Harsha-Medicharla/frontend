import React, { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { yCollab } from "y-codemirror";
import { useParams } from "react-router-dom";
import { saveCodeToFirestore, loadCodeFromFirestore } from '../../crdt/firebaseconfig'
import { EditorView } from "@codemirror/view";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";

function CollabCodeEditor({ userCode, setUserCode }) {
  const { roomId } = useParams();
  const editorRef = useRef(null);
  const providerRef = useRef(null);
  const ydocRef = useRef(null);
  const [isFirstUser, setIsFirstUser] = useState(false);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new WebrtcProvider(roomId, ydoc, {
      signaling: ["wss://y-webrtc.fly.dev"],
    });
    const yText = ydoc.getText("codemirror");

    providerRef.current = provider;
    ydocRef.current = ydoc;

    setTimeout(() => {
      if (provider.awareness.states.size === 1) {
        setIsFirstUser(true);
        loadCodeFromFirestore(roomId).then((savedCode) => {
          if (savedCode && savedCode.trim() !== "" && yText.toString().trim() === "") {
            yText.insert(0, savedCode);
          }
        });
      }
    }, 2000);

    provider.awareness.setLocalStateField("user", {
      name: "User " + Math.floor(Math.random() * 100),
    });

    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, [roomId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isFirstUser) {
        saveCodeToFirestore(roomId, userCode);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [roomId, isFirstUser, userCode]);

  return (
    <div className="w-full h-screen p-4 bg-gray-900 text-white flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Collaborative Code Editor</h2>

      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={userCode}
          onChange={(newCode) => setUserCode(newCode)}
          theme={vscodeDark}
          extensions={[
            cpp(),
            yCollab(ydocRef.current.getText("codemirror"), providerRef.current.awareness),
            EditorView.lineWrapping,
          ]}
          basicSetup={{ lineNumbers: true }}
          style={{ fontSize: "16px", height: "100%" }}
        />
      </div>
    </div>
  );
}

export default CollabCodeEditor;
