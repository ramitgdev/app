import React, { useState, useRef } from 'react';

export default function AudioRecorder({ onUpload, resourceId, currentUser }) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [error, setError] = useState(null);
  const audioRef = useRef();

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new window.MediaRecorder(stream);
      let chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      setError('Microphone access denied or not available.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const handleUpload = async () => {
    if (!audioBlob) return;
    if (onUpload) {
      await onUpload(audioBlob, resourceId, currentUser);
      setAudioBlob(null);
      setAudioUrl(null);
    }
  };

  return (
    <div style={{ margin: '1em 0' }}>
      <div>
        {!recording && <button onClick={startRecording}>Record Audio</button>}
        {recording && <button onClick={stopRecording}>Stop</button>}
      </div>
      {audioUrl && (
        <div>
          <audio ref={audioRef} src={audioUrl} controls style={{ verticalAlign: 'middle' }} />
          <button onClick={handleUpload} style={{ marginLeft: 8 }}>Upload</button>
        </div>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
} 