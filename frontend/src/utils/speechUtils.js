// A simple utility to speak text using the browser's Web Speech API

export const speak = (text) => {
    // Check if the browser supports speech synthesis
    if ('speechSynthesis' in window) {
        // Stop any currently speaking utterance to prevent overlap
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1; // Slightly faster than normal
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    } else {
        console.warn("Speech synthesis is not supported by this browser.");
    }
};
