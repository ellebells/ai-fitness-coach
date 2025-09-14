import os
import json
import wave
import io
from flask import Flask, jsonify, request
from flask_cors import CORS
from vosk import Model, KaldiRecognizer
from pydub import AudioSegment
from transformers import pipeline

# --- App Initialization ---
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# --- Load Models ---
# Vosk (Speech-to-Text)
model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models/vosk-model")
vosk_model = Model(model_path)
print("Vosk model loaded successfully.")

# Intent Classification Model
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
print("Intent classification model loaded successfully.")

# --- Define Intents and Entities ---
INTENT_LABELS = ["start workout", "stop workout", "switch exercise", "skip exercise", "add rest"]
EXERCISE_ENTITIES = [
    'plank', 'push up', 'squat', 'bridge', 'bird dog', 
    'high knees', 'lunges', 'superman', 'wall sit'
]

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/api/speech', methods=['POST'])
def recognize_speech():
    audio_blob = request.data
    try:
        audio = AudioSegment.from_file(io.BytesIO(audio_blob))
        audio = audio.set_channels(1).set_frame_rate(16000)
        
        wav_io = io.BytesIO()
        audio.export(wav_io, format="wav")
        wav_io.seek(0)

        with wave.open(wav_io, "rb") as wf:
            rec = KaldiRecognizer(vosk_model, wf.getframerate())
            rec.SetWords(True)
            
            while True:
                data = wf.readframes(4000)
                if len(data) == 0:
                    break
                rec.AcceptWaveform(data)

            result = json.loads(rec.FinalResult())
            transcribed_text = result.get('text', '')
            
            # --- NEW: Debugging Line ---
            print(f"VOSK RAW TRANSCRIPTION: '{transcribed_text}'")
            # ---------------------------

        if not transcribed_text:
            return jsonify({"intent": "UNKNOWN", "entity": None, "transcription": ""})

        intent_result = classifier(transcribed_text, INTENT_LABELS)
        if isinstance(intent_result, dict) and 'labels' in intent_result and intent_result['labels']:
            best_intent = intent_result['labels'][0]
        else:
            best_intent = "unknown"

        entity = None
        if best_intent == "switch exercise":
            entity_result = classifier(transcribed_text, EXERCISE_ENTITIES)
            if isinstance(entity_result, dict) and 'labels' in entity_result and entity_result['labels']:
                entity = entity_result['labels'][0].replace('-', ' ').title()

        response = {
            "intent": best_intent.upper().replace(" ", "_"),
            "entity": entity,
            "transcription": transcribed_text
        }
        return jsonify(response)

    except Exception as e:
        print(f"Error processing audio: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

