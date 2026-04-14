// CodeEditor.js

import React, { useEffect, useRef, useState } from 'react';
import Editor from "@monaco-editor/react";
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { MonacoBinding } from 'y-monaco';
import { loadCodeFromFirestore, saveCodeToFirestore } from "./firebaseConfig";
import _ from 'lodash';
import "./CodeEditor.css";

function CodeEditor({ userCode, setUserCode, problem }) {
  const roomId = localStorage.getItem("roomId");
  const editorRef = useRef(null);
  const providerRef = useRef(null);
  const ydocRef = useRef(null);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const language = localStorage.getItem('selectedLanguage') || 'cpp'; // default fallback

  // Track the previous code to detect changes
  const [lastSavedCode, setLastSavedCode] = useState(userCode);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new WebrtcProvider(roomId, ydoc, {
      signaling: ["wss://y-webrtc.fly.dev"],
    });
    const yText = ydoc.getText("monaco");

    providerRef.current = provider;
    ydocRef.current = ydoc;

    // Check if user is first to join and load code from Firestore
    setTimeout(() => {
      if (provider.awareness.states.size === 1) {
        setIsFirstUser(true);
        loadCodeFromFirestore(roomId).then((savedCode) => {
          if (savedCode && savedCode.trim() !== "" && yText.toString().trim() === "") {
            yText.insert(0, savedCode);  // Insert saved code only if empty
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

  // Handle editor mount and synchronization with YJS
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    const yText = ydocRef.current.getText("monaco");
    new MonacoBinding(yText, editor.getModel(), new Set([editor]));
    monaco.editor.setModelLanguage(editor.getModel(), language);
  };

  // Save code to Firestore, but prevent redundant saves with debounce
  const debounceSave = useRef(_.debounce((code) => {
    if (code !== lastSavedCode) {
      saveCodeToFirestore(roomId, code);
      setLastSavedCode(code);  // Update the saved code after successful save
    }
  }, 2000)); // Debounce time of 2 seconds

  useEffect(() => {
    if (isFirstUser && editorRef.current) {
      debounceSave.current(editorRef.current.getValue());
    }
  }, [userCode, roomId, isFirstUser]);

  // Handle editor content change
  const handleChange = (value) => {
    setUserCode(value);
    localStorage.setItem(`code-${problem.id}`, JSON.stringify(value)); // Save locally
  };

  return (
    <div className="editor-container">
      <Editor
        height="100%"
        width="100%"
        theme="vs-dark"
        language={language}
        defaultValue={userCode || "// Start coding..."}
        onMount={handleEditorDidMount}
        onChange={handleChange}
      />
    </div>
  );
}

export default CodeEditor;
