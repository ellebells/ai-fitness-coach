import { useState, useRef } from 'react';
import axios from 'axios';

/**
 * A custom React hook to manage the entire speech recognition flow.
 * It handles microphone access, recording, sending audio to the backend,
 * and managing the state of the transcription process.
 */
export const useSpeechRecognition = () => {
  // State to track if the microphone is currently recording
  const [isListening, setIsListening] = useState(false);
  // State to hold the final command object from the backend (intent, entity, etc.)
  const [command, setCommand] = useState(null); 
  
  // Refs to hold the MediaRecorder instance and the recorded audio chunks
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  /**
   * The main function to start the voice command process.
   */
  const startListening = async () => {
    // Prevent starting a new recording if one is already in progress
    if (isListening) return;

    try {
      // Request access to the user's microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      // This event fires whenever a chunk of audio is ready
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      // This event fires when the recording is stopped
      mediaRecorderRef.current.onstop = async () => {
        // Provide immediate feedback that the AI is thinking
        setCommand({ transcription: 'Processing...' });
        
        // Combine all recorded audio chunks into a single Blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        console.log('Sending audio to backend, blob size:', audioBlob.size);
        
        try {
          // Send the audio blob to our backend API endpoint
          console.log('Making request to backend...');
          const response = await axios.post('http://localhost:5000/api/speech', audioBlob, {
            headers: { 'Content-Type': 'application/octet-stream' },
          });
          console.log('Backend response:', response.data);
          // On success, update the state with the structured command from the AI
          setCommand(response.data); 
        } catch (error) {
          console.error('Error sending audio to backend:', error);
          console.error('Error details:', error.response?.data);
          setCommand({ intent: "ERROR", transcription: 'Error processing command.' });
        }
        
        // Clean up: turn off the microphone light and release the track
        stream.getTracks().forEach(track => track.stop());
        setIsListening(false);
      };

      // Start the recording process
      mediaRecorderRef.current.start();
      setIsListening(true);
      setCommand({ transcription: 'Listening...' }); // Initial feedback

      // Set a timer to automatically stop the recording after 5 seconds (increased for better capture)
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
      }, 5000); // Increased from 3 to 5 seconds

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setCommand({ intent: "ERROR", transcription: 'Microphone access denied.' });
      setIsListening(false);
    }
  };
  
  /**
   * Function to clear the current command
   */
  const clearCommand = () => {
    setCommand(null);
  };
  
  // Expose the necessary state and functions to the component that uses this hook
  return { isListening, command, startListening, clearCommand }; 
};

