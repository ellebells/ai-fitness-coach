import { useState, useRef } from 'react';
import axios from 'axios';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  // --- NEW: State will now hold the entire command object ---
  const [command, setCommand] = useState(null); 
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startListening = async () => {
    if (isListening) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        try {
          const response = await axios.post('http://localhost:5000/api/speech', audioBlob, {
            headers: { 'Content-Type': 'application/octet-stream' },
          });
          // --- NEW: Set the entire command object ---
          setCommand(response.data); 
        } catch (error) {
          console.error('Error sending audio to backend:', error);
          setCommand({ intent: "ERROR", transcription: 'Error processing command.' });
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
      setCommand({ transcription: 'Listening...' }); // Initial feedback

      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsListening(false);
        }
      }, 5000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setCommand({ intent: "ERROR", transcription: 'Microphone access denied.' });
    }
  };

  // No stopListening function needed as it's handled by the timeout
  
  // --- NEW: Return the command object ---
  return { isListening, command, startListening }; 
};